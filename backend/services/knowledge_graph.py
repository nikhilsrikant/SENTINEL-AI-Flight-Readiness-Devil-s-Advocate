"""Knowledge Graph service for spaceflight incident analysis.

Provides semantic search over a corpus of historical spaceflight
incidents and generates knowledge graph visualizations.
"""

import asyncio
import logging
import uuid
from datetime import datetime

from backend.models.knowledge import (
    Citation,
    GraphData,
    GraphEdge,
    GraphNode,
    IncidentRecord,
    KnowledgeQueryResult,
)
from backend.models.shared import GraniteAttribution

logger = logging.getLogger(__name__)

GENERATION_TIMEOUT = 30.0


# Built-in corpus of spaceflight incidents
INCIDENTS_CORPUS = [
    {"id": "apollo1", "date": "1967-01-27", "mission": "Apollo 1", "vehicle": "Apollo CSM-012",
     "root_cause": "Electrical fire in pure oxygen atmosphere during launch rehearsal",
     "contributing_factors": ["Pure oxygen atmosphere at 16.7 psi", "Flammable materials in cabin", "Inward-opening hatch design", "Inadequate emergency egress procedures"],
     "outcome": "Loss of crew: Grissom, White, Chaffee", "lessons_learned": ["Redesign hatch to open outward", "Replace flammable materials", "Use mixed-gas atmosphere at launch", "Improve emergency procedures"],
     "related_incidents": ["challenger", "columbia"]},
    {"id": "apollo13", "date": "1970-04-13", "mission": "Apollo 13", "vehicle": "Apollo CSM Odyssey / LM Aquarius",
     "root_cause": "Oxygen tank explosion due to damaged wiring from pre-flight testing",
     "contributing_factors": ["Tank dropped during manufacturing", "Thermostatic switch not upgraded", "Ground test overheated wiring insulation", "Single-point failure in O2 system"],
     "outcome": "Mission aborted; crew survived via LM lifeboat", "lessons_learned": ["Redundancy in critical life support", "Crew survival as primary objective", "Importance of mission control improvisation", "Review of ground test procedures"],
     "related_incidents": ["apollo1"]},
    {"id": "challenger", "date": "1986-01-28", "mission": "STS-51-L Challenger", "vehicle": "Space Shuttle Challenger OV-099",
     "root_cause": "O-ring failure in right SRB field joint due to cold temperatures",
     "contributing_factors": ["Launch temperature 36°F (well below O-ring qualification)", "Management overrode engineer objections", "Normalization of deviance on prior O-ring erosion", "Schedule pressure from multiple delays"],
     "outcome": "Loss of vehicle and crew 73 seconds after launch", "lessons_learned": ["Safety must override schedule", "Engineering data must drive decisions", "Anonymous dissent channels needed", "Independent safety oversight required"],
     "related_incidents": ["columbia", "apollo1"]},
    {"id": "columbia", "date": "2003-02-01", "mission": "STS-107 Columbia", "vehicle": "Space Shuttle Columbia OV-102",
     "root_cause": "Foam strike damaged TPS on wing leading edge during ascent",
     "contributing_factors": ["Prior foam strikes reclassified as maintenance issue", "Imagery requests denied by management", "Organizational silence on known risks", "Budget constraints on safety upgrades"],
     "outcome": "Loss of vehicle and crew during re-entry", "lessons_learned": ["Treat every anomaly as potentially catastrophic", "Independent technical authority", "Never normalize out-of-spec conditions", "Organizational culture audits"],
     "related_incidents": ["challenger"]},
    {"id": "starliner_cft", "date": "2024-06-05", "mission": "Boeing Starliner CFT", "vehicle": "Boeing CST-100 Starliner Calypso",
     "root_cause": "Multiple thruster failures and helium leaks in service module",
     "contributing_factors": ["Known thruster issues from OFT-2", "Helium seal degradation", "Schedule pressure on Commercial Crew program", "Risk acceptance of unresolved OFT-2 anomalies"],
     "outcome": "Crew stranded on ISS for 286 days; returned via SpaceX", "lessons_learned": ["Do not fly with unresolved anomalies", "Independent validation of vendor risk assessments", "Crew safety over program schedule", "Redundancy verification before crewed flights"],
     "related_incidents": ["challenger", "columbia"]},
    {"id": "mars_climate_orbiter", "date": "1999-09-23", "mission": "Mars Climate Orbiter", "vehicle": "Mars Climate Orbiter",
     "root_cause": "Navigation error due to metric/imperial unit mismatch in software",
     "contributing_factors": ["Lockheed Martin used imperial units", "JPL expected metric units", "Insufficient interface verification", "Understaffed navigation team"],
     "outcome": "Spacecraft lost during Mars orbit insertion", "lessons_learned": ["Mandatory unit consistency checks", "Interface control documentation", "Independent verification of navigation", "Adequate staffing for critical operations"],
     "related_incidents": ["ariane5_501", "mars_polar_lander"]},
    {"id": "ariane5_501", "date": "1996-06-04", "mission": "Ariane 5 Flight 501", "vehicle": "Ariane 5 G",
     "root_cause": "Software exception from integer overflow in inertial reference system",
     "contributing_factors": ["Reused Ariane 4 software without revalidation", "64-bit to 16-bit conversion overflow", "Backup system had identical software", "Insufficient testing with Ariane 5 trajectory"],
     "outcome": "Vehicle self-destructed 37 seconds after launch", "lessons_learned": ["Revalidate reused software for new contexts", "Diverse redundancy in critical systems", "Full trajectory simulation testing", "Exception handling in flight software"],
     "related_incidents": ["mars_climate_orbiter"]},
    {"id": "hubble_mirror", "date": "1990-04-24", "mission": "STS-31 Hubble Deployment", "vehicle": "Hubble Space Telescope",
     "root_cause": "Primary mirror ground to wrong shape due to miscalibrated null corrector",
     "contributing_factors": ["Single test instrument used for verification", "Cross-check tests dismissed as less accurate", "Perkin-Elmer quality control failures", "NASA oversight gaps in contractor work"],
     "outcome": "2.2mm spherical aberration; corrected by COSTAR in 1993", "lessons_learned": ["Multiple independent verification methods", "Never rely on single test instrument", "Contractor oversight must be rigorous", "Design for on-orbit serviceability"],
     "related_incidents": ["jwst_deployment"]},
    {"id": "genesis", "date": "2004-09-08", "mission": "Genesis Sample Return", "vehicle": "Genesis spacecraft",
     "root_cause": "Drogue parachute mortar fired but chute did not deploy - G-switch installed backwards",
     "contributing_factors": ["Accelerometer orientation drawing was ambiguous", "No functional test of deployment sequence", "Review process missed installation error", "Heritage design assumed correct orientation"],
     "outcome": "Sample return capsule crashed in Utah desert at 193 mph", "lessons_learned": ["End-to-end functional testing mandatory", "Clear unambiguous engineering drawings", "Independent verification of critical assemblies", "Do not assume heritage correctness"],
     "related_incidents": ["mars_polar_lander"]},
    {"id": "mir_fire", "date": "1997-02-23", "mission": "Mir Space Station", "vehicle": "Mir Kvant-1 module",
     "root_cause": "Lithium perchlorate oxygen generator canister caught fire",
     "contributing_factors": ["Expired canisters used due to supply delays", "Blocked escape route to Soyuz", "Inadequate fire suppression equipment", "Crew training gaps on fire response"],
     "outcome": "14-minute fire; station saved but nearly evacuated", "lessons_learned": ["Strict consumables expiration enforcement", "Multiple escape routes always clear", "Fire suppression redesign for spacecraft", "Regular emergency drills critical"],
     "related_incidents": ["apollo1", "mir_collision"]},
    {"id": "mir_collision", "date": "1997-06-25", "mission": "Mir Space Station", "vehicle": "Mir Spektr module",
     "root_cause": "Progress M-34 cargo ship collision during manual docking test",
     "contributing_factors": ["Manual TORU docking system used instead of automatic", "Distance misjudgment without radar data", "Pressure to demonstrate manual capability", "Crew fatigue from heavy workload"],
     "outcome": "Spektr module punctured; rapid decompression; module sealed", "lessons_learned": ["Automated systems preferred for proximity operations", "Adequate crew rest before critical ops", "Radar data mandatory for manual docking", "Pressure testing for mission success over safety"],
     "related_incidents": ["mir_fire"]},
    {"id": "soyuz_11", "date": "1971-06-30", "mission": "Soyuz 11", "vehicle": "Soyuz 7K-OKS",
     "root_cause": "Cabin vent valve opened during service module separation, causing depressurization",
     "contributing_factors": ["No pressure suits worn during re-entry", "Valve design vulnerable to pyrotechnic shock", "Weight constraints prevented suit usage", "Single-point failure mode not identified"],
     "outcome": "Loss of crew: Dobrovolsky, Volkov, Patsayev", "lessons_learned": ["Pressure suits mandatory during dynamic phases", "Redundant cabin sealing", "Review pyrotechnic shock effects on valves", "Never sacrifice crew protection for weight"],
     "related_incidents": ["apollo1", "challenger"]},
    {"id": "soyuz_1", "date": "1967-04-24", "mission": "Soyuz 1", "vehicle": "Soyuz 7K-OK",
     "root_cause": "Parachute system failure during landing - drogue did not extract main chute",
     "contributing_factors": ["203 design faults identified before flight", "Political pressure to launch on schedule", "Previous unmanned tests showed parachute issues", "Komarov reportedly knew risks but flew anyway"],
     "outcome": "Loss of crew: Vladimir Komarov", "lessons_learned": ["Never fly with known critical faults", "Political pressure must never override safety", "Full resolution of test anomalies required", "Crew concerns must halt operations"],
     "related_incidents": ["challenger", "soyuz_11"]},
    {"id": "x15_flight_191", "date": "1967-11-15", "mission": "X-15 Flight 191", "vehicle": "X-15-3",
     "root_cause": "Electrical disturbance caused adaptive control system malfunction leading to hypersonic spin",
     "contributing_factors": ["Experimental ablative coating on aircraft", "Pilot workload during science experiments", "Reaction control system depleted", "No abort capability at hypersonic speeds"],
     "outcome": "Loss of vehicle and pilot Michael Adams", "lessons_learned": ["Adaptive control must be robust to disturbances", "Pilot workload management in experimental flights", "Abort modes needed at all flight regimes", "Real-time telemetry monitoring improvements"],
     "related_incidents": ["columbia"]},
    {"id": "gemini8", "date": "1966-03-16", "mission": "Gemini 8", "vehicle": "Gemini spacecraft",
     "root_cause": "Stuck thruster caused uncontrolled roll after Agena docking",
     "contributing_factors": ["Short circuit in thruster control", "Spacecraft coupled to Agena amplified dynamics", "Limited crew visibility of thruster status", "RCS propellant depletion risk"],
     "outcome": "Emergency undocking and early mission termination; crew survived", "lessons_learned": ["Independent spacecraft control after docking", "Thruster fault isolation capability", "Crew authority to terminate operations", "Propellant monitoring and reserves"],
     "related_incidents": ["apollo13"]},
    {"id": "mars_polar_lander", "date": "1999-12-03", "mission": "Mars Polar Lander", "vehicle": "Mars Polar Lander",
     "root_cause": "Premature engine shutdown due to spurious touchdown signal from leg deployment",
     "contributing_factors": ["Known software behavior not tested in integrated system", "Insufficient landing simulation", "Cost-cutting eliminated redundant sensors", "No telemetry during landing phase"],
     "outcome": "Spacecraft crashed on Mars surface", "lessons_learned": ["End-to-end integrated system testing", "Redundant landing sensors", "Telemetry through all mission phases", "Cost-cutting must not affect safety-critical systems"],
     "related_incidents": ["genesis", "mars_climate_orbiter"]},
    {"id": "schiaparelli", "date": "2016-10-19", "mission": "ExoMars Schiaparelli EDM", "vehicle": "Schiaparelli lander",
     "root_cause": "IMU saturation caused navigation error; computer thought it had landed while at 3.7km altitude",
     "contributing_factors": ["Parachute jettison at wrong time", "Retrorockets fired for only 3 seconds", "IMU gyroscope saturation not handled", "Insufficient Monte Carlo landing simulations"],
     "outcome": "Lander crashed on Mars at 540 km/h", "lessons_learned": ["IMU saturation handling in flight software", "Extensive Monte Carlo simulation campaigns", "Sensor fusion for landing state estimation", "Independent navigation cross-checks"],
     "related_incidents": ["mars_polar_lander"]},
    {"id": "antares_orb3", "date": "2014-10-28", "mission": "Orbital Sciences CRS Orb-3", "vehicle": "Antares 130",
     "root_cause": "AJ-26 engine turbopump failure 15 seconds after liftoff",
     "contributing_factors": ["Refurbished Soviet NK-33 engines (40+ years old)", "Known turbopump debris risk", "Economic pressure to use available engines", "Limited engine acceptance testing"],
     "outcome": "Vehicle destroyed; launch pad heavily damaged", "lessons_learned": ["Heritage hardware requires thorough inspection", "Engine acceptance testing must be comprehensive", "Economic factors cannot override reliability", "Pad damage recovery planning needed"],
     "related_incidents": ["spacex_crs7"]},
    {"id": "spacex_crs7", "date": "2015-06-28", "mission": "SpaceX CRS-7", "vehicle": "Falcon 9 v1.1",
     "root_cause": "Helium COPV strut failure in second stage LOX tank",
     "contributing_factors": ["Strut rated for 10,000 lbf failed at 2,000 lbf", "Material flaw in strut", "Insufficient acceptance testing of struts", "High-pressure helium environment stress"],
     "outcome": "Vehicle breakup 139 seconds after launch; cargo lost", "lessons_learned": ["100% acceptance testing of structural elements", "Material characterization for flight environments", "Supplier quality oversight improvements", "Design margin verification"],
     "related_incidents": ["spacex_amos6"]},
    {"id": "spacex_amos6", "date": "2016-09-01", "mission": "SpaceX AMOS-6", "vehicle": "Falcon 9 FT",
     "root_cause": "COPV helium tank breach in second stage LOX during fueling",
     "contributing_factors": ["Solid oxygen accumulation in COPV overwrap", "Subcooled LOX loading procedure", "Helium loading sequence interaction", "Novel failure mode not previously observed"],
     "outcome": "Vehicle and payload destroyed on pad during pre-launch fueling", "lessons_learned": ["COPV design revision for subcooled propellants", "Loading sequence safety analysis", "Pad operations risk re-evaluation", "Novel failure mode investigation processes"],
     "related_incidents": ["spacex_crs7"]},
    {"id": "soyuz_ms10", "date": "2018-10-11", "mission": "Soyuz MS-10", "vehicle": "Soyuz-FG",
     "root_cause": "Strap-on booster separation sensor damaged during assembly, causing asymmetric separation",
     "contributing_factors": ["Assembly procedure error bent separation sensor", "Quality control missed damage", "Sensor not verified after integration", "Launch abort system activated successfully"],
     "outcome": "Crew survived via launch escape system; ballistic re-entry", "lessons_learned": ["Post-integration verification of critical sensors", "Assembly procedure safeguards", "Launch escape system validation proven", "Quality control at integration level"],
     "related_incidents": ["soyuz_1"]},
    {"id": "jwst_deployment", "date": "2022-01-24", "mission": "James Webb Space Telescope", "vehicle": "JWST",
     "root_cause": "N/A - successful but with 344 single-point failures during deployment",
     "contributing_factors": ["Unprecedented mechanical complexity", "10+ year development delays", "Cost growth from $1B to $10B", "No servicing capability at L2"],
     "outcome": "Successful deployment; all 344 potential failure points cleared", "lessons_learned": ["Extensive ground testing of deployment sequences", "Phased deployment with verification gates", "Risk communication and management", "Patience in complex deployments"],
     "related_incidents": ["hubble_mirror"]},
    {"id": "iss_coolant_leak", "date": "2023-12-14", "mission": "ISS Operations", "vehicle": "ISS / Soyuz MS-22",
     "root_cause": "Micrometeorite impact punctured external radiator coolant loop on Soyuz MS-22",
     "contributing_factors": ["Increasing orbital debris environment", "Aging Soyuz hardware", "Limited crew protection options", "Replacement Soyuz required expedited launch"],
     "outcome": "Soyuz MS-22 declared unfit for crew return; MS-23 launched empty as replacement", "lessons_learned": ["Debris protection for docked vehicles", "Rapid crew return vehicle replacement capability", "Coolant system vulnerability assessment", "Contingency crew return planning"],
     "related_incidents": ["mir_collision"]},
    {"id": "vostok1", "date": "1961-04-12", "mission": "Vostok 1", "vehicle": "Vostok 3KA",
     "root_cause": "Service module failed to separate cleanly; connected by wire bundle for 10 minutes",
     "contributing_factors": ["Strap not fully released during separation", "High re-entry heating on exposed connection", "Wire eventually burned through", "Limited real-time ground communication"],
     "outcome": "Gagarin survived; tumbling entry until wire burned through", "lessons_learned": ["Clean separation mechanisms essential", "Redundant separation systems", "Real-time telemetry for critical events", "First human spaceflight succeeded despite anomaly"],
     "related_incidents": ["soyuz_1"]},
    {"id": "mercury_atlas6", "date": "1962-02-20", "mission": "Mercury-Atlas 6", "vehicle": "Friendship 7",
     "root_cause": "Erroneous signal indicated heat shield unlatched (Segment 51)",
     "contributing_factors": ["Faulty sensor gave false reading", "Ground controllers debated venting retropack", "Glenn not informed of potential issue initially", "Retropack left attached as contingency"],
     "outcome": "Glenn completed 3 orbits safely; sensor was faulty", "lessons_learned": ["Sensor redundancy for critical indications", "Crew must be informed of all anomalies", "Conservative decision-making proved correct", "Post-flight investigation of false signals"],
     "related_incidents": ["gemini8"]},
    {"id": "salyut1_depressurization", "date": "1971-06-30", "mission": "Salyut 1 / Soyuz 11", "vehicle": "Soyuz 7K-OKS",
     "root_cause": "Ventilation valve opened prematurely during orbital module separation",
     "contributing_factors": ["Valve susceptible to pyrotechnic shock", "No spacesuits worn", "Cosmonauts could not close valve in time", "Single-fault failure mode"],
     "outcome": "All three crew members lost", "lessons_learned": ["Spacesuits required during dynamic phases", "Valve protection from mechanical shock", "Rapid repressurization capability", "Abort options during separation"],
     "related_incidents": ["soyuz_11"]},
    {"id": "proton_july2013", "date": "2013-07-02", "mission": "Proton-M / Three GLONASS", "vehicle": "Proton-M",
     "root_cause": "Angular velocity sensors installed upside-down",
     "contributing_factors": ["Sensors could physically be installed incorrectly", "No functional test detected inversion", "Assembly worker error", "Poka-yoke (error-proofing) absent from design"],
     "outcome": "Vehicle tumbled and crashed 32 seconds after launch", "lessons_learned": ["Asymmetric connectors for orientation-sensitive components", "Functional verification after assembly", "Error-proofing in hardware design", "Post-integration orientation verification"],
     "related_incidents": ["genesis", "ariane5_501"]},
    {"id": "n1_rocket", "date": "1969-07-03", "mission": "N1 Rocket Flight #2", "vehicle": "N1 5L",
     "root_cause": "LOX pump ingested debris; explosion destroyed vehicle and launch pad",
     "contributing_factors": ["30 engines with no integrated test capability", "Debris in propellant systems", "Program underfunding vs Apollo", "Political pressure for Moon race"],
     "outcome": "Largest non-nuclear man-made explosion; destroyed launch complex", "lessons_learned": ["Integrated engine cluster testing essential", "Propellant system cleanliness", "Adequate funding for test programs", "Do not skip test phases for schedule"],
     "related_incidents": ["antares_orb3"]},
    {"id": "titan_iv_b32", "date": "1999-04-30", "mission": "Titan IV B-32 / Milstar", "vehicle": "Titan IV B / Centaur",
     "root_cause": "Software error in Centaur upper stage guidance - roll rate filter constant wrong",
     "contributing_factors": ["Manual data entry error in flight software", "Inadequate software verification", "No independent cross-check of parameters", "Human error in critical data input"],
     "outcome": "Milstar satellite placed in useless orbit; $1.23B loss", "lessons_learned": ["Automated configuration management", "Independent verification of flight parameters", "Human factors in software configuration", "End-to-end simulation with flight software"],
     "related_incidents": ["ariane5_501", "mars_climate_orbiter"]},
    {"id": "iss_ammonia_leak", "date": "2013-05-09", "mission": "ISS Operations", "vehicle": "ISS P6 Truss",
     "root_cause": "Ammonia coolant leak from photovoltaic thermal control system radiator",
     "contributing_factors": ["Micrometeorite or orbital debris impact suspected", "Aging station hardware", "Limited EVA repair options", "Coolant system design single-point vulnerability"],
     "outcome": "Emergency EVA repair; station systems reconfigured to backup cooling", "lessons_learned": ["MMOD protection for external coolant lines", "Spare parts pre-positioned on station", "EVA contingency procedures maintenance", "Redundant cooling loop design validation"],
     "related_incidents": ["iss_coolant_leak"]},
    {"id": "soyuz_t10_pad_abort", "date": "1983-09-26", "mission": "Soyuz T-10-1", "vehicle": "Soyuz-U / Soyuz T-10",
     "root_cause": "Launch vehicle caught fire on pad from propellant leak",
     "contributing_factors": ["Fuel valve failed to close properly", "Fire spread rapidly on vehicle", "Abort command delayed by communication failure", "Manual abort backup used"],
     "outcome": "Crew survived via launch escape tower; peak 17g acceleration", "lessons_learned": ["Launch escape system saves lives", "Automated abort triggers needed", "Communication redundancy for pad operations", "Rapid pad evacuation procedures"],
     "related_incidents": ["soyuz_ms10"]},
    {"id": "delta_ii_gps", "date": "1997-01-17", "mission": "Delta II / GPS IIR-1", "vehicle": "Delta II 7925",
     "root_cause": "GEM-40 solid rocket motor casing failure 13 seconds after liftoff",
     "contributing_factors": ["SRM casing material defect", "Shock from SRM ignition", "Debris damaged adjacent motors", "Vehicle structural failure cascade"],
     "outcome": "Vehicle destroyed; debris scattered over Cape Canaveral", "lessons_learned": ["SRM casing inspection improvements", "Range safety system activation", "Debris hazard area reassessment", "Solid motor quality assurance"],
     "related_incidents": ["challenger"]},
    {"id": "intelsat708", "date": "1996-02-14", "mission": "Intelsat 708 / Long March 3B", "vehicle": "Long March 3B",
     "root_cause": "Inertial platform failure caused vehicle to veer off course immediately after launch",
     "contributing_factors": ["Electronics solder joint failure in IMU", "Power transient damaged guidance computer", "Vehicle impacted hillside village", "Inadequate range safety system"],
     "outcome": "Vehicle crashed near launch site; casualties on ground", "lessons_learned": ["IMU redundancy requirements", "Electronic component screening", "Range safety destruct capability", "Population exclusion zones"],
     "related_incidents": ["proton_july2013"]},
    {"id": "sts51d_discovery", "date": "1985-04-19", "mission": "STS-51-D", "vehicle": "Space Shuttle Discovery",
     "root_cause": "Syncom IV-3 satellite failed to activate after deployment due to sequencer failure",
     "contributing_factors": ["Sequencer timing mechanism did not start", "Unable to repair in orbit initially", "Improvised flyswatter tool attempt", "Satellite captured on later mission STS-51-I"],
     "outcome": "Satellite retrieved and repaired on subsequent mission", "lessons_learned": ["Pre-deployment checkout procedures", "On-orbit repair capability planning", "Satellite activation redundancy", "Multi-mission recovery planning"],
     "related_incidents": ["hubble_mirror"]},
    {"id": "skylab_launch", "date": "1973-05-14", "mission": "Skylab 1", "vehicle": "Skylab / Saturn V",
     "root_cause": "Micrometeoroid shield tore away during launch, ripping off solar panel",
     "contributing_factors": ["Aerodynamic loads exceeded shield design", "Shield attachment insufficient", "Solar panel deployment mechanism damaged", "Station overheating without thermal shield"],
     "outcome": "Station saved by crew improvised sunshade on Skylab 2", "lessons_learned": ["Structural margins for aerodynamic loads", "Thermal protection redundancy", "Crew EVA repair capability essential", "Improvisation training for crews"],
     "related_incidents": ["apollo13"]},
    {"id": "foton_m_no1", "date": "2002-10-15", "mission": "Foton-M No.1", "vehicle": "Soyuz-U",
     "root_cause": "First stage engine failure due to foreign object in turbopump",
     "contributing_factors": ["Contamination in propulsion system", "Quality control failure at factory", "Debris ingested by turbopump", "Vehicle crashed 25 seconds after launch"],
     "outcome": "Vehicle crashed near launch site; one ground fatality", "lessons_learned": ["Propellant system cleanliness standards", "Turbopump inlet screening", "Factory quality control audits", "Ground safety for launch failures"],
     "related_incidents": ["n1_rocket"]},
    {"id": "cluster_ariane501", "date": "1996-06-04", "mission": "Cluster / Ariane 5 501", "vehicle": "Ariane 5",
     "root_cause": "Software exception from unhandled integer overflow in inertial navigation",
     "contributing_factors": ["Software reused from Ariane 4 without revalidation", "Horizontal velocity exceeded 16-bit range", "Both redundant IRSs had same software", "Backup failed identically to primary"],
     "outcome": "Four Cluster satellites lost; $370M mission", "lessons_learned": ["Revalidate all reused software", "Diverse redundancy in safety-critical systems", "Range checking in flight software", "Full trajectory envelope testing"],
     "related_incidents": ["ariane5_501"]},
    {"id": "xe_prime", "date": "2023-03-14", "mission": "H3 Flight 1", "vehicle": "H3 Launch Vehicle",
     "root_cause": "Second stage LE-5B-3 engine failed to ignite",
     "contributing_factors": ["Electrical system anomaly in ignition circuit", "First flight of new configuration", "Insufficient ground testing of ignition sequence", "Destruct command issued after engine failure confirmed"],
     "outcome": "Vehicle and ALOS-3 satellite lost; program delayed", "lessons_learned": ["Engine ignition system redundancy", "More extensive ground testing before first flight", "Staged approach to new vehicle introduction", "Ignition circuit reliability improvements"],
     "related_incidents": ["antares_orb3"]},
    {"id": "beresheet", "date": "2019-04-11", "mission": "Beresheet Lunar Lander", "vehicle": "Beresheet",
     "root_cause": "IMU reset during braking burn caused main engine shutdown; restart too late",
     "contributing_factors": ["Telemetry gap during critical phase", "IMU reboot took too long", "Insufficient altitude for recovery", "Low-cost design limited redundancy"],
     "outcome": "Spacecraft crashed on lunar surface", "lessons_learned": ["IMU fault tolerance in critical phases", "Telemetry during all critical events", "Altitude margins for recovery", "Cost constraints vs mission-critical redundancy"],
     "related_incidents": ["schiaparelli"]},
    {"id": "sts27_atlantis", "date": "1988-12-02", "mission": "STS-27 Atlantis", "vehicle": "Space Shuttle Atlantis OV-104",
     "root_cause": "Severe TPS damage from SRB nose cap separation - 707 tiles damaged, one missing",
     "contributing_factors": ["SRB nose cap ablative material struck orbiter", "Classified mission limited damage assessment", "Crew reported damage but imagery was classified", "Fortunate that missing tile was over steel mounting plate"],
     "outcome": "Vehicle survived re-entry despite extensive TPS damage", "lessons_learned": ["All TPS damage must be fully assessed", "Classification should not prevent safety evaluation", "Steel substrate saved vehicle by chance", "Pre-Columbia warning was not heeded"],
     "related_incidents": ["columbia", "challenger"]},
]


class KnowledgeGraphService:
    """In-memory knowledge graph over spaceflight incident corpus.

    Provides semantic search simulation, graph visualization data,
    and incident retrieval using keyword matching and AI summarization.
    """

    def __init__(self, granite_client) -> None:
        self._granite = granite_client
        self._incidents: dict[str, IncidentRecord] = {}
        self._load_corpus()

    def _load_corpus(self) -> None:
        """Load the built-in incident corpus into IncidentRecord objects."""
        for item in INCIDENTS_CORPUS:
            record = IncidentRecord(
                id=item["id"],
                date=item["date"],
                mission=item["mission"],
                vehicle=item["vehicle"],
                root_cause=item["root_cause"],
                contributing_factors=item.get("contributing_factors", []),
                outcome=item["outcome"],
                lessons_learned=item.get("lessons_learned", []),
                related_incidents=item.get("related_incidents", []),
            )
            self._incidents[record.id] = record
        logger.info("Knowledge graph loaded | incidents=%d", len(self._incidents))

    def _keyword_similarity(self, query: str, text: str) -> float:
        """Simple keyword overlap similarity score."""
        query_terms = set(query.lower().split())
        text_terms = set(text.lower().split())
        if not query_terms:
            return 0.0
        overlap = query_terms & text_terms
        return len(overlap) / len(query_terms)

    def _score_incident(self, query: str, incident: IncidentRecord) -> float:
        """Score an incident's relevance to a query."""
        fields = [
            incident.mission,
            incident.vehicle,
            incident.root_cause,
            incident.outcome,
            " ".join(incident.contributing_factors),
            " ".join(incident.lessons_learned),
        ]
        combined = " ".join(fields)
        return self._keyword_similarity(query, combined)

    async def query(self, query_text: str, top_k: int = 5) -> KnowledgeQueryResult:
        """Semantic search simulation + AI response generation.

        Args:
            query_text: Natural language query.
            top_k: Number of top results to return.

        Returns:
            KnowledgeQueryResult with AI answer and citations.
        """
        # Score and rank all incidents
        scored = [
            (self._score_incident(query_text, inc), inc)
            for inc in self._incidents.values()
        ]
        scored.sort(key=lambda x: x[0], reverse=True)
        top_results = scored[:top_k]

        # Build citations
        citations = []
        for score, inc in top_results:
            if score > 0.0:
                citations.append(
                    Citation(
                        incident_name=inc.mission,
                        section="root_cause",
                        similarity_score=min(1.0, score * 1.5),
                    )
                )

        # Generate AI answer
        context = "\n".join(
            f"- {inc.mission} ({inc.date}): {inc.root_cause}"
            for _, inc in top_results if _ > 0.0
        )
        prompt = (
            f"Based on the following spaceflight incident knowledge base:\n{context}\n\n"
            f"Answer this query: {query_text}\n\n"
            f"Provide a concise, factual answer referencing specific incidents."
        )

        try:
            response = await asyncio.wait_for(
                self._granite.generate(prompt, category="knowledge"),
                timeout=GENERATION_TIMEOUT,
            )
            answer = response.content
        except (asyncio.TimeoutError, Exception) as exc:
            logger.warning("Knowledge query AI generation failed (%s)", exc)
            if citations:
                answer = (
                    f"Based on {len(citations)} relevant incidents in the knowledge base, "
                    f"the most relevant is {citations[0].incident_name}. "
                    f"Key finding: {top_results[0][1].root_cause}"
                )
            else:
                answer = "No directly relevant incidents found for this query."

        # Build subgraph for visualization
        graph_context = self._build_subgraph([inc for _, inc in top_results[:5]])

        attribution = GraniteAttribution(
            model_name="ibm/granite-13b-chat-v2",
            model_version="2.0",
            provider=self._granite.get_active_provider(),
            badge_text="Powered by IBM Granite",
        )

        return KnowledgeQueryResult(
            query=query_text,
            answer=answer,
            citations=citations,
            graph_context=graph_context,
            attribution=attribution,
        )

    def get_graph_data(self, max_nodes: int = 200) -> GraphData:
        """Return full graph data for D3 visualization.

        Args:
            max_nodes: Maximum number of nodes to return.

        Returns:
            GraphData with nodes and edges.
        """
        nodes: list[GraphNode] = []
        edges: list[GraphEdge] = []
        node_ids: set[str] = set()

        for inc in list(self._incidents.values())[:max_nodes]:
            # Add incident node
            nodes.append(GraphNode(
                id=inc.id,
                label=inc.mission,
                type="incident",
                connection_count=len(inc.related_incidents) + len(inc.contributing_factors),
                metadata={"date": inc.date, "vehicle": inc.vehicle},
            ))
            node_ids.add(inc.id)

            # Add contributing factor nodes
            for i, factor in enumerate(inc.contributing_factors[:3]):
                factor_id = f"{inc.id}_factor_{i}"
                if factor_id not in node_ids and len(nodes) < max_nodes:
                    nodes.append(GraphNode(
                        id=factor_id,
                        label=factor[:50],
                        type="factor",
                        connection_count=1,
                        metadata={"incident": inc.id},
                    ))
                    node_ids.add(factor_id)
                    edges.append(GraphEdge(
                        source=inc.id, target=factor_id, relationship="caused_by"
                    ))

        # Add relationship edges between related incidents
        for inc in self._incidents.values():
            for related_id in inc.related_incidents:
                if related_id in node_ids and inc.id in node_ids:
                    edges.append(GraphEdge(
                        source=inc.id, target=related_id, relationship="related_to"
                    ))

        return GraphData(nodes=nodes, edges=edges)

    def get_incident(self, incident_id: str) -> IncidentRecord | None:
        """Get a single incident record by ID."""
        return self._incidents.get(incident_id)

    def search_incidents(self, query: str) -> list[IncidentRecord]:
        """Keyword search across all incidents."""
        query_lower = query.lower()
        results = []
        for inc in self._incidents.values():
            searchable = f"{inc.mission} {inc.vehicle} {inc.root_cause} {inc.outcome}".lower()
            if query_lower in searchable:
                results.append(inc)
        return results

    def _build_subgraph(self, incidents: list[IncidentRecord]) -> GraphData:
        """Build a subgraph from a list of incidents."""
        nodes: list[GraphNode] = []
        edges: list[GraphEdge] = []
        node_ids: set[str] = set()

        for inc in incidents:
            nodes.append(GraphNode(
                id=inc.id,
                label=inc.mission,
                type="incident",
                connection_count=len(inc.related_incidents),
                metadata={"date": inc.date},
            ))
            node_ids.add(inc.id)

        for inc in incidents:
            for related_id in inc.related_incidents:
                if related_id in node_ids:
                    edges.append(GraphEdge(
                        source=inc.id, target=related_id, relationship="related_to"
                    ))

        return GraphData(nodes=nodes, edges=edges)
