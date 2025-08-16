from fastapi import FastAPI, Query
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional

from player_similarity import get_similar_players 

app = FastAPI()

# Allow CORS for frontend access
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],  # React frontend
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class MetricsRequest(BaseModel):
    selectedMetrics: List[str]
    minAge: int
    maxAge: int
    PCA: bool


@app.post("/similar_players")
def similar_players (player: str = Query(...), body: MetricsRequest = ...):
    metrics = body.selectedMetrics
    minAge = body.minAge
    maxAge = body.maxAge
    PCA = body.PCA
    return get_similar_players(player, metrics, minAge, maxAge, PCA)