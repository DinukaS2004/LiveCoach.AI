import torch
import torch.nn.functional as F
from pathlib import Path
from typing import Dict, Tuple
from src.core.config import settings
from src.core.sports_config import SPORTS_CONFIG
from src.models.encoder import TemporalSkeletonEncoder

class ModelManager:
    def __init__(self):
        self.models = {}
        self.embeddings = {}
        
    def get_model_path(self, sport: str, shot: str) -> Tuple[Path, Path]:
        if sport not in SPORTS_CONFIG:
            raise ValueError(f"Unknown sport: {sport}")
        if shot not in SPORTS_CONFIG[sport]["shots"]:
            raise ValueError(f"Unknown shot: {shot}")
        
        shot_config = SPORTS_CONFIG[sport]["shots"][shot]
        model_path = settings.MODELS_DIR / sport / shot_config["model_file"]
        embeddings_path = settings.MODELS_DIR / sport / shot_config["embeddings_file"]
        
        return model_path, embeddings_path
    
    def load_model(self, sport: str, shot: str):
        cache_key = f"{sport}:{shot}"
        
        if cache_key in self.models:
            return self.models[cache_key], self.embeddings[cache_key]
        
        model_path, embeddings_path = self.get_model_path(sport, shot)
        
        if not model_path.exists() or not embeddings_path.exists():
            raise FileNotFoundError(f"Model files not found for {sport} - {shot}")
        
        model = TemporalSkeletonEncoder()
        model.load_state_dict(torch.load(model_path, map_location=settings.device))
        model.to(settings.device)
        model.eval()
        
        embeddings = torch.load(embeddings_path, map_location=settings.device)
        
        self.models[cache_key] = model
        self.embeddings[cache_key] = embeddings
        
        return model, embeddings