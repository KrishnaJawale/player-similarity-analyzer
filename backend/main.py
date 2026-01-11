from fastapi import FastAPI, Query
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Dict, Optional

from player_similarity import get_similar_players 

app = FastAPI()

# Allow CORS for frontend access
app.add_middleware(
    CORSMiddleware,
    allow_origins=["https://player-similarity-analyzer.vercel.app"],  # frontend
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class Item(BaseModel):
    selectedMetrics: List[str]
    metricWeights: Dict[str, float]
    minAge: int
    maxAge: int
    PCA: bool


@app.post("/similar_players")
def similar_players (player: str = Query(...), body: Item = ...):
    metrics = body.selectedMetrics
    weights = body.metricWeights
    minAge = body.minAge
    maxAge = body.maxAge
    PCA = body.PCA
    return get_similar_players(player, metrics, weights, minAge, maxAge, PCA)