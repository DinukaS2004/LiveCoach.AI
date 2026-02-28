from fastapi import APIRouter, File, UploadFile, HTTPException, Header
from fastapi.responses import JSONResponse
import shutil
import tempfile
import os
from pathlib import Path

from src.core.config import settings
from src.core.sports_config import SPORTS_CONFIG
from src.services.skeleton_extractor import SkeletonExtractor
from src.services.model_manager import ModelManager
from src.services.analyzer import Analyzer
from src.api.schemas import AnalysisResponse, SportsListResponse

router = APIRouter()

# Initialize services
extractor = SkeletonExtractor()
model_manager = ModelManager()

# Security middleware
async def verify_api_key(x_api_key: str = Header(...)):
    if x_api_key != settings.API_KEY:
        raise HTTPException(status_code=401, detail="Invalid API key")

@router.get("/")
async def root():
    return {
        "message": "LiveCoach.AI - AI Service",
        "version": "1.0.0",
        "status": "healthy"
    }

@router.get("/sports", response_model=SportsListResponse)
async def get_sports():
    return {"sports": SPORTS_CONFIG}

@router.post("/analyze/{sport}/{shot}", response_model=AnalysisResponse)
async def analyze_technique(
    sport: str,
    shot: str,
    video: UploadFile = File(...),
    x_api_key: str = Header(...)
):
    await verify_api_key(x_api_key)
    
    if sport not in SPORTS_CONFIG:
        raise HTTPException(400, f"Unknown sport: {sport}")
    if shot not in SPORTS_CONFIG[sport]["shots"]:
        raise HTTPException(400, f"Unknown shot: {shot}")
    
    temp_file = tempfile.NamedTemporaryFile(delete=False, suffix=Path(video.filename).suffix)
    try:
        with open(temp_file.name, 'wb') as buffer:
            shutil.copyfileobj(video.file, buffer)
        
        sequence = extractor.extract_from_video(temp_file.name)
        if len(sequence) < 10:
            raise HTTPException(400, "Insufficient frames detected")
        
        sequence = extractor.normalize_skeleton(sequence)
        model, pro_embeddings = model_manager.load_model(sport, shot)
        results = Analyzer.analyze(model, pro_embeddings, sequence)
        
        results['success'] = True
        results['sport'] = sport
        results['shot'] = shot
        results['shot_display_name'] = SPORTS_CONFIG[sport]["shots"][shot]["display_name"]
        results['frames_analyzed'] = len(sequence)
        
        return results
    finally:
        try:
            os.unlink(temp_file.name)
        except:
            pass