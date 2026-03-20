from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from src.core.config import settings
from src.api.routes import router
import uvicorn

app = FastAPI(
    title="LiveCoach.AI - AI Service",
    description="Multi-sport technique analysis API",
    version="1.0.0"
)

# CORS - Use the property from settings
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.allowed_origins,  # Changed this line
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(router)

@app.on_event("startup")
async def startup():
    print("="*60)
    print("LiveCoach.AI - AI Service Starting...")
    print(f"Device: {settings.device}")
    print(f"CORS Origins: {settings.allowed_origins}")
    print("="*60)

if __name__ == "__main__":
    uvicorn.run(
        "main:app",
        host=settings.AI_SERVICE_HOST,
        port=settings.AI_SERVICE_PORT,
        reload=False
    )