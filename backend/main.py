from pathlib import Path
import joblib
import numpy as np
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

ROOT = Path(__file__).resolve().parents[1]
MODELS_DIR = ROOT / "backend" / "models"

app = FastAPI(title="NBA Career Trajectory API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://127.0.0.1:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Load models
models = {}
if MODELS_DIR.exists():
    for p in MODELS_DIR.glob("xgb_*.pkl"):
        key = p.stem.split("xgb_")[-1]  # e.g., ppg_ppg_y2
        target = key.split("_", 1)[-1]  # e.g., ppg_y2
        try:
            models[target] = joblib.load(p)
        except Exception as e:
            print(f"Failed to load {p.name}: {e}")

class PlayerInput(BaseModel):
    height_in: float
    rookie_ppg: float
    rookie_apg: float
    rookie_rpg: float

@app.get("/health")
def health():
    return {
        "status": "ok",
        "models_dir": str(MODELS_DIR.resolve()),
        "loaded_models": len(models),
        "model_keys": sorted(models.keys()),
    }

@app.post("/predict")
def predict(inp: PlayerInput):
    if not models:
        return {"error": "No models loaded. Put trained .pkl files in backend/models."}

    X = np.array([[inp.height_in, inp.rookie_ppg, inp.rookie_apg, inp.rookie_rpg]], dtype=float)

    def pred(tgt):
        m = models.get(tgt)
        return float(m.predict(X)[0]) if m is not None else 0.0

    out = []
    for yr in range(2, 7):
        out.append({
            "year": yr,
            "PPG": round(pred(f"ppg_y{yr}"), 1),
            "APG": round(pred(f"apg_y{yr}"), 1),
            "RPG": round(pred(f"rpg_y{yr}"), 1),
        })

    summary = (
        f"Starting from {inp.rookie_ppg:.1f} PPG, projected PPG trends to ~{out[-1]['PPG']:.1f} by Year 6. "
        f"APG and RPG follow similar patterns given rookie profile and height."
    )
    return {"yearly": out, "summary": summary}
