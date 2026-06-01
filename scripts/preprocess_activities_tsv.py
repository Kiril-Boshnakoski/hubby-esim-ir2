"""
Preprocess unique_activities.tsv + uniques_activities_2.tsv → processed_activities.tsv

Removes unnecessary fields (Google ID, languageCode, priceLevel) and renames
the remaining columns to match the Activity model expected by the backend.

Usage:
    python scripts/preprocess_activities_tsv.py
"""

import os
import sys

import pandas as pd

# ── Paths ────────────────────────────────────────────────────────────────────
PROJECT_ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
INPUT_PATHS = [
    os.path.join(PROJECT_ROOT, "data", "unique_activities.tsv"),
    os.path.join(PROJECT_ROOT, "data", "uniques_activities_2.tsv"),
]
OUTPUT_PATH = os.path.join(PROJECT_ROOT, "data", "processed_activities.tsv")

# ── Columns to drop ─────────────────────────────────────────────────────────
COLUMNS_TO_DROP = [
    "places/id",                        # Google ID – not needed
    "places/displayName/languageCode",  # languageCode – not needed
    "places/priceLevel",                # priceLevel – not needed
]

# ── Rename map: raw TSV column → backend-friendly column name ────────────────
RENAME_MAP = {
    "places/internationalPhoneNumber": "phone_number",
    "places/location/latitude": "latitude",
    "places/location/longitude": "longitude",
    "places/rating": "rating",
    "places/regularOpeningHours/weekdayDescriptions/0": "monday_hours",
    "places/regularOpeningHours/weekdayDescriptions/1": "tuesday_hours",
    "places/regularOpeningHours/weekdayDescriptions/2": "wednesday_hours",
    "places/regularOpeningHours/weekdayDescriptions/3": "thursday_hours",
    "places/regularOpeningHours/weekdayDescriptions/4": "friday_hours",
    "places/regularOpeningHours/weekdayDescriptions/5": "saturday_hours",
    "places/regularOpeningHours/weekdayDescriptions/6": "sunday_hours",
    "places/userRatingCount": "user_rating_count",
    "places/displayName/text": "name",
    "places/primaryType": "activity_type",
}


def preprocess(input_paths: list[str], output_path: str) -> None:
    """Read the raw TSV files, clean them, and write the processed TSV."""

    frames = []
    for input_path in input_paths:
        if not os.path.exists(input_path):
            print(f"Error: input file not found → {input_path}")
            sys.exit(1)

        frame = pd.read_csv(input_path, sep="\t")
        print(f"Loaded {len(frame)} rows from {input_path}")
        frames.append(frame)

    df = pd.concat(frames, ignore_index=True)
    print(f"Combined {len(df)} total rows from {len(frames)} files")

    # 1. Drop unnecessary columns
    existing_cols_to_drop = [c for c in COLUMNS_TO_DROP if c in df.columns]
    df = df.drop(columns=existing_cols_to_drop)
    print(f"Dropped columns: {existing_cols_to_drop}")

    # 2. Rename columns to match backend schema
    df = df.rename(columns=RENAME_MAP)

    # 3. Fill missing activity types with "other"
    df["activity_type"] = df["activity_type"].fillna("other")

    # 4. Ensure user_rating_count is an integer (fill NaN with 0)
    df["user_rating_count"] = df["user_rating_count"].fillna(0).astype(int)

    # 5. Fill missing phone numbers, ratings, and working hours with "null"
    df["phone_number"] = df["phone_number"].fillna("null")
    df["rating"] = df["rating"].fillna("null")

    hours_columns = [
        "monday_hours", "tuesday_hours", "wednesday_hours",
        "thursday_hours", "friday_hours", "saturday_hours", "sunday_hours",
    ]
    for col in hours_columns:
        df[col] = df[col].fillna("null")

    # 5. Write processed output
    df.to_csv(output_path, sep="\t", index=False)
    print(f"Wrote {len(df)} rows to {output_path}")
    print(f"\nFinal columns: {list(df.columns)}")


if __name__ == "__main__":
    preprocess(INPUT_PATHS, OUTPUT_PATH)
