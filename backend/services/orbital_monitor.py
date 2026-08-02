"""Orbital Monitor service for space situational awareness.

Provides tracked object catalog, conjunction assessment,
and collision risk analysis using pre-computed orbital data.
"""

import asyncio
import logging
import math
import random
import uuid
from datetime import datetime, timedelta

from backend.models.enums import SeverityLevel, severity_from_score
from backend.models.shared import GraniteAttribution

logger = logging.getLogger(__name__)

# Pre-computed sample orbital objects (realistic parameters, no SGP4 needed)
SAMPLE_OBJECTS = [
    {"id": "25544", "name": "ISS (ZARYA)", "type": "payload", "inclination_deg": 51.64, "apogee_km": 422.0, "perigee_km": 418.0, "x": 4200.0, "y": 2800.0, "z": 3600.0},
    {"id": "20580", "name": "Hubble Space Telescope", "type": "payload", "inclination_deg": 28.47, "apogee_km": 539.0, "perigee_km": 535.0, "x": 5100.0, "y": 1200.0, "z": 3100.0},
    {"id": "48274", "name": "Starlink-2305", "type": "payload", "inclination_deg": 53.05, "apogee_km": 550.0, "perigee_km": 549.0, "x": 4900.0, "y": 2100.0, "z": 3800.0},
    {"id": "48275", "name": "Starlink-2306", "type": "payload", "inclination_deg": 53.05, "apogee_km": 550.0, "perigee_km": 549.0, "x": 4910.0, "y": 2090.0, "z": 3790.0},
    {"id": "48276", "name": "Starlink-2307", "type": "payload", "inclination_deg": 53.05, "apogee_km": 551.0, "perigee_km": 549.0, "x": 4920.0, "y": 2080.0, "z": 3810.0},
    {"id": "43013", "name": "Starlink-1007", "type": "payload", "inclination_deg": 53.00, "apogee_km": 555.0, "perigee_km": 553.0, "x": 4850.0, "y": 2200.0, "z": 3750.0},
    {"id": "49445", "name": "OneWeb-0350", "type": "payload", "inclination_deg": 87.40, "apogee_km": 1200.0, "perigee_km": 1198.0, "x": 3200.0, "y": 4100.0, "z": 5200.0},
    {"id": "54216", "name": "Starliner Calypso", "type": "payload", "inclination_deg": 51.64, "apogee_km": 420.0, "perigee_km": 416.0, "x": 4195.0, "y": 2810.0, "z": 3590.0},
    {"id": "44713", "name": "CZ-5B R/B (2020)", "type": "rocket_body", "inclination_deg": 41.47, "apogee_km": 360.0, "perigee_km": 170.0, "x": 4500.0, "y": 1800.0, "z": 2900.0},
    {"id": "37348", "name": "Fengyun 1C DEB", "type": "debris", "inclination_deg": 99.00, "apogee_km": 885.0, "perigee_km": 200.0, "x": 3800.0, "y": 3500.0, "z": 4800.0},
    {"id": "37349", "name": "Fengyun 1C DEB #2", "type": "debris", "inclination_deg": 98.50, "apogee_km": 870.0, "perigee_km": 210.0, "x": 3820.0, "y": 3480.0, "z": 4780.0},
    {"id": "37350", "name": "Fengyun 1C DEB #3", "type": "debris", "inclination_deg": 99.20, "apogee_km": 900.0, "perigee_km": 190.0, "x": 3790.0, "y": 3520.0, "z": 4820.0},
    {"id": "40271", "name": "Cosmos 2251 DEB", "type": "debris", "inclination_deg": 74.00, "apogee_km": 830.0, "perigee_km": 750.0, "x": 3600.0, "y": 4000.0, "z": 5000.0},
    {"id": "40272", "name": "Cosmos 2251 DEB #2", "type": "debris", "inclination_deg": 74.10, "apogee_km": 825.0, "perigee_km": 755.0, "x": 3610.0, "y": 3990.0, "z": 4990.0},
    {"id": "33442", "name": "Iridium 33 DEB", "type": "debris", "inclination_deg": 86.40, "apogee_km": 810.0, "perigee_km": 770.0, "x": 3500.0, "y": 4200.0, "z": 5100.0},
    {"id": "13552", "name": "Cosmos 1408 DEB", "type": "debris", "inclination_deg": 82.50, "apogee_km": 530.0, "perigee_km": 440.0, "x": 4100.0, "y": 3000.0, "z": 4500.0},
    {"id": "13553", "name": "Cosmos 1408 DEB #2", "type": "debris", "inclination_deg": 82.60, "apogee_km": 525.0, "perigee_km": 445.0, "x": 4110.0, "y": 2990.0, "z": 4490.0},
    {"id": "28884", "name": "SL-16 R/B", "type": "rocket_body", "inclination_deg": 71.00, "apogee_km": 850.0, "perigee_km": 845.0, "x": 3400.0, "y": 4300.0, "z": 4900.0},
    {"id": "16263", "name": "SL-8 R/B", "type": "rocket_body", "inclination_deg": 74.00, "apogee_km": 780.0, "perigee_km": 770.0, "x": 3700.0, "y": 3800.0, "z": 4700.0},
    {"id": "27386", "name": "Envisat", "type": "payload", "inclination_deg": 98.55, "apogee_km": 770.0, "perigee_km": 768.0, "x": 3300.0, "y": 4400.0, "z": 5050.0},
    {"id": "39084", "name": "Landsat 8", "type": "payload", "inclination_deg": 98.21, "apogee_km": 705.0, "perigee_km": 703.0, "x": 3900.0, "y": 3200.0, "z": 4600.0},
    {"id": "25994", "name": "Terra (EOS-AM1)", "type": "payload", "inclination_deg": 98.20, "apogee_km": 705.0, "perigee_km": 700.0, "x": 3910.0, "y": 3190.0, "z": 4590.0},
    {"id": "27424", "name": "Aqua (EOS-PM1)", "type": "payload", "inclination_deg": 98.20, "apogee_km": 705.0, "perigee_km": 701.0, "x": 3920.0, "y": 3180.0, "z": 4580.0},
    {"id": "36508", "name": "SDO (Solar Dynamics Observatory)", "type": "payload", "inclination_deg": 28.50, "apogee_km": 35800.0, "perigee_km": 35780.0, "x": 42164.0, "y": 100.0, "z": 200.0},
    {"id": "41765", "name": "GOES-16", "type": "payload", "inclination_deg": 0.05, "apogee_km": 35795.0, "perigee_km": 35780.0, "x": 42160.0, "y": 50.0, "z": 30.0},
    {"id": "43226", "name": "GOES-17", "type": "payload", "inclination_deg": 0.04, "apogee_km": 35790.0, "perigee_km": 35785.0, "x": -42160.0, "y": 50.0, "z": 20.0},
    {"id": "29155", "name": "GPS IIR-M 1", "type": "payload", "inclination_deg": 55.00, "apogee_km": 20200.0, "perigee_km": 20180.0, "x": 16000.0, "y": 18000.0, "z": 14000.0},
    {"id": "41019", "name": "GPS III SV01", "type": "payload", "inclination_deg": 55.00, "apogee_km": 20200.0, "perigee_km": 20195.0, "x": 16010.0, "y": 17990.0, "z": 13990.0},
    {"id": "44506", "name": "Crew Dragon Resilience", "type": "payload", "inclination_deg": 51.64, "apogee_km": 425.0, "perigee_km": 420.0, "x": 4205.0, "y": 2795.0, "z": 3605.0},
    {"id": "48854", "name": "Tianhe Core Module", "type": "payload", "inclination_deg": 41.47, "apogee_km": 390.0, "perigee_km": 385.0, "x": 4600.0, "y": 1600.0, "z": 2800.0},
    {"id": "99001", "name": "Unknown Debris A", "type": "debris", "inclination_deg": 52.00, "apogee_km": 430.0, "perigee_km": 415.0, "x": 4180.0, "y": 2830.0, "z": 3620.0},
    {"id": "99002", "name": "Unknown Debris B", "type": "debris", "inclination_deg": 51.50, "apogee_km": 435.0, "perigee_km": 420.0, "x": 4220.0, "y": 2770.0, "z": 3570.0},
    {"id": "99003", "name": "Unknown Debris C", "type": "debris", "inclination_deg": 98.70, "apogee_km": 555.0, "perigee_km": 540.0, "x": 4880.0, "y": 2150.0, "z": 3830.0},
    {"id": "99004", "name": "SL-4 R/B Fragment", "type": "debris", "inclination_deg": 65.00, "apogee_km": 620.0, "perigee_km": 590.0, "x": 4300.0, "y": 2600.0, "z": 4100.0},
    {"id": "99005", "name": "Delta II DEB", "type": "debris", "inclination_deg": 28.00, "apogee_km": 1500.0, "perigee_km": 300.0, "x": 5500.0, "y": 900.0, "z": 2500.0},
    {"id": "99006", "name": "Ariane 5 R/B", "type": "rocket_body", "inclination_deg": 7.00, "apogee_km": 35786.0, "perigee_km": 260.0, "x": 30000.0, "y": 5000.0, "z": 1000.0},
    {"id": "99007", "name": "Atlas V Centaur R/B", "type": "rocket_body", "inclination_deg": 28.50, "apogee_km": 35000.0, "perigee_km": 185.0, "x": 28000.0, "y": 7000.0, "z": 4000.0},
    {"id": "99008", "name": "Breeze-M R/B", "type": "rocket_body", "inclination_deg": 49.00, "apogee_km": 35800.0, "perigee_km": 400.0, "x": 25000.0, "y": 10000.0, "z": 8000.0},
    {"id": "99009", "name": "Microsat Debris Cluster A", "type": "debris", "inclination_deg": 97.50, "apogee_km": 600.0, "perigee_km": 595.0, "x": 4700.0, "y": 2400.0, "z": 4000.0},
    {"id": "99010", "name": "PSLV 4th Stage DEB", "type": "debris", "inclination_deg": 97.80, "apogee_km": 650.0, "perigee_km": 640.0, "x": 4650.0, "y": 2450.0, "z": 4050.0},
    {"id": "99011", "name": "Iridium NEXT 143", "type": "payload", "inclination_deg": 86.40, "apogee_km": 780.0, "perigee_km": 778.0, "x": 3550.0, "y": 4150.0, "z": 5050.0},
    {"id": "99012", "name": "SpaceX Fairing DEB", "type": "debris", "inclination_deg": 53.00, "apogee_km": 400.0, "perigee_km": 200.0, "x": 4400.0, "y": 2500.0, "z": 3400.0},
    {"id": "99013", "name": "NOAA-20 (JPSS-1)", "type": "payload", "inclination_deg": 98.70, "apogee_km": 824.0, "perigee_km": 822.0, "x": 3450.0, "y": 4250.0, "z": 4950.0},
    {"id": "99014", "name": "Sentinel-6 Michael Freilich", "type": "payload", "inclination_deg": 66.00, "apogee_km": 1336.0, "perigee_km": 1334.0, "x": 2800.0, "y": 4500.0, "z": 5300.0},
    {"id": "99015", "name": "TESS (Transiting Exoplanet Survey)", "type": "payload", "inclination_deg": 37.00, "apogee_km": 375000.0, "perigee_km": 108000.0, "x": 200000.0, "y": 150000.0, "z": 80000.0},
    {"id": "99016", "name": "Soyuz MS-25", "type": "payload", "inclination_deg": 51.64, "apogee_km": 421.0, "perigee_km": 417.0, "x": 4198.0, "y": 2805.0, "z": 3595.0},
    {"id": "99017", "name": "Progress MS-26", "type": "payload", "inclination_deg": 51.64, "apogee_km": 419.0, "perigee_km": 416.0, "x": 4192.0, "y": 2812.0, "z": 3598.0},
    {"id": "99018", "name": "CZ-2D R/B (2024)", "type": "rocket_body", "inclination_deg": 97.50, "apogee_km": 500.0, "perigee_km": 480.0, "x": 4950.0, "y": 2050.0, "z": 3850.0},
    {"id": "99019", "name": "Electron Kick Stage DEB", "type": "debris", "inclination_deg": 45.00, "apogee_km": 520.0, "perigee_km": 490.0, "x": 4800.0, "y": 2250.0, "z": 3700.0},
    {"id": "99020", "name": "ASAT Test Fragment (2021)", "type": "debris", "inclination_deg": 82.50, "apogee_km": 540.0, "perigee_km": 440.0, "x": 4090.0, "y": 3010.0, "z": 4510.0},
]

# Pre-computed conjunctions
SAMPLE_CONJUNCTIONS = [
    {
        "id": "conj_001",
        "primary_object": "25544",
        "secondary_object": "99001",
        "time_of_closest_approach": (datetime.utcnow() + timedelta(hours=14, minutes=32)).isoformat(),
        "miss_distance_km": 1.2,
        "probability_of_collision": 1.4e-4,
        "severity": "warning",
    },
    {
        "id": "conj_002",
        "primary_object": "25544",
        "secondary_object": "13552",
        "time_of_closest_approach": (datetime.utcnow() + timedelta(hours=38, minutes=15)).isoformat(),
        "miss_distance_km": 3.8,
        "probability_of_collision": 2.1e-5,
        "severity": "advisory",
    },
    {
        "id": "conj_003",
        "primary_object": "54216",
        "secondary_object": "99002",
        "time_of_closest_approach": (datetime.utcnow() + timedelta(hours=22, minutes=45)).isoformat(),
        "miss_distance_km": 0.8,
        "probability_of_collision": 3.2e-4,
        "severity": "critical",
    },
    {
        "id": "conj_004",
        "primary_object": "48274",
        "secondary_object": "99003",
        "time_of_closest_approach": (datetime.utcnow() + timedelta(hours=52, minutes=10)).isoformat(),
        "miss_distance_km": 5.5,
        "probability_of_collision": 8.7e-6,
        "severity": "nominal",
    },
    {
        "id": "conj_005",
        "primary_object": "20580",
        "secondary_object": "37348",
        "time_of_closest_approach": (datetime.utcnow() + timedelta(hours=67, minutes=30)).isoformat(),
        "miss_distance_km": 2.1,
        "probability_of_collision": 5.6e-5,
        "severity": "advisory",
    },
]


class OrbitalMonitorService:
    """Space situational awareness and conjunction assessment service.

    Provides tracked object catalog, conjunction predictions, and
    AI-assisted collision risk assessment with maneuver recommendations.
    """

    def __init__(self, granite_client) -> None:
        self._granite = granite_client
        self._objects = {obj["id"]: obj for obj in SAMPLE_OBJECTS}
        self._conjunctions = {c["id"]: c for c in SAMPLE_CONJUNCTIONS}
        logger.info(
            "Orbital monitor initialized | objects=%d | conjunctions=%d",
            len(self._objects), len(self._conjunctions),
        )

    def get_tracked_objects(self) -> list[dict]:
        """Return all tracked orbital objects.

        Returns:
            List of orbital object dicts with position and orbital parameters.
        """
        results = []
        epoch = datetime.utcnow().isoformat()
        for obj in self._objects.values():
            results.append({
                "id": obj["id"],
                "name": obj["name"],
                "type": obj["type"],
                "position": {"x": obj["x"], "y": obj["y"], "z": obj["z"]},
                "epoch": epoch,
                "inclination_deg": obj["inclination_deg"],
                "apogee_km": obj["apogee_km"],
                "perigee_km": obj["perigee_km"],
            })
        return results

    def compute_conjunctions(self) -> list[dict]:
        """Return pre-computed conjunction events.

        Returns:
            List of conjunction dicts with TCA, miss distance, and probability.
        """
        # Return conjunctions sorted by time
        conjs = sorted(
            self._conjunctions.values(),
            key=lambda c: c["time_of_closest_approach"],
        )
        # Enrich with object names
        enriched = []
        for c in conjs:
            primary = self._objects.get(c["primary_object"], {})
            secondary = self._objects.get(c["secondary_object"], {})
            enriched.append({
                **c,
                "primary_name": primary.get("name", "Unknown"),
                "secondary_name": secondary.get("name", "Unknown"),
            })
        return enriched

    async def assess_collision_risk(self, conjunction_id: str) -> dict:
        """AI-assisted collision risk assessment for a conjunction event.

        Args:
            conjunction_id: Conjunction event identifier.

        Returns:
            Dict with risk assessment, recommended action, and analysis.
        """
        conj = self._conjunctions.get(conjunction_id)
        if not conj:
            return {"error": f"Conjunction {conjunction_id} not found"}

        primary = self._objects.get(conj["primary_object"], {})
        secondary = self._objects.get(conj["secondary_object"], {})

        miss_km = conj["miss_distance_km"]
        pc = conj["probability_of_collision"]

        # Determine risk level and action
        if pc >= 1e-4:
            risk_level = "critical"
            recommended_action = "maneuver"
            confidence = 0.85
        elif pc >= 1e-5:
            risk_level = "warning"
            recommended_action = "monitor_closely"
            confidence = 0.75
        elif pc >= 1e-6:
            risk_level = "advisory"
            recommended_action = "monitor"
            confidence = 0.65
        else:
            risk_level = "nominal"
            recommended_action = "no_action"
            confidence = 0.90

        # Generate AI analysis
        prompt = (
            f"Conjunction assessment: {primary.get('name', 'Primary')} vs "
            f"{secondary.get('name', 'Secondary')}. "
            f"Miss distance: {miss_km:.1f} km, Pc: {pc:.2e}. "
            f"Primary type: {primary.get('type')}. Secondary type: {secondary.get('type')}. "
            f"Provide brief risk assessment and maneuver recommendation."
        )

        try:
            response = await asyncio.wait_for(
                self._granite.generate(prompt, category="orbital"),
                timeout=30.0,
            )
            analysis_summary = response.content
        except (asyncio.TimeoutError, Exception):
            if recommended_action == "maneuver":
                analysis_summary = (
                    f"HIGH PRIORITY: Conjunction between {primary.get('name', 'Unknown')} and "
                    f"{secondary.get('name', 'Unknown')} has Pc = {pc:.2e} (exceeds 1e-4 threshold). "
                    f"Miss distance of {miss_km:.1f} km with significant uncertainty. "
                    f"Recommend avoidance maneuver planning with execution decision at TCA-8hr. "
                    f"Delta-V estimate: 0.3-0.8 m/s in-track."
                )
            else:
                analysis_summary = (
                    f"Conjunction between {primary.get('name', 'Unknown')} and "
                    f"{secondary.get('name', 'Unknown')}: Pc = {pc:.2e}, "
                    f"miss distance {miss_km:.1f} km. Current assessment: {recommended_action}. "
                    f"Continue tracking updates every 8 hours."
                )

        attribution = GraniteAttribution(
            model_name="ibm/granite-13b-chat-v2",
            model_version="2.0",
            provider=self._granite.get_active_provider(),
            badge_text="Powered by IBM Granite",
        )

        return {
            "conjunction_id": conjunction_id,
            "primary_object": conj["primary_object"],
            "primary_name": primary.get("name", "Unknown"),
            "secondary_object": conj["secondary_object"],
            "secondary_name": secondary.get("name", "Unknown"),
            "time_of_closest_approach": conj["time_of_closest_approach"],
            "miss_distance_km": miss_km,
            "probability_of_collision": pc,
            "risk_level": risk_level,
            "recommended_action": recommended_action,
            "confidence": confidence,
            "analysis_summary": analysis_summary,
            "attribution": attribution.model_dump(),
            "assessed_at": datetime.utcnow().isoformat(),
        }
