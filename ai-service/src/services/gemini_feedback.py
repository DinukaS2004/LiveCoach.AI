import google.generativeai as genai
from typing import Dict, Optional
from src.core.config import settings


class GeminiFeedbackService:
    """
    Uses Google Gemini API to generate personalised, precise coaching feedback
    and improvement suggestions based on biomechanical analysis scores.
    """

    def __init__(self):
        self._model: Optional[genai.GenerativeModel] = None
        self._initialised = False

    def _init_model(self):
        """Lazily initialise the Gemini model so the service starts even without a key."""
        if self._initialised:
            return

        api_key = settings.GEMINI_API_KEY
        if not api_key:
            raise RuntimeError(
                "GEMINI_API_KEY is not set. Add it to your .env file to enable AI feedback."
            )

        genai.configure(api_key=api_key)
        self._model = genai.GenerativeModel(
            model_name="gemini-2.5-flash",
            generation_config={
                "temperature": 0.7,
                "top_p": 0.9,
            },
        )
        self._initialised = True

    # ------------------------------------------------------------------
    # Public API
    # ------------------------------------------------------------------

    def generate_feedback(
        self,
        sport: str,
        shot: str,
        shot_display_name: str,
        overall_score: float,
        performance_level: str,
        avg_similarity: float,
        max_similarity: float,
        distance_to_expert: float,
        frames_analyzed: int,
    ) -> Dict[str, str]:
        """
        Returns a dict with two keys:
          - ``feedback``     : personalised paragraph on what was good / bad
          - ``improvements`` : bullet-point list of actionable improvement tips
        Falls back to rule-based text if Gemini is unavailable.
        """
        try:
            self._init_model()
            prompt = self._build_prompt(
                sport=sport,
                shot=shot,
                shot_display_name=shot_display_name,
                overall_score=overall_score,
                performance_level=performance_level,
                avg_similarity=avg_similarity,
                max_similarity=max_similarity,
                distance_to_expert=distance_to_expert,
                frames_analyzed=frames_analyzed,
            )
            response = self._model.generate_content(prompt)
            return self._parse_response(response.text)
        except Exception as exc:
            # Graceful fallback — do not crash the analysis endpoint
            return self._rule_based_fallback(
                sport=sport,
                shot_display_name=shot_display_name,
                overall_score=overall_score,
                performance_level=performance_level,
                error=str(exc),
            )

    # ------------------------------------------------------------------
    # Private helpers
    # ------------------------------------------------------------------

    def _build_prompt(
        self,
        sport: str,
        shot: str,
        shot_display_name: str,
        overall_score: float,
        performance_level: str,
        avg_similarity: float,
        max_similarity: float,
        distance_to_expert: float,
        frames_analyzed: int,
    ) -> str:
        similarity_pct = round(avg_similarity * 100, 1)
        max_sim_pct = round(max_similarity * 100, 1)

        return f"""You are an elite sports biomechanics coach specialising in {sport.title()}.
A player just performed a **{shot_display_name}** and their technique was analysed by an AI 
pose-estimation system that compared them to professional players.

## Analysis Results
- Overall Score      : {overall_score:.1f} / 100
- Performance Level  : {performance_level}
- Average Similarity : {similarity_pct}% (vs professional benchmark)
- Peak Similarity    : {max_sim_pct}%
- Expert Distance    : {distance_to_expert:.3f} (lower = closer to pro)
- Frames Analysed    : {frames_analyzed}

## Your Task
Write a response in **exactly** the following format — no extra headings:

FEEDBACK:
<2–3 sentences of personalised, encouraging coaching feedback. Reference the actual scores 
naturally. Acknowledge strengths if score > 60, be constructive if lower.>

IMPROVEMENTS:
- <Specific, actionable tip 1 for {shot_display_name} technique>
- <Specific, actionable tip 2>
- <Specific, actionable tip 3>
- <Specific, actionable tip 4 — only if highly relevant, otherwise omit>

Rules:
- Stay sport-specific ({sport.title()} / {shot_display_name}).
- Use simple, motivating language suitable for athletes of all levels.
- Keep feedback under 80 words.
- Each improvement tip must be concrete and drillable (not vague like "practise more").
- Do NOT repeat the numeric scores verbatim in the improvements section.
"""

    @staticmethod
    def _parse_response(text: str) -> Dict[str, str]:
        """Split the Gemini response on the FEEDBACK / IMPROVEMENTS markers."""
        feedback = ""
        improvements = ""

        try:
            if "FEEDBACK:" in text and "IMPROVEMENTS:" in text:
                parts = text.split("IMPROVEMENTS:", 1)
                feedback_raw = parts[0].split("FEEDBACK:", 1)[-1].strip()
                improvements_raw = parts[1].strip()

                feedback = feedback_raw
                improvements = improvements_raw
            else:
                # If model didn't follow the format, return the whole text as feedback
                feedback = text.strip()
                improvements = "• Review your technique video with a coach for personalised tips."
        except Exception:
            feedback = text.strip()
            improvements = "• Review your technique video with a coach for personalised tips."

        return {"feedback": feedback, "improvements": improvements}

    @staticmethod
    def _rule_based_fallback(
        sport: str,
        shot_display_name: str,
        overall_score: float,
        performance_level: str,
        error: str = "",
    ) -> Dict[str, str]:
        """Simple deterministic feedback used when Gemini is unavailable."""
        if overall_score >= 75:
            feedback = (
                f"Great {shot_display_name}! Your technique is at {performance_level} level "
                f"with a score of {overall_score:.0f}/100. You are closely matching professional "
                f"movement patterns — keep refining the finer details."
            )
        elif overall_score >= 55:
            feedback = (
                f"Good effort on your {shot_display_name}! You scored {overall_score:.0f}/100 "
                f"({performance_level} level). Your core movement is solid; focus on the "
                f"specific tips below to close the gap with elite performers."
            )
        else:
            feedback = (
                f"You scored {overall_score:.0f}/100 on your {shot_display_name} — that's a "
                f"{performance_level} level performance. Don't be discouraged; consistent "
                f"practice on the fundamentals below will show rapid improvement."
            )

        sport_tips = {
            "badminton": [
                "• Keep your racquet arm elbow high before contact on overhead shots.",
                "• Rotate your forearm (pronation) through the smash to generate more power.",
                "• Ensure your non-racquet arm points toward the shuttle for balance.",
                "• Land on your dominant foot and recover to the centre of the court.",
            ],
            "cricket": [
                "• Keep your head still and eyes level at the point of contact.",
                "• Drive through the ball with a straight bat for more control.",
                "• Ensure your front foot is close to the pitch of the ball.",
                "• Follow through high with the bat after contact.",
            ],
        }

        tips = sport_tips.get(
            sport.lower(),
            [
                "• Focus on body balance throughout the movement.",
                "• Record yourself and compare frame-by-frame with professionals.",
                "• Work with a coach to identify sport-specific technique gaps.",
            ],
        )

        return {"feedback": feedback, "improvements": "\n".join(tips)}
