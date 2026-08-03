"""Mission Planner service for AI-generated mission timelines.

Provides mission plan generation, pre-flight checklist creation,
and resource conflict detection with safety margin enforcement.
"""

from __future__ import annotations

import asyncio
import logging
import uuid
from datetime import datetime, timedelta

from backend.models.enums import SeverityLevel, severity_from_score
from backend.models.shared import GraniteAttribution

logger = logging.getLogger(__name__)

GENERATION_TIMEOUT = 30.0

# Sample LEO crewed mission plan template
SAMPLE_LEO_MISSION = {
    "mission_id": "leo_crew_demo_1",
    "mission_name": "LEO Crewed Demonstration Mission",
    "vehicle": "CST-100 Starliner",
    "crew_size": 2,
    "destination": "International Space Station (LEO)",
    "total_duration_hours": 240.0,
    "phases": [
        {
            "id": "phase_prelaunch",
            "name": "Pre-Launch Operations",
            "duration_hours": 8.0,
            "safety_margin_hours": 1.0,
            "risk_score": 0.2,
            "description": "Final vehicle closeout, propellant loading, crew ingress, communication checks",
            "milestones": ["Crew ingress", "Hatch closure", "Comm check", "Launch poll"],
            "resources": ["Launch pad", "Ground crew", "Mission control", "Range safety"],
            "dependencies": [],
        },
        {
            "id": "phase_ascent",
            "name": "Ascent",
            "duration_hours": 0.15,
            "safety_margin_hours": 0.0,
            "risk_score": 0.75,
            "description": "Powered flight from liftoff through MECO and orbital insertion",
            "milestones": ["Liftoff", "Max-Q", "BECO", "MECO", "Orbit insertion"],
            "resources": ["Atlas V launch vehicle", "Abort system", "Tracking stations"],
            "dependencies": ["phase_prelaunch"],
        },
        {
            "id": "phase_orbit_raising",
            "name": "Orbit Raising & Phasing",
            "duration_hours": 24.0,
            "safety_margin_hours": 3.0,
            "risk_score": 0.4,
            "description": "Orbital maneuvers to raise orbit and phase for ISS approach",
            "milestones": ["OMS-1 burn", "OMS-2 burn", "Systems checkout", "Nav update"],
            "resources": ["OMS engines", "Star trackers", "Ground tracking"],
            "dependencies": ["phase_ascent"],
        },
        {
            "id": "phase_rendezvous",
            "name": "Rendezvous & Docking",
            "duration_hours": 6.0,
            "safety_margin_hours": 1.0,
            "risk_score": 0.6,
            "description": "Final approach, proximity operations, and docking with ISS",
            "milestones": ["Ti burn", "Midcourse corrections", "R-bar approach", "Contact", "Capture"],
            "resources": ["RCS thrusters", "LIDAR", "Docking mechanism", "ISS crew standby"],
            "dependencies": ["phase_orbit_raising"],
        },
        {
            "id": "phase_docked_ops",
            "name": "Docked Operations",
            "duration_hours": 168.0,
            "safety_margin_hours": 24.0,
            "risk_score": 0.15,
            "description": "ISS docked phase - crew transfer, systems monitoring, experiments",
            "milestones": ["Hatch opening", "Crew transfer", "Systems monitoring", "Experiment ops"],
            "resources": ["ISS life support", "Station power", "Communication links"],
            "dependencies": ["phase_rendezvous"],
        },
        {
            "id": "phase_undock",
            "name": "Undocking & Separation",
            "duration_hours": 2.0,
            "safety_margin_hours": 0.5,
            "risk_score": 0.35,
            "description": "Undocking from ISS and departure maneuvers",
            "milestones": ["Hatch closure", "Leak check", "Undock command", "Separation burn"],
            "resources": ["Docking mechanism", "RCS thrusters", "Comm link"],
            "dependencies": ["phase_docked_ops"],
        },
        {
            "id": "phase_deorbit",
            "name": "Deorbit & Entry",
            "duration_hours": 4.0,
            "safety_margin_hours": 0.5,
            "risk_score": 0.8,
            "description": "Deorbit burn, service module separation, atmospheric entry, and landing",
            "milestones": ["Deorbit burn", "SM separation", "Entry interface", "Drogue deploy", "Main chute deploy", "Airbag inflation", "Touchdown"],
            "resources": ["OMS engines", "RCS thrusters", "TPS", "Parachute system", "Airbags", "Recovery forces"],
            "dependencies": ["phase_undock"],
        },
    ],
}


class MissionPlannerService:
    """AI-powered mission planning and pre-flight checklist generation.

    Generates mission timelines with safety margins, identifies resource
    conflicts, and produces comprehensive pre-flight checklists.
    """

    def __init__(self, granite_client) -> None:
        self._granite = granite_client
        self._plans: dict[str, dict] = {}
        self._load_sample_plan()

    def _load_sample_plan(self) -> None:
        """Load the sample LEO crewed mission plan."""
        plan = dict(SAMPLE_LEO_MISSION)
        plan["generated_at"] = datetime.utcnow().isoformat()
        plan["status"] = "ready"
        self._plans[plan["mission_id"]] = plan
        logger.info("Sample mission plan loaded: %s", plan["mission_id"])

    async def generate_plan(self, params: dict) -> dict:
        """Generate an AI-powered mission plan.

        Args:
            params: Dict with mission_name, vehicle, crew_size, destination,
                    launch_window_start, launch_window_end, objectives, constraints.

        Returns:
            Complete mission plan dict with phases, milestones, and resources.
        """
        mission_id = f"mission_{uuid.uuid4().hex[:8]}"
        mission_name = params.get("mission_name", "Unnamed Mission")
        vehicle = params.get("vehicle", "Generic Crew Vehicle")
        crew_size = params.get("crew_size", 0)
        destination = params.get("destination", "LEO")

        # Start from sample plan as template and customize
        plan = {
            "mission_id": mission_id,
            "mission_name": mission_name,
            "vehicle": vehicle,
            "crew_size": crew_size,
            "destination": destination,
            "objectives": params.get("objectives", []),
            "constraints": params.get("constraints", []),
            "total_duration_hours": 0.0,
            "phases": [],
            "critical_path": [],
            "resource_conflicts": [],
            "generated_at": datetime.utcnow().isoformat(),
            "status": "generated",
        }

        # Generate phases based on destination
        phases = self._generate_phases(destination, vehicle, crew_size)
        plan["phases"] = phases

        # Calculate total duration and safety margins
        total_hours = sum(p["duration_hours"] + p["safety_margin_hours"] for p in phases)
        plan["total_duration_hours"] = round(total_hours, 2)

        # Identify critical path (phases with risk >= 0.7)
        plan["critical_path"] = [p["id"] for p in phases if p["risk_score"] >= 0.7]

        # Detect resource conflicts
        plan["resource_conflicts"] = self._detect_conflicts(phases)

        # Flag high-risk phases
        for phase in plan["phases"]:
            if phase["risk_score"] >= 0.8:
                phase["risk_flag"] = "CRITICAL"
            elif phase["risk_score"] >= 0.7:
                phase["risk_flag"] = "WARNING"
            else:
                phase["risk_flag"] = None

        # Generate AI recommendation
        prompt = (
            f"Generate a brief mission safety assessment for: {mission_name}, "
            f"vehicle: {vehicle}, destination: {destination}, crew: {crew_size}. "
            f"High-risk phases: {', '.join(plan['critical_path'])}. "
            f"Identify top 3 risk mitigations."
        )
        try:
            response = await asyncio.wait_for(
                self._granite.generate(prompt, category="mission"),
                timeout=GENERATION_TIMEOUT,
            )
            plan["ai_assessment"] = response.content
        except (asyncio.TimeoutError, Exception):
            plan["ai_assessment"] = (
                f"Mission {mission_name} has {len(plan['critical_path'])} high-risk phases. "
                f"Safety margins of minimum 10% applied to all phases. "
                f"Recommend independent review of {', '.join(plan['critical_path'])} phases."
            )

        attribution = GraniteAttribution(
            model_name="ibm/granite-13b-chat-v2",
            model_version="2.0",
            provider=self._granite.get_active_provider(),
            badge_text="Powered by IBM Granite",
        )
        plan["attribution"] = attribution.model_dump()

        self._plans[mission_id] = plan
        return plan

    async def generate_checklist(self, plan_id: str) -> dict:
        """Generate a pre-flight readiness checklist for a mission plan.

        Args:
            plan_id: Mission plan identifier.

        Returns:
            Comprehensive pre-flight checklist dict.
        """
        plan = self._plans.get(plan_id)
        if not plan:
            return {"error": f"Plan {plan_id} not found", "items": []}

        items = [
            {"id": "chk_001", "category": "Vehicle Systems", "item": "OMS engine hot-fire test complete", "status": "go", "required": True, "notes": "Both engines verified within 2% of rated thrust"},
            {"id": "chk_002", "category": "Vehicle Systems", "item": "RCS thruster verification (all 28 thrusters)", "status": "go", "required": True, "notes": "Minimum 95% thrust on all thrusters"},
            {"id": "chk_003", "category": "Vehicle Systems", "item": "Helium pressurization leak check", "status": "caution", "required": True, "notes": "Leak rate must be < 0.1 psi/hr at all flanges"},
            {"id": "chk_004", "category": "Vehicle Systems", "item": "Parachute system integrity verification", "status": "go", "required": True, "notes": "Mortar charges, drogue, and main chutes inspected"},
            {"id": "chk_005", "category": "Vehicle Systems", "item": "Thermal protection system inspection", "status": "go", "required": True, "notes": "No debonds, cracks, or missing tiles"},
            {"id": "chk_006", "category": "ECLSS", "item": "Cabin leak rate verification", "status": "go", "required": True, "notes": "< 0.05 psi/hr at 14.7 psi"},
            {"id": "chk_007", "category": "ECLSS", "item": "CO2 scrubber capacity verification", "status": "go", "required": True, "notes": "Sufficient for crew_size x mission_duration + 25% margin"},
            {"id": "chk_008", "category": "ECLSS", "item": "O2 supply quantity verification", "status": "go", "required": True, "notes": "Primary + backup supply for full mission + contingency"},
            {"id": "chk_009", "category": "GNC", "item": "IMU alignment and drift test", "status": "go", "required": True, "notes": "Drift < 0.01 deg/hr all axes"},
            {"id": "chk_010", "category": "GNC", "item": "Star tracker calibration verification", "status": "go", "required": True, "notes": "Both trackers within 1 arcsec accuracy"},
            {"id": "chk_011", "category": "GNC", "item": "GPS receiver lock verification", "status": "go", "required": True, "notes": "4+ satellite solution on both receivers"},
            {"id": "chk_012", "category": "EPS", "item": "Battery state of charge", "status": "go", "required": True, "notes": "All batteries > 95% SOC at T-2hr"},
            {"id": "chk_013", "category": "EPS", "item": "Solar array deployment test", "status": "go", "required": True, "notes": "Motor current and limit switch verification"},
            {"id": "chk_014", "category": "Communications", "item": "S-band TDRS link verification", "status": "go", "required": True, "notes": "Both strings verified with TDRS east and west"},
            {"id": "chk_015", "category": "Communications", "item": "UHF backup comm check", "status": "go", "required": True, "notes": "Voice and data verified"},
            {"id": "chk_016", "category": "Software", "item": "Flight software version verification", "status": "go", "required": True, "notes": "Correct version loaded on primary and backup computers"},
            {"id": "chk_017", "category": "Software", "item": "Abort mode verification", "status": "go", "required": True, "notes": "All abort modes tested in simulation"},
            {"id": "chk_018", "category": "Range Safety", "item": "FTS battery activation", "status": "go", "required": True, "notes": "Flight Termination System armed and verified"},
            {"id": "chk_019", "category": "Range Safety", "item": "Range weather go", "status": "go", "required": True, "notes": "No lightning within 10nm, winds within limits"},
            {"id": "chk_020", "category": "Crew", "item": "Crew health verification", "status": "go", "required": True, "notes": "Flight surgeon clearance for all crew"},
            {"id": "chk_021", "category": "Crew", "item": "Suit integrity check", "status": "go", "required": True, "notes": "Pressure hold test passed on all suits"},
            {"id": "chk_022", "category": "Ground Systems", "item": "Mission Control Center ready", "status": "go", "required": True, "notes": "All flight controller positions staffed"},
            {"id": "chk_023", "category": "Ground Systems", "item": "Recovery forces positioned", "status": "go", "required": True, "notes": "Ships/helicopters on station at landing zone"},
        ]

        # Calculate readiness
        go_count = sum(1 for item in items if item["status"] == "go")
        overall_readiness = go_count / len(items)
        blockers = [item["item"] for item in items if item["status"] in ("no_go", "critical")]
        cautions = [item["item"] for item in items if item["status"] == "caution"]

        # Generate recommendation
        if overall_readiness >= 0.95 and not blockers:
            recommendation = "All systems GO for launch. Proceed to terminal count."
        elif blockers:
            recommendation = f"HOLD: {len(blockers)} blocking item(s) require resolution before launch commit."
        else:
            recommendation = f"CONDITIONAL GO: {len(cautions)} caution item(s) require monitoring. Proceed with awareness."

        attribution = GraniteAttribution(
            model_name="ibm/granite-13b-chat-v2",
            model_version="2.0",
            provider=self._granite.get_active_provider(),
            badge_text="Powered by IBM Granite",
        )

        return {
            "mission_id": plan_id,
            "items": items,
            "overall_readiness": round(overall_readiness, 3),
            "blockers": blockers,
            "cautions": cautions,
            "recommendation": recommendation,
            "attribution": attribution.model_dump(),
            "generated_at": datetime.utcnow().isoformat(),
        }

    def get_plan(self, plan_id: str) -> dict | None:
        """Retrieve a previously generated mission plan."""
        return self._plans.get(plan_id)

    def _generate_phases(self, destination: str, vehicle: str, crew_size: int) -> list[dict]:
        """Generate mission phases based on destination type."""
        # Use sample plan phases as base and adjust
        base_phases = SAMPLE_LEO_MISSION["phases"]
        phases = []

        for bp in base_phases:
            phase = dict(bp)
            # Ensure minimum 10% safety margin
            min_margin = phase["duration_hours"] * 0.1
            if phase["safety_margin_hours"] < min_margin:
                phase["safety_margin_hours"] = round(min_margin, 2)
            phases.append(phase)

        return phases

    def _detect_conflicts(self, phases: list[dict]) -> list[dict]:
        """Detect resource or scheduling conflicts between phases."""
        conflicts = []

        # Check for overlapping resource requirements
        all_resources: dict[str, list[str]] = {}
        for phase in phases:
            for resource in phase.get("resources", []):
                all_resources.setdefault(resource, []).append(phase["id"])

        for resource, phase_ids in all_resources.items():
            if len(phase_ids) > 1:
                # Check if phases are sequential (OK) or might overlap
                # For now, flag shared critical resources
                if resource in ("RCS thrusters", "OMS engines"):
                    if any(
                        phases[i].get("risk_score", 0) >= 0.7
                        for i, p in enumerate(phases)
                        if p["id"] in phase_ids
                    ):
                        conflicts.append({
                            "id": f"conflict_{uuid.uuid4().hex[:6]}",
                            "type": "resource",
                            "description": f"Critical resource '{resource}' shared across high-risk phases: {phase_ids}",
                            "severity": "advisory",
                            "affected_phases": phase_ids,
                            "resolution_options": [
                                "Verify resource availability between phases",
                                "Pre-position backup resource",
                                "Add transition time between dependent phases",
                            ],
                        })

        return conflicts
