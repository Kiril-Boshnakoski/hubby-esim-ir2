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


time_re = re.compile(r"(\d{1,2}[:\.]\d{2})(?:\s*([AaPp])\.?\s*[Mm]\.?)?")


def normalize_time_to_24h(raw_time: str, meridiem: str | None) -> str:
    """Normalize a parsed time token to HH:MM 24-hour format."""
    hours_str, minutes_str = raw_time.replace('.', ':').split(':', 1)
    hours = int(hours_str)
    minutes = int(minutes_str)

    if meridiem:
        marker = meridiem.upper()
        if marker == "A":
            hours = 0 if hours == 12 else hours
        elif marker == "P":
            hours = 12 if hours == 12 else hours + 12

    return f"{hours:02d}:{minutes:02d}"


def flip_meridiem(meridiem: str | None) -> str | None:
    if not meridiem:
        return None
    return "P" if meridiem.upper() == "A" else "A"


def resolve_pair_meridiem(
    open_time: str,
    open_meridiem: str | None,
    close_time: str,
    close_meridiem: str | None,
) -> tuple[str | None, str | None]:
    """Resolve missing AM/PM markers within one time range."""
    open_marker = open_meridiem.upper() if open_meridiem else None
    close_marker = close_meridiem.upper() if close_meridiem else None

    # If exactly one side has AM/PM, start by propagating that marker.
    if open_marker and not close_marker:
        close_marker = open_marker
    elif close_marker and not open_marker:
        open_marker = close_marker

    # Sanity check: if propagation makes open later than close, flip the inferred side.
    if open_marker and close_marker:
        open_norm = normalize_time_to_24h(open_time, open_marker)
        close_norm = normalize_time_to_24h(close_time, close_marker)
        if open_norm > close_norm:
            if open_meridiem is None and close_meridiem is not None:
                candidate_open = flip_meridiem(open_marker)
                if candidate_open:
                    candidate_open_norm = normalize_time_to_24h(open_time, candidate_open)
                    if candidate_open_norm <= close_norm:
                        open_marker = candidate_open
            elif close_meridiem is None and open_meridiem is not None:
                candidate_close = flip_meridiem(close_marker)
                if candidate_close:
                    candidate_close_norm = normalize_time_to_24h(close_time, candidate_close)
                    if open_norm <= candidate_close_norm:
                        close_marker = candidate_close

    return open_marker, close_marker


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
            open_meridiem, close_meridiem = resolve_pair_meridiem(
                open_time=times[0][0],
                open_meridiem=times[0][1] or None,
                close_time=times[1][0],
                close_meridiem=times[1][1] or None,
            )
            open_t = normalize_time_to_24h(times[0][0], open_meridiem)
            close_t = normalize_time_to_24h(times[1][0], close_meridiem)
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