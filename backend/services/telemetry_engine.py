"""Telemetry Engine service for real-time data translation and analysis.

Provides plain-English telemetry translation, trend classification,
and actionable recommendations from spacecraft subsystem data.
"""

import asyncio
import logging
import random
import uuid
from collections import deque
from datetime import datetime

from backend.models.enums import SeverityLevel, severity_from_score
from backend.models.shared import GraniteAttribution
from backend.models.telemetry import (
    Recommendation,
    TelemetryDataPoint,
    TelemetryInsight,
    TrendClassification,
)

logger = logging.getLogger(__name__)

GENERATION_TIMEOUT = 30.0
MAX_HISTORY_POINTS = 60

# Starliner-like subsystem parameter definitions
SUBSYSTEM_PARAMS = {
    "rcs_thruster_b1r_pct": {"unit": "%", "nominal": 100.0, "subsystem": "RCS", "label": "RCS Thruster B1R Thrust"},
    "rcs_thruster_b2r_pct": {"unit": "%", "nominal": 100.0, "subsystem": "RCS", "label": "RCS Thruster B2R Thrust"},
    "rcs_thruster_b3r_pct": {"unit": "%", "nominal": 100.0, "subsystem": "RCS", "label": "RCS Thruster B3R Thrust"},
    "rcs_thruster_f1l_pct": {"unit": "%", "nominal": 100.0, "subsystem": "RCS", "label": "RCS Thruster F1L Thrust"},
    "helium_manifold_a_psi": {"unit": "psi", "nominal": 4200.0, "subsystem": "Helium Pressurization", "label": "Helium Manifold A Pressure"},
    "helium_manifold_b_psi": {"unit": "psi", "nominal": 4200.0, "subsystem": "Helium Pressurization", "label": "Helium Manifold B Pressure"},
    "helium_tank_temp_f": {"unit": "°F", "nominal": 72.0, "subsystem": "Helium Pressurization", "label": "Helium Tank Temperature"},
    "cabin_pressure_psi": {"unit": "psi", "nominal": 14.7, "subsystem": "ECLSS", "label": "Cabin Pressure"},
    "cabin_temperature_f": {"unit": "°F", "nominal": 72.0, "subsystem": "ECLSS", "label": "Cabin Temperature"},
    "o2_partial_pressure_mmhg": {"unit": "mmHg", "nominal": 160.0, "subsystem": "ECLSS", "label": "O2 Partial Pressure"},
    "co2_level_mmhg": {"unit": "mmHg", "nominal": 3.0, "subsystem": "ECLSS", "label": "CO2 Level"},
    "humidity_pct": {"unit": "%", "nominal": 45.0, "subsystem": "ECLSS", "label": "Cabin Humidity"},
    "main_bus_voltage_v": {"unit": "V", "nominal": 28.5, "subsystem": "EPS", "label": "Main Bus Voltage"},
    "battery_soc_pct": {"unit": "%", "nominal": 95.0, "subsystem": "EPS", "label": "Battery State of Charge"},
    "solar_array_current_a": {"unit": "A", "nominal": 6.5, "subsystem": "EPS", "label": "Solar Array Current"},
    "coolant_loop_temp_f": {"unit": "°F", "nominal": 40.0, "subsystem": "TCS", "label": "Coolant Loop Temperature"},
    "radiator_outlet_temp_f": {"unit": "°F", "nominal": 35.0, "subsystem": "TCS", "label": "Radiator Outlet Temperature"},
    "avionics_temp_f": {"unit": "°F", "nominal": 75.0, "subsystem": "TCS", "label": "Avionics Bay Temperature"},
    "imu_drift_deg_hr": {"unit": "°/hr", "nominal": 0.001, "subsystem": "GNC", "label": "IMU Drift Rate"},
    "star_tracker_quaternion_err": {"unit": "arcsec", "nominal": 0.5, "subsystem": "GNC", "label": "Star Tracker Error"},
    "reaction_wheel_speed_rpm": {"unit": "RPM", "nominal": 2000.0, "subsystem": "GNC", "label": "Reaction Wheel Speed"},
}


class TelemetryEngineService:
    """Real-time telemetry translation and analysis engine.

    Maintains rolling history per parameter, provides trend classification,
    and generates actionable recommendations using AI.
    """

    def __init__(self, granite_client) -> None:
        self._granite = granite_client
        self._history: dict[str, deque] = {}
        self._initialize_history()

    def _initialize_history(self) -> None:
        """Pre-populate history with simulated nominal data + Starliner degradation."""
        now = datetime.utcnow()

        for param_name, param_info in SUBSYSTEM_PARAMS.items():
            history = deque(maxlen=MAX_HISTORY_POINTS)
            nominal = param_info["nominal"]

            # Generate 60 points of history
            for i in range(60):
                # Normal jitter
                jitter = random.gauss(0, nominal * 0.01)
                value = nominal + jitter

                # Simulate Starliner thruster degradation for specific params
                if "thruster_b" in param_name and i > 40:
                    degradation = (i - 40) * (nominal * 0.03)
                    value = max(0, nominal - degradation)
                elif "helium_manifold" in param_name and i > 45:
                    leak_rate = (i - 45) * 50
                    value = nominal - leak_rate

                history.append({
                    "timestamp": (now - __import__("datetime").timedelta(minutes=60 - i)).isoformat(),
                    "value": round(value, 3),
                    "parameter": param_name,
                })

            self._history[param_name] = history

        logger.info("Telemetry history initialized | parameters=%d", len(self._history))

    def translate(self, data_point: dict) -> dict:
        """Convert raw telemetry to plain-English summary.

        Args:
            data_point: Dict with parameter, value, and optional timestamp.

        Returns:
            Dict with human-readable translation.
        """
        parameter = data_point.get("parameter", "")
        value = data_point.get("value", 0.0)
        timestamp = data_point.get("timestamp", datetime.utcnow().isoformat())

        param_info = SUBSYSTEM_PARAMS.get(parameter, {})
        label = param_info.get("label", parameter)
        unit = param_info.get("unit", "")
        nominal = param_info.get("nominal", value)
        subsystem = param_info.get("subsystem", "Unknown")

        # Store in history
        history = self._history.setdefault(parameter, deque(maxlen=MAX_HISTORY_POINTS))
        history.append({"timestamp": timestamp, "value": value, "parameter": parameter})

        # Determine status
        deviation_pct = abs(value - nominal) / max(nominal, 0.001) * 100
        if deviation_pct < 5:
            status = "nominal"
            status_text = "within normal operating range"
        elif deviation_pct < 15:
            status = "advisory"
            status_text = f"{deviation_pct:.1f}% deviation from nominal"
        elif deviation_pct < 30:
            status = "warning"
            status_text = f"significant deviation ({deviation_pct:.1f}%) from nominal"
        else:
            status = "critical"
            status_text = f"CRITICAL deviation ({deviation_pct:.1f}%) from nominal"

        # Plain English translation
        if value == 0 and nominal > 0:
            plain_english = f"{label} is reading zero - possible sensor failure or complete system shutdown."
        elif value < nominal * 0.5 and nominal > 0:
            plain_english = (
                f"{label} is at {value:.1f} {unit}, which is less than half the expected "
                f"value of {nominal:.1f} {unit}. This indicates severe degradation of the "
                f"{subsystem} subsystem."
            )
        elif deviation_pct > 15:
            direction = "above" if value > nominal else "below"
            plain_english = (
                f"{label} is reading {value:.1f} {unit}, which is {deviation_pct:.1f}% "
                f"{direction} the nominal value of {nominal:.1f} {unit}. The {subsystem} "
                f"subsystem should be monitored closely."
            )
        else:
            plain_english = (
                f"{label} is at {value:.1f} {unit}, operating normally within "
                f"{deviation_pct:.1f}% of nominal ({nominal:.1f} {unit})."
            )

        return {
            "parameter": parameter,
            "value": value,
            "unit": unit,
            "subsystem": subsystem,
            "label": label,
            "nominal": nominal,
            "deviation_pct": round(deviation_pct, 2),
            "status": status,
            "plain_english": plain_english,
            "timestamp": timestamp,
        }

    def classify_trend(self, parameter: str) -> dict:
        """Classify a parameter's trend as improving/stable/degrading.

        Args:
            parameter: Parameter name to analyze.

        Returns:
            Dict with trend classification data.
        """
        history = self._history.get(parameter, deque())
        param_info = SUBSYSTEM_PARAMS.get(parameter, {})
        nominal = param_info.get("nominal", 0.0)
        label = param_info.get("label", parameter)

        if len(history) < 3:
            return {
                "parameter": parameter,
                "label": label,
                "direction": "stable",
                "rate_of_change": 0.0,
                "data_points_analyzed": len(history),
                "confidence": 0.3,
                "message": "Insufficient data for trend analysis",
            }

        # Calculate trend from last N points
        values = [p["value"] for p in history]
        recent = values[-10:] if len(values) >= 10 else values
        n = len(recent)

        # Simple linear regression
        x_mean = (n - 1) / 2.0
        y_mean = sum(recent) / n
        numerator = sum((i - x_mean) * (recent[i] - y_mean) for i in range(n))
        denominator = sum((i - x_mean) ** 2 for i in range(n))
        slope = numerator / denominator if denominator != 0 else 0.0

        # Normalize slope relative to nominal
        rate_normalized = slope / max(abs(nominal), 0.001)

        # Classify direction
        if abs(rate_normalized) < 0.005:
            direction = "stable"
        elif rate_normalized > 0:
            # Moving toward nominal is improving
            if recent[-1] < nominal:
                direction = "improving"
            else:
                direction = "degrading"
        else:
            if recent[-1] > nominal:
                direction = "improving"
            else:
                direction = "degrading"

        # Confidence based on data consistency
        variance = sum((v - y_mean) ** 2 for v in recent) / n
        std_dev = variance ** 0.5
        confidence = min(0.95, max(0.4, 1.0 - (std_dev / max(abs(nominal), 0.001))))

        return {
            "parameter": parameter,
            "label": label,
            "direction": direction,
            "rate_of_change": round(slope, 4),
            "rate_normalized": round(rate_normalized, 6),
            "data_points_analyzed": len(values),
            "confidence": round(confidence, 3),
            "current_value": round(recent[-1], 3),
            "nominal_value": nominal,
            "message": f"{label} trend is {direction} (rate: {slope:.4f} per sample)",
        }

    async def generate_recommendation(self, parameter: str, condition: str) -> dict:
        """Generate actionable recommendation for a telemetry condition.

        Args:
            parameter: Parameter name.
            condition: Description of the condition or anomaly.

        Returns:
            Dict with recommendation details.
        """
        param_info = SUBSYSTEM_PARAMS.get(parameter, {})
        label = param_info.get("label", parameter)
        subsystem = param_info.get("subsystem", "Unknown")

        prompt = (
            f"You are a spacecraft systems engineer. The {label} ({subsystem} subsystem) "
            f"is showing: {condition}. Provide a concise recommendation with:\n"
            f"1. Possible root causes\n2. Immediate actions\n3. Monitoring guidance"
        )

        try:
            response = await asyncio.wait_for(
                self._granite.generate(prompt, category="telemetry"),
                timeout=GENERATION_TIMEOUT,
            )
            ai_text = response.content
        except (asyncio.TimeoutError, Exception) as exc:
            logger.warning("Telemetry recommendation AI failed (%s)", exc)
            ai_text = None

        # Rule-based recommendations as primary/fallback
        recommendations = self._get_rule_based_recommendations(parameter, condition)

        attribution = GraniteAttribution(
            model_name="ibm/granite-13b-chat-v2",
            model_version="2.0",
            provider=self._granite.get_active_provider(),
            badge_text="Powered by IBM Granite",
        )

        return {
            "parameter": parameter,
            "label": label,
            "subsystem": subsystem,
            "condition": condition,
            "ai_analysis": ai_text or "AI analysis unavailable; rule-based recommendations provided.",
            "recommendations": recommendations,
            "attribution": attribution.model_dump(),
        }

    def get_current_telemetry(self) -> list[dict]:
        """Get current state of all telemetry parameters."""
        results = []
        for param_name, history in self._history.items():
            if history:
                latest = history[-1]
                param_info = SUBSYSTEM_PARAMS.get(param_name, {})
                results.append({
                    "parameter": param_name,
                    "value": latest["value"],
                    "unit": param_info.get("unit", ""),
                    "subsystem": param_info.get("subsystem", "Unknown"),
                    "label": param_info.get("label", param_name),
                    "timestamp": latest["timestamp"],
                })
        return results

    def simulate_telemetry_tick(self) -> list[dict]:
        """Generate one tick of simulated telemetry data (Starliner-like)."""
        now = datetime.utcnow()
        tick_data = []

        for param_name, param_info in SUBSYSTEM_PARAMS.items():
            nominal = param_info["nominal"]
            history = self._history.get(param_name, deque(maxlen=MAX_HISTORY_POINTS))

            last_value = history[-1]["value"] if history else nominal

            # Add realistic noise and drift
            noise = random.gauss(0, nominal * 0.005)
            drift = 0.0

            # Simulate ongoing degradation for thruster params
            if "thruster_b" in param_name:
                drift = -random.uniform(0, nominal * 0.02)
            elif "helium_manifold" in param_name:
                drift = -random.uniform(0, 5.0)  # Slow leak

            new_value = max(0, last_value + noise + drift)
            point = {
                "timestamp": now.isoformat(),
                "value": round(new_value, 3),
                "parameter": param_name,
            }
            history.append(point)
            self._history[param_name] = history
            tick_data.append(point)

        return tick_data

    def _get_rule_based_recommendations(self, parameter: str, condition: str) -> list[dict]:
        """Generate rule-based recommendations."""
        recs = []
        condition_lower = condition.lower()

        if "thruster" in parameter or "rcs" in parameter:
            recs.append({
                "condition": "RCS thruster performance degradation",
                "possible_causes": [
                    "Overheating of thruster valve seats from extended firing",
                    "Propellant contamination in fuel lines",
                    "Oxidizer injector thermal damage",
                    "Helium ingestion from pressurant system leak",
                ],
                "suggested_actions": [
                    "Inhibit affected thruster and switch to redundant unit",
                    "Monitor adjacent thruster temperatures",
                    "Evaluate deorbit capability with remaining thrusters",
                    "Consider early undock if multiple failures progress",
                ],
            })
        elif "helium" in parameter:
            recs.append({
                "condition": "Helium pressurization system anomaly",
                "possible_causes": [
                    "Flange seal degradation from thermal cycling",
                    "Fitting torque relaxation over mission duration",
                    "Microcrack in manifold weld joint",
                    "O-ring material incompatibility with propellant vapors",
                ],
                "suggested_actions": [
                    "Isolate leaking manifold if possible",
                    "Calculate remaining helium budget for mission timeline",
                    "Assess thruster operability without full pressurization",
                    "Plan contingency undock timeline if leak rate increases",
                ],
            })
        elif "cabin" in parameter or "o2" in parameter or "co2" in parameter:
            recs.append({
                "condition": "ECLSS parameter deviation",
                "possible_causes": [
                    "CO2 scrubber saturation or degradation",
                    "Cabin leak from micrometeorite impact",
                    "Ventilation system fan failure",
                    "Metabolic rate change from crew activity",
                ],
                "suggested_actions": [
                    "Switch to backup CO2 removal assembly if available",
                    "Monitor crew O2 consumption rate",
                    "Verify cabin leak rate with pressure decay test",
                    "Adjust crew activity level if CO2 rising",
                ],
            })
        else:
            recs.append({
                "condition": condition,
                "possible_causes": [
                    "Sensor degradation or calibration drift",
                    "Subsystem component aging",
                    "Thermal environment exceeding design margins",
                ],
                "suggested_actions": [
                    "Cross-check with redundant sensors if available",
                    "Increase monitoring frequency",
                    "Prepare contingency procedures for further degradation",
                ],
            })

        return recs
