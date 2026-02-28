from pydantic_settings import BaseSettings
from pathlib import Path
import torch
from typing import List

class Settings(BaseSettings):
    # Service
    AI_SERVICE_PORT: int = 8000
    AI_SERVICE_HOST: str = "0.0.0.0"
    
    # Paths
    MODELS_DIR: Path = Path("models")
    TEMP_DIR: Path = Path("temp")
    LOGS_DIR: Path = Path("logs")
    YOLO_MODEL: str = "yolov8m-pose.pt"
    
    # Model
    DEVICE: str = "auto"
    SEQUENCE_LENGTH: int = 30
    NUM_JOINTS: int = 17
    JOINT_DIM: int = 2
    HIDDEN_DIM: int = 256
    EMBEDDING_DIM: int = 128
    
    # Security
    API_KEY: str
    
    # Performance
    MAX_WORKERS: int = 4
    TIMEOUT: int = 60
    
    class Config:
        env_file = ".env"
        
    @property
    def allowed_origins(self) -> List[str]:
        """Return allowed CORS origins"""
        return [
            "http://localhost:3000",
            "http://localhost:8081",
            "http://127.0.0.1:3000",
            "http://127.0.0.1:8081",
        ]
    
    @property
    def device(self):
        if self.DEVICE == "auto":
            return torch.device('cuda' if torch.cuda.is_available() else 'cpu')
        return torch.device(self.DEVICE)

settings = Settings()