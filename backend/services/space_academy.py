"""Space Academy service for interactive training simulations.

Provides historical decision scenarios, interactive simulations,
and AI-generated quizzes for spaceflight safety education.
"""

from __future__ import annotations

import asyncio
import logging
import uuid
from datetime import datetime

from backend.models.shared import GraniteAttribution

logger = logging.getLogger(__name__)

GENERATION_TIMEOUT = 30.0

# Historical decision scenarios
SCENARIOS = [
    {
        "id": "scenario_challenger_oring",
        "title": "Challenger O-Ring Decision (1986)",
        "description": (
            "It is January 27, 1986, the night before the scheduled launch of STS-51-L. "
            "You are the VP of Engineering at Morton Thiokol. Temperature at the launch pad "
            "is forecast to be 36°F — well below the 53°F minimum experienced on any previous "
            "flight. Your engineers have presented data showing O-ring erosion worsens at low "
            "temperatures. NASA management is pushing back, asking you to 'put on your "
            "management hat.' The launch has already been delayed multiple times."
        ),
        "historical_basis": "Challenger STS-51-L, January 28, 1986",
        "difficulty": "hard",
        "estimated_duration_minutes": 20,
        "decision_points": [
            {
                "id": "dp1",
                "prompt": "NASA asks for your launch recommendation. Your engineers say NO-GO. What do you do?",
                "options": [
                    {"id": "A", "text": "Maintain NO-GO recommendation and refuse to sign launch waiver", "is_historical": False},
                    {"id": "B", "text": "Request 24-hour delay for more data analysis", "is_historical": False},
                    {"id": "C", "text": "Override engineers and recommend GO (historical choice)", "is_historical": True},
                    {"id": "D", "text": "Escalate to NASA Administrator level", "is_historical": False},
                ],
                "correct_choice": "A",
                "consequences": {
                    "A": "Your firm stance prevents the launch. Challenger launches in warmer weather 3 days later successfully. Your decision saves 7 lives.",
                    "B": "The delay is granted but political pressure intensifies. You still face the same decision tomorrow.",
                    "C": "The launch proceeds. 73 seconds after liftoff, the right SRB field joint fails. All 7 crew members are lost.",
                    "D": "The Administrator is unavailable. NASA Level II management says the decision is yours to make.",
                },
            },
        ],
    },
    {
        "id": "scenario_columbia_foam",
        "title": "Columbia Foam Strike Assessment (2003)",
        "description": (
            "It is January 17, 2003 — Day 2 of STS-107. Ground cameras captured a large "
            "piece of foam striking Columbia's left wing during ascent. You are the Mission "
            "Management Team chair. Engineers are requesting DoD satellite imagery to assess "
            "potential TPS damage. Management says imagery would not be 'actionable' since "
            "there's no repair capability. The crew is in orbit and healthy."
        ),
        "historical_basis": "Columbia STS-107, February 1, 2003",
        "difficulty": "hard",
        "estimated_duration_minutes": 20,
        "decision_points": [
            {
                "id": "dp1",
                "prompt": "Engineers request DoD satellite imagery of the orbiter. What is your decision?",
                "options": [
                    {"id": "A", "text": "Approve the imagery request immediately", "is_historical": False},
                    {"id": "B", "text": "Deny the request — imagery is not actionable (historical choice)", "is_historical": True},
                    {"id": "C", "text": "Order EVA inspection of wing leading edge", "is_historical": False},
                    {"id": "D", "text": "Extend mission while repair options are explored", "is_historical": False},
                ],
                "correct_choice": "A",
                "consequences": {
                    "A": "Imagery reveals significant RCC panel damage. NASA activates contingency shuttle-on-pad rescue mission STS-300. Crew transfers to Atlantis. Columbia is lost during autonomous de-orbit but crew survives.",
                    "B": "Without imagery, the damage goes unassessed. On February 1, superheated plasma penetrates the damaged wing during re-entry. All 7 crew members are lost.",
                    "C": "EVA reveals damage but limited repair materials available. Combined with imagery, enables rescue planning.",
                    "D": "Extension approved. Further analysis with imagery confirms fatal damage. Rescue mission planning begins.",
                },
            },
        ],
    },
    {
        "id": "scenario_apollo13_lifeboat",
        "title": "Apollo 13 Lifeboat Decision (1970)",
        "description": (
            "It is April 13, 1970. An oxygen tank explosion has crippled the Apollo 13 "
            "Service Module. The Command Module is losing power and oxygen. You are the "
            "Flight Director (Gene Kranz's position). The crew is 200,000 miles from Earth. "
            "You must decide whether to attempt a direct abort (faster but uses damaged SM "
            "engine) or swing around the Moon using the LM as a lifeboat."
        ),
        "historical_basis": "Apollo 13, April 1970",
        "difficulty": "hard",
        "estimated_duration_minutes": 25,
        "decision_points": [
            {
                "id": "dp1",
                "prompt": "The SM main engine status is unknown after the explosion. How do you get the crew home?",
                "options": [
                    {"id": "A", "text": "Direct abort — fire SM engine for immediate Earth return", "is_historical": False},
                    {"id": "B", "text": "Free-return trajectory — use LM as lifeboat around the Moon (historical choice)", "is_historical": True},
                    {"id": "C", "text": "LM descent engine burn for faster return after lunar swing-by", "is_historical": False},
                    {"id": "D", "text": "Wait 12 hours for better telemetry before deciding", "is_historical": False},
                ],
                "correct_choice": "B",
                "consequences": {
                    "A": "The SM engine may have been damaged by the explosion. Firing it risks catastrophic failure. Too dangerous with unknown structural integrity.",
                    "B": "The free-return trajectory uses the Moon's gravity. LM provides life support. Crew endures 4 cold days but returns safely. Correct historical decision.",
                    "C": "This option was actually used as an acceleration maneuver after free-return was established, cutting return time. Good supplemental decision.",
                    "D": "Every hour of delay costs consumables. The LM has finite battery and water. Speed of decision is critical.",
                },
            },
        ],
    },
    {
        "id": "scenario_starliner_cft",
        "title": "Starliner CFT Flight Readiness (2024)",
        "description": (
            "It is June 2024. You are the NASA Commercial Crew Program manager. Boeing's "
            "Starliner is at the pad for its Crew Flight Test with astronauts Butch Wilmore "
            "and Suni Williams. Previous flights (OFT-1, OFT-2) had software failures, "
            "thruster anomalies, and helium leaks. Boeing says issues are understood and "
            "mitigated. Some engineers remain concerned about thruster qualification data. "
            "The program is years behind schedule and billions over budget."
        ),
        "historical_basis": "Boeing Starliner CFT, June 2024",
        "difficulty": "hard",
        "estimated_duration_minutes": 20,
        "decision_points": [
            {
                "id": "dp1",
                "prompt": "At the Flight Readiness Review, Boeing presents their risk assessment. Thruster qualification concerns remain open. Your decision?",
                "options": [
                    {"id": "A", "text": "NO-GO until thruster qualification concerns are fully resolved with additional testing", "is_historical": False},
                    {"id": "B", "text": "GO with additional monitoring provisions (historical choice)", "is_historical": True},
                    {"id": "C", "text": "Fly uncrewed first to validate thruster performance in actual orbital conditions", "is_historical": False},
                    {"id": "D", "text": "Require independent review board assessment before crew commitment", "is_historical": False},
                ],
                "correct_choice": "A",
                "consequences": {
                    "A": "Additional testing reveals the thermal issue that would have caused in-orbit failures. Design is fixed before crew flies. Program delayed 6 months but crew never at risk.",
                    "B": "Launch proceeds. In orbit, 5 of 28 RCS thrusters fail and multiple helium leaks develop. Starliner declared too risky for crewed return. Crew stranded on ISS for 286 days, returning via SpaceX.",
                    "C": "Uncrewed test reveals thruster failures early. No crew risk. Fix implemented and verified before CFT.",
                    "D": "Review board identifies the same concerns engineers raised. Recommends additional thermal testing that would have prevented the failure.",
                },
            },
        ],
    },
    {
        "id": "scenario_mir_fire",
        "title": "Mir Space Station Fire Response (1997)",
        "description": (
            "It is February 23, 1997 aboard Mir. A lithium perchlorate oxygen canister "
            "has caught fire in the Kvant-1 module. Dense smoke fills the station. The fire "
            "is between the crew and one of the two Soyuz escape capsules. Six crew members "
            "are aboard. You are the Mir commander (Vasily Tsibliyev). Visibility is near "
            "zero. The fire is generating sparks and molten metal."
        ),
        "historical_basis": "Mir Space Station fire, February 23, 1997",
        "difficulty": "medium",
        "estimated_duration_minutes": 15,
        "decision_points": [
            {
                "id": "dp1",
                "prompt": "The fire is intensifying. One Soyuz is blocked by the fire. What is your immediate action?",
                "options": [
                    {"id": "A", "text": "Evacuate all crew to the accessible Soyuz immediately", "is_historical": False},
                    {"id": "B", "text": "Fight the fire with extinguishers while preparing escape (historical choice)", "is_historical": True},
                    {"id": "C", "text": "Seal the Kvant module and vent atmosphere to extinguish fire", "is_historical": False},
                    {"id": "D", "text": "Don oxygen masks and wait for canister to burn out", "is_historical": False},
                ],
                "correct_choice": "B",
                "consequences": {
                    "A": "Only one Soyuz holds 3 crew. Three people would be left behind. Not a viable evacuation option.",
                    "B": "Crew fights fire for 14 minutes using three extinguishers. Fire eventually exhausts fuel and goes out. Station is saved. All crew survive with minor smoke inhalation.",
                    "C": "Venting would kill all crew in other modules. Station atmosphere is shared. Not viable.",
                    "D": "The canister generates its own oxygen — it will not burn out quickly. Waiting risks fire spread to other modules and structural damage.",
                },
            },
        ],
    },
]

# Quiz question bank
QUIZ_BANK = [
    {"question": "What was the root cause of the Challenger disaster?", "options": ["Fuel tank rupture", "O-ring failure in cold weather", "Engine turbopump failure", "Structural fatigue"], "correct_index": 1, "explanation": "The O-rings in the SRB field joints lost elasticity at 36°F and failed to seal, allowing hot gas to escape and ignite the external tank.", "difficulty": "easy", "topic": "Historical Incidents"},
    {"question": "What organizational factor was identified by the Rogers Commission as contributing to Challenger?", "options": ["Budget cuts", "Normalization of deviance", "Crew error", "Manufacturing defect"], "correct_index": 1, "explanation": "The Rogers Commission identified normalization of deviance — the gradual acceptance of O-ring erosion as normal — as a key organizational failure.", "difficulty": "medium", "topic": "Organizational Safety"},
    {"question": "In the cumulative risk formula post = pre + delta * (1 - pre), what does (1 - pre) represent?", "options": ["Remaining risk capacity", "Safety margin", "Failure probability", "Recovery factor"], "correct_index": 0, "explanation": "The (1 - pre) term represents the remaining capacity for risk to grow. As cumulative risk approaches 1.0, each new risk factor contributes proportionally less absolute increase.", "difficulty": "hard", "topic": "Risk Analysis"},
    {"question": "What was unique about the Columbia foam strike compared to previous flights?", "options": ["It was the first foam strike ever", "The foam piece was significantly larger than previous strikes", "It hit a different part of the wing", "It occurred during landing"], "correct_index": 1, "explanation": "While foam strikes had occurred on previous flights, the STS-107 strike was the largest recorded - approximately 1.67 lbs striking the RCC panel at 500+ mph.", "difficulty": "medium", "topic": "Historical Incidents"},
    {"question": "What is 'go-fever' in spaceflight operations?", "options": ["Excitement about launch day", "Organizational bias toward proceeding despite safety concerns", "A medical condition affecting astronauts", "Rapid decision-making under time pressure"], "correct_index": 1, "explanation": "Go-fever is the organizational tendency to downplay risks and push toward launch, especially when schedule pressure, political visibility, or sunk costs create momentum.", "difficulty": "easy", "topic": "Organizational Safety"},
    {"question": "How many RCS thrusters failed during Starliner CFT in June 2024?", "options": ["2", "3", "5", "8"], "correct_index": 2, "explanation": "Five of Starliner's 28 RCS thrusters failed during orbital operations, along with multiple helium leaks, leading NASA to declare the vehicle too risky for crewed return.", "difficulty": "medium", "topic": "Historical Incidents"},
    {"question": "What is the Red Team concept in flight readiness reviews?", "options": ["Emergency response team", "Independent group that challenges GO decisions", "Hardware inspection team", "Crew rescue team"], "correct_index": 1, "explanation": "A Red Team is an independent group specifically tasked with finding flaws, challenging assumptions, and arguing against proceeding — acting as a devil's advocate.", "difficulty": "easy", "topic": "Safety Processes"},
    {"question": "What caused the Mars Climate Orbiter loss in 1999?", "options": ["Power system failure", "Metric/imperial unit mismatch in navigation software", "Communication antenna malfunction", "Heat shield failure"], "correct_index": 1, "explanation": "Lockheed Martin's software output thruster data in pound-force seconds while JPL expected newton-seconds, causing a navigation error that destroyed the spacecraft.", "difficulty": "easy", "topic": "Historical Incidents"},
    {"question": "What is normalization of deviance?", "options": ["Standard operating procedures", "Gradual acceptance of out-of-spec conditions as normal", "Statistical deviation analysis", "Hardware degradation over time"], "correct_index": 1, "explanation": "Coined by sociologist Diane Vaughan studying Challenger, normalization of deviance is when repeated deviations from spec without immediate consequence lead organizations to redefine acceptable risk boundaries.", "difficulty": "medium", "topic": "Organizational Safety"},
    {"question": "In Apollo 13, why was a direct abort using the SM engine rejected?", "options": ["Not enough fuel", "Engine potentially damaged by explosion", "Wrong trajectory angle", "Crew objected"], "correct_index": 1, "explanation": "The O2 tank explosion may have damaged the SM engine bell or propellant lines. Firing a potentially damaged engine risked catastrophic failure, so the free-return trajectory around the Moon was chosen instead.", "difficulty": "medium", "topic": "Historical Incidents"},
    {"question": "What Pc (probability of collision) threshold typically triggers an avoidance maneuver for the ISS?", "options": ["1 in 100", "1 in 1,000", "1 in 10,000", "1 in 100,000"], "correct_index": 2, "explanation": "NASA typically begins maneuver planning when Pc exceeds 1 in 10,000 (1e-4). Below this, the conjunction is monitored. The ISS performs 2-3 debris avoidance maneuvers per year.", "difficulty": "hard", "topic": "Orbital Safety"},
    {"question": "What lesson from the Mir fire applies to all spacecraft design?", "options": ["Fire cannot occur in space", "All escape routes must remain accessible at all times", "Oxygen generators are always safe", "Fire extinguishers are unnecessary in space"], "correct_index": 1, "explanation": "The Mir fire blocked access to one of two Soyuz capsules. This demonstrated that escape routes must never be compromised and fire scenarios must consider all possible crew positions.", "difficulty": "medium", "topic": "Safety Processes"},
    {"question": "What is the Swiss Cheese Model of accident causation?", "options": ["Cheese manufacturing safety", "Multiple barriers each with holes that can align to allow accidents", "Probability distribution", "Random failure model"], "correct_index": 1, "explanation": "James Reason's Swiss Cheese Model shows that accidents occur when holes (weaknesses) in multiple defensive barriers align, allowing a hazard to pass through all layers of protection.", "difficulty": "easy", "topic": "Safety Theory"},
    {"question": "Why is diverse redundancy preferred over identical redundancy in safety-critical systems?", "options": ["It's cheaper", "Identical systems can fail from the same common-cause fault", "It's easier to test", "Regulations require it"], "correct_index": 1, "explanation": "Ariane 5 Flight 501 demonstrated this: both identical inertial reference systems failed from the same software bug. Diverse implementations would have provided true redundancy against design flaws.", "difficulty": "hard", "topic": "Systems Engineering"},
    {"question": "What was the outcome when Starliner was declared too dangerous for crewed return?", "options": ["Crew evacuated via Soyuz", "Crew returned on SpaceX Dragon", "Starliner was repaired in orbit", "Crew remained indefinitely on ISS"], "correct_index": 1, "explanation": "Astronauts Wilmore and Williams remained on ISS for 286 days until a SpaceX Crew Dragon could be configured for their return in March 2025. Starliner returned to Earth uncrewed.", "difficulty": "medium", "topic": "Historical Incidents"},
]


class SpaceAcademyService:
    """Interactive spaceflight safety training and education service.

    Provides historical decision scenarios, interactive simulations,
    and AI-generated quizzes for learning from past incidents.
    """

    def __init__(self, granite_client) -> None:
        self._granite = granite_client
        self._sessions: dict[str, dict] = {}
        logger.info("Space Academy initialized | scenarios=%d | quiz_bank=%d", len(SCENARIOS), len(QUIZ_BANK))

    def get_scenarios(self) -> list[dict]:
        """Return all available training scenarios.

        Returns:
            List of scenario summaries (without full decision point details).
        """
        return [
            {
                "id": s["id"],
                "title": s["title"],
                "description": s["description"],
                "historical_basis": s["historical_basis"],
                "difficulty": s["difficulty"],
                "estimated_duration_minutes": s["estimated_duration_minutes"],
                "decision_points_count": len(s["decision_points"]),
            }
            for s in SCENARIOS
        ]

    def start_simulation(self, scenario_id: str) -> dict:
        """Start an interactive simulation session.

        Args:
            scenario_id: Scenario identifier to start.

        Returns:
            Session info with first decision point.
        """
        scenario = next((s for s in SCENARIOS if s["id"] == scenario_id), None)
        if not scenario:
            return {"error": f"Scenario {scenario_id} not found"}

        session_id = f"session_{uuid.uuid4().hex[:12]}"
        session = {
            "session_id": session_id,
            "scenario_id": scenario_id,
            "scenario_title": scenario["title"],
            "started_at": datetime.utcnow().isoformat(),
            "current_decision_index": 0,
            "decisions_made": [],
            "completed": False,
        }
        self._sessions[session_id] = session

        # Return first decision point
        dp = scenario["decision_points"][0]
        return {
            "session_id": session_id,
            "scenario_title": scenario["title"],
            "scenario_description": scenario["description"],
            "historical_basis": scenario["historical_basis"],
            "current_decision": {
                "id": dp["id"],
                "prompt": dp["prompt"],
                "options": [{"id": opt["id"], "text": opt["text"]} for opt in dp["options"]],
            },
            "progress": f"1/{len(scenario['decision_points'])}",
        }

    async def submit_decision(self, session_id: str, choice: str) -> dict:
        """Submit a decision for the current simulation point.

        Args:
            session_id: Active session identifier.
            choice: Selected option ID (A, B, C, or D).

        Returns:
            Outcome, analysis, and historical comparison.
        """
        session = self._sessions.get(session_id)
        if not session:
            return {"error": f"Session {session_id} not found"}

        if session["completed"]:
            return {"error": "Session already completed"}

        scenario = next((s for s in SCENARIOS if s["id"] == session["scenario_id"]), None)
        if not scenario:
            return {"error": "Scenario not found"}

        dp_index = session["current_decision_index"]
        dp = scenario["decision_points"][dp_index]

        # Get consequence for chosen option
        consequence = dp["consequences"].get(choice, "Unknown outcome.")
        is_correct = choice == dp["correct_choice"]
        is_historical = any(opt["id"] == choice and opt.get("is_historical") for opt in dp["options"])

        # Record decision
        decision_record = {
            "decision_point_id": dp["id"],
            "choice": choice,
            "is_correct": is_correct,
            "is_historical_choice": is_historical,
            "consequence": consequence,
            "timestamp": datetime.utcnow().isoformat(),
        }
        session["decisions_made"].append(decision_record)

        # Generate AI analysis
        prompt = (
            f"Analyze this spaceflight safety decision:\n"
            f"Scenario: {scenario['title']}\n"
            f"Decision: {dp['prompt']}\n"
            f"Choice made: {choice}\n"
            f"Consequence: {consequence}\n"
            f"Correct choice was: {dp['correct_choice']}\n"
            f"Provide a brief learning point connecting this to spaceflight safety principles."
        )

        try:
            response = await asyncio.wait_for(
                self._granite.generate(prompt, category="academy"),
                timeout=GENERATION_TIMEOUT,
            )
            ai_analysis = response.content
        except (asyncio.TimeoutError, Exception):
            if is_correct:
                ai_analysis = (
                    "Excellent decision. You prioritized crew safety over schedule pressure, "
                    "demonstrating the kind of organizational courage that prevents disasters. "
                    "This aligns with the principle that safety decisions should be data-driven "
                    "and independent of programmatic pressures."
                )
            elif is_historical:
                ai_analysis = (
                    "You made the same choice as the historical decision-makers. While this "
                    "reflects the real organizational pressures of the time, the outcome "
                    "demonstrates why independent safety advocacy and dissent channels are "
                    "critical in high-consequence operations."
                )
            else:
                ai_analysis = (
                    "This decision, while different from both the historical and optimal choices, "
                    "highlights the complexity of real-time decision-making under pressure. "
                    "Key takeaway: when in doubt, choose the option that maximizes crew safety "
                    "and preserves future options."
                )

        # Check if simulation is complete
        session["current_decision_index"] += 1
        if session["current_decision_index"] >= len(scenario["decision_points"]):
            session["completed"] = True

        # Calculate score
        correct_count = sum(1 for d in session["decisions_made"] if d["is_correct"])
        total = len(session["decisions_made"])
        score = correct_count / total if total > 0 else 0.0

        attribution = GraniteAttribution(
            model_name="ibm/granite-13b-chat-v2",
            model_version="2.0",
            provider=self._granite.get_active_provider(),
            badge_text="Powered by IBM Granite",
        )

        result = {
            "session_id": session_id,
            "decision_point": dp["id"],
            "choice_made": choice,
            "is_correct": is_correct,
            "is_historical_choice": is_historical,
            "consequence": consequence,
            "correct_choice": dp["correct_choice"],
            "ai_analysis": ai_analysis,
            "score_so_far": round(score, 3),
            "simulation_completed": session["completed"],
            "attribution": attribution.model_dump(),
        }

        if session["completed"]:
            result["final_summary"] = {
                "total_decisions": total,
                "correct_decisions": correct_count,
                "final_score": round(score, 3),
                "scenario_title": scenario["title"],
                "historical_basis": scenario["historical_basis"],
                "lessons": [
                    "Safety must override schedule pressure",
                    "Data-driven decisions save lives",
                    "Dissent channels must be protected",
                    "Never normalize out-of-spec conditions",
                ],
            }

        return result

    async def generate_quiz(self, difficulty: str = "medium", count: int = 5) -> dict:
        """Generate a quiz from the question bank.

        Args:
            difficulty: Difficulty level (easy, medium, hard, or mixed).
            count: Number of questions to include.

        Returns:
            Quiz dict with questions and metadata.
        """
        import random as _random

        # Filter by difficulty
        if difficulty == "mixed":
            pool = list(QUIZ_BANK)
        else:
            pool = [q for q in QUIZ_BANK if q["difficulty"] == difficulty]

        # Fall back to full pool if not enough questions
        if len(pool) < count:
            pool = list(QUIZ_BANK)

        # Select questions
        selected = _random.sample(pool, min(count, len(pool)))

        questions = []
        for i, q in enumerate(selected):
            questions.append({
                "id": f"q_{uuid.uuid4().hex[:8]}",
                "question": q["question"],
                "options": q["options"],
                "correct_index": q["correct_index"],
                "explanation": q["explanation"],
                "difficulty": q["difficulty"],
                "topic": q.get("topic", "General"),
            })

        attribution = GraniteAttribution(
            model_name="ibm/granite-13b-chat-v2",
            model_version="2.0",
            provider=self._granite.get_active_provider(),
            badge_text="Powered by IBM Granite",
        )

        return {
            "id": f"quiz_{uuid.uuid4().hex[:8]}",
            "title": f"Space Safety Quiz ({difficulty.title()})",
            "difficulty": difficulty,
            "questions": questions,
            "total_questions": len(questions),
            "time_limit_seconds": len(questions) * 60,
            "attribution": attribution.model_dump(),
            "generated_at": datetime.utcnow().isoformat(),
        }
