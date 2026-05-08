import os
import sys
import re
import pandas as pd
from pathlib import Path

# Ensure project root is on sys.path so `from app...` works when running script directly
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app.database import SessionLocal
from app.models.activity import Activity

FILE_PATH = Path("data") / "processed_activities.tsv"

def clean_value(value):
    if pd.isna(value) or value == "null":
        return None
    return value


time_re = re.compile(r"(\d{1,2}[:\.]\d{2})")


def parse_hours(raw: object) -> list[dict[str, str]] | None:
    if pd.isna(raw):
        return None
    if isinstance(raw, (list, dict)):
        return raw
    s = str(raw).strip()
    if not s or s.lower() == "null" or s.lower() == "closed":
        return None

    parts = re.split(r"[;/|,]\s*", s)
    ranges = []
    for part in parts:
        part = part.replace('–', '-').replace('—', '-').replace(' to ', '-').strip()
        times = time_re.findall(part)
        if len(times) >= 2:
            open_t = times[0].replace('.', ':')
            close_t = times[1].replace('.', ':')
            ranges.append({"open": open_t, "close": close_t})

    return ranges or None


df = pd.read_csv(FILE_PATH, sep="\t")

db = SessionLocal()

try:
    for _, row in df.iterrows():
        activity = Activity(
            name=row["name"],
            type=clean_value(row.get("activity_type")) or "other",
            phone_number=clean_value(row.get("phone_number")),
            latitude=float(row["latitude"]),
            longitude=float(row["longitude"]),
            rating=float(row["rating"]) if clean_value(row.get("rating")) is not None else None,
            user_rating_count=int(row["user_rating_count"]) if clean_value(row.get("user_rating_count")) is not None else 0,
            monday_working_hours=parse_hours(row.get("monday_hours")),
            tuesday_working_hours=parse_hours(row.get("tuesday_hours")),
            wednesday_working_hours=parse_hours(row.get("wednesday_hours")),
            thursday_working_hours=parse_hours(row.get("thursday_hours")),
            friday_working_hours=parse_hours(row.get("friday_hours")),
            saturday_working_hours=parse_hours(row.get("saturday_hours")),
            sunday_working_hours=parse_hours(row.get("sunday_hours")),
        )

        db.add(activity)

    db.commit()
    print("Activities inserted successfully!")

except Exception as e:
    db.rollback()
    print(f"Error inserting activities: {e}")

finally:
    db.close()