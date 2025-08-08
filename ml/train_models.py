from pathlib import Path
import joblib
import pandas as pd
from xgboost import XGBRegressor
from sklearn.model_selection import train_test_split
from sklearn.metrics import mean_absolute_error

# ------------ PATHS (locked to repo root) ------------
ROOT = Path(__file__).resolve().parents[1]
DATA_PATH = ROOT / "data" / "rookie_to_y6.parquet"
MODELS_DIR = ROOT / "backend" / "models"
# ------------------------------------------------------

FEATURES = ["height_in", "rookie_ppg", "rookie_apg", "rookie_rpg"]
TARGETS = {
    "ppg": [f"ppg_y{k}" for k in range(2, 7)],
    "apg": [f"apg_y{k}" for k in range(2, 7)],
    "rpg": [f"rpg_y{k}" for k in range(2, 7)],
}

def main():
    print("== train_models.py starting ==")
    print(f"Reading dataset from: {DATA_PATH.resolve()}")
    if not DATA_PATH.exists():
        print(f"ERROR: {DATA_PATH.resolve()} not found. Run build_dataset.py first.")
        return

    df = pd.read_parquet(DATA_PATH)
    print(f"Loaded dataset with {len(df)} rows")

    needed = FEATURES + sum(TARGETS.values(), [])
    df = df.dropna(subset=needed)
    print(f"After dropping NaNs: {len(df)} rows")

    MODELS_DIR.mkdir(parents=True, exist_ok=True)
    print(f"Saving models to: {MODELS_DIR.resolve()}")

    for stat, cols in TARGETS.items():
        for col in cols:
            print(f"Training {col} …")
            X = df[FEATURES].astype(float)
            y = df[col].astype(float)

            X_train, X_test, y_train, y_test = train_test_split(
                X, y, test_size=0.2, random_state=42
            )

            model = XGBRegressor(
                n_estimators=400,
                max_depth=4,
                learning_rate=0.05,
                subsample=0.9,
                colsample_bytree=0.9,
                reg_lambda=2.0,
                random_state=42,
                n_jobs=-1,
            )
            model.fit(X_train, y_train)
            mae = mean_absolute_error(y_test, model.predict(X_test))
            out = MODELS_DIR / f"xgb_{stat}_{col}.pkl"
            joblib.dump(model, out)
            print(f"  saved {out.name} (MAE={mae:.3f})")

    print("== train_models.py done ==")

if __name__ == "__main__":
    main()
