from pydantic import BaseModel
from typing import Dict, List

class AnalysisResponse(BaseModel):
    success: bool
    sport: str
    shot: str
    shot_display_name: str
    overall_score: float
    performance_level: str
    distance_to_expert: float
    avg_similarity: float
    max_similarity: float
    frames_analyzed: int

class SportsListResponse(BaseModel):
    sports: Dict