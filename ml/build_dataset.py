import time
from typing import Dict, List
from pathlib import Path
import numpy as np
import pandas as pd

from nba_api.stats.static import players
from nba_api.stats.endpoints import commonplayerinfo, playercareerstats

# ------------ PATHS (locked to repo root) ------------
ROOT = Path(__file__).resolve().parents[1]
OUT_PATH = ROOT / "data" / "rookie_to_y6.parquet"
# ------------------------------------------------------

# ------------ CONFIG ------------
START_SEASON = 1996        # rookies from >= this season
MAX_PLAYERS = 300          # start small; set to None for full run
SLEEP = 0.8                # be nice to the API
# --------------------------------

def feet_in_to_inches(h: str) -> float:
    try:
        f, i = h.split("-")
        return int(f) * 12 + int(i)
    except Exception:
        return np.nan

def build_player_row(pid: int) -> Dict:
    # Height & bio
    try:
        info = commonplayerinfo.CommonPlayerInfo(player_id=pid).get_dict()
        hrow = info["resultSets"][0]["rowSet"][0]
        height_str = hrow[11]  # HEIGHT like "6-7"
        height_in = feet_in_to_inches(height_str)
    except Exception:
        return {}

    # Per-game career by season
    try:
        care = playercareerstats.PlayerCareerStats(player_id=pid, per_mode36="PerGame").get_data_frames()[0]
    except Exception:
        return {}

    if care.empty:
        return {}

    care = care.copy()
    care["season_start"] = care["SEASON_ID"].astype(str).str[:4].astype(int)
    care = care.sort_values("season_start")

    rookie = care.iloc[0]
    rookie_start = int(rookie["season_start"])
    if rookie_start < START_SEASON:
        return {}

    # need years 2..6 present
    want_years = [rookie_start + k for k in range(1, 6)]
    by_year = {int(r["season_start"]): r for _, r in care.iterrows()}
    if any(y not in by_year for y in want_years):
        return {}

    def f(v):
        try:
            return float(v)
        except Exception:
            return np.nan

    feats = {
        "player_id": pid,
        "height_in": f(height_in),
        "rookie_ppg": f(rookie["PTS"]),
        "rookie_apg": f(rookie["AST"]),
        "rookie_rpg": f(rookie["REB"]),
        "rookie_start": rookie_start,
    }

    t = {}
    for k in range(1, 6):
        rowk = by_year[rookie_start + k]
        t[f"ppg_y{k+1}"] = f(rowk["PTS"])
        t[f"apg_y{k+1}"] = f(rowk["AST"])
        t[f"rpg_y{k+1}"] = f(rowk["REB"])

    row = {**feats, **t}

    # sanity: no NaNs
    for c in ["height_in","rookie_ppg","rookie_apg","rookie_rpg"]:
        if pd.isna(row[c]):
            return {}
    for k in range(2, 7):
        for stat in ["ppg","apg","rpg"]:
            if pd.isna(row[f"{stat}_y{k}"]):
                return {}

    return row

def main():
    print("== build_dataset.py starting ==")
    OUT_PATH.parent.mkdir(parents=True, exist_ok=True)
    print(f"Writing dataset to: {OUT_PATH.resolve()}")

    plist = players.get_players()
    total = len(plist) if not MAX_PLAYERS else MAX_PLAYERS
    print(f"Total players from nba_api: {len(plist)}; processing up to {total}")

    rows: List[Dict] = []
    checked = kept = 0

    for p in plist:
        if MAX_PLAYERS and checked >= MAX_PLAYERS:
            break
        pid = p.get("id")
        if not pid:
            continue

        row = build_player_row(pid)
        if row:
            rows.append(row)
            kept += 1

        checked += 1
        if checked % 25 == 0:
            print(f"…checked {checked}, collected {kept}")
        time.sleep(SLEEP)

    df = pd.DataFrame(rows)
    if df.empty:
        print("WARNING: collected 0 usable rows.")
    else:
        df = df.drop_duplicates(subset=["player_id"], keep="last")
        df.to_parquet(OUT_PATH, index=False)
        print(f"Saved {len(df)} rows to {OUT_PATH.resolve()}")
        print(df.head())

    print("== build_dataset.py done ==")

if __name__ == "__main__":
    main()
