from datetime import datetime, timezone
import math

from sqlalchemy.orm import Session

from app.models.activity import Activity
from app.utils.geo_utils import haversine, validate_coordinates
from app.services.infer_context import infer_context, get_category_relevance


DEFAULT_RECOMMENDATION_RADIUS_KM = 50.0

def rating_score(rating):
    if not rating:
        return 0.0
    return float(rating) / 5.0

### Eligible for removal
# def get_category_relevance(activity_type, context):
#     if not context or not activity_type:
#         return 0.0
    
#     activity_type_lower = activity_type.lower()
#     context_lowercase = [item.lower() for item in context]
    
#     return 1.0 if activity_type_lower in context_lowercase else 0.0

def calculate_score(act, dist_km, radius_km, context):
    d_score = distance_score(dist_km, radius_km)
    p_score = popularity_score(act.get('user_rating_count', 0))
    
    r_score = rating_score(act.get('rating', 0.0))
    c_score = get_category_relevance(act.get('activity_type'), context)
    
    score = (d_score * 0.35) + (r_score * 0.30) + (p_score * 0.20) + (c_score * 0.15)
    return round(score, 4)

def distance_score(distance_km, radius_km):
    if radius_km <= 0:
        return 0.0
    
    score = 1.0 - (distance_km / radius_km)
    # Спречува негативен скор доколку локацијата е надвор од радиусот
    return max(0.0, score) 

def popularity_score(user_rating_count):
    if user_rating_count <= 0:
        return 0.0
    
    score = math.log10(user_rating_count + 1) / 4.0
    return min(score, 1.0)

### Eligible for removal
# def infer_context(timestamp: datetime) -> str:
#     if 6 <= timestamp.hour <= 11:
#         return "breakfast"
#     elif 12 <= timestamp.hour <= 16:
#         return "lunch"
#     elif 17 <= timestamp.hour <= 21:
#         return "dinner"
#     else:
#         return "nightlife"


def parse_hours_entry(entry: dict | str) -> tuple[datetime.time, datetime.time] | None:
    if isinstance(entry, str):
        if "-" not in entry:
            return None
        open_str, close_str = entry.split("-", 1)
    elif isinstance(entry, dict):
        open_str = entry.get("open")
        close_str = entry.get("close")
        if not open_str or not close_str:
            return None
    else:
        return None

    try:
        open_t = datetime.strptime(open_str.strip(), "%H:%M").time()
        close_t = datetime.strptime(close_str.strip(), "%H:%M").time()
    except (ValueError, TypeError):
        return None

    return open_t, close_t


def is_open(activity: Activity, timestamp: datetime) -> bool:
    day = timestamp.strftime("%A").lower()
    working_hours = getattr(activity, f"{day}_working_hours", None)

    if not working_hours:
        return False

    current_time = timestamp.time()

    for hours_entry in working_hours:
        parsed = parse_hours_entry(hours_entry)
        if not parsed:
            continue

        open_time, close_time = parsed

        if open_time <= close_time:
            if open_time <= current_time < close_time:
                return True
        else:
            if current_time >= open_time or current_time < close_time:
                return True

    return False


def filter_by_radius(db: Session, latitude: float, longitude: float, radius_km: float = DEFAULT_RECOMMENDATION_RADIUS_KM) -> list[dict]:
    latitude, longitude = validate_coordinates(latitude, longitude)
    activities = []

    for activity in db.query(Activity).all():
        if activity.latitude is None or activity.longitude is None:
            continue

        distance_km = haversine(latitude, longitude, activity.latitude, activity.longitude)
        if distance_km <= radius_km:
            activities.append({
                "activity": activity,
                "distance_km": round(distance_km, 4),
            })

    return activities


def build_ranked_recommendations(db: Session, latitude: float, longitude: float) -> dict:
    latitude, longitude = validate_coordinates(latitude, longitude)
    response_timestamp = datetime.now(timezone.utc)
    context = infer_context(response_timestamp)

    candidate_activities = filter_by_radius(db, latitude, longitude)
    ranked_activities = []

    for item in candidate_activities:
        activity = item["activity"]
        distance_km = item["distance_km"]
        open_state = is_open(activity, response_timestamp)

        if not open_state:
            continue

        score = calculate_score(
            {
                "activity_type": activity.type,
                "rating": activity.rating,
                "user_rating_count": activity.user_rating_count,
            },
            dist_km=distance_km,
            radius_km=DEFAULT_RECOMMENDATION_RADIUS_KM,
            context=[context],
        )

        ranked_activities.append(
            {
                "activity": activity,
                "distance_km": distance_km,
                "score": score,
                "context": context,
                "category_relevance": get_category_relevance(activity.type, [context]),
                "is_open": open_state,
            }
        )

    ranked_activities.sort(
        key=lambda item: (
            -item["score"],
            item["distance_km"],
            item["activity"].name.lower(),
            item["activity"].id,
        )
    )

    recommendations = [
        {
            "rank": index + 1,
            "name": item["activity"].name,
            "type": item["activity"].type,
            "distance_km": item["distance_km"],
            "recommendation_score": item["score"],
            "context": item["context"],
            "category_relevance": item["category_relevance"],
            "is_open": item["is_open"],
        }
        for index, item in enumerate(ranked_activities)
    ]

    return {
        "response_timestamp": response_timestamp.isoformat(),
        "recommendations": recommendations,
    }


if __name__ == "__main__":
    print("=== Стартува локален тест за функциите на Петар и Максим ===")
    
    # 1. Тест за rating_score
    print("\n1. Тестирање на rating_score:")
    print(f"За рејтинг 4.5 требa да биде 0.9 -> Добиено: {rating_score(4.5)}")
    print(f"За рејтинг None треба да биде 0.0 -> Добиено: {rating_score(None)}")
    
    # 2. Тест за get_category_relevance
    print("\n2. Тестирање на get_category_relevance:")
    тест_контекст = ["lunch", "food", "restaurant"]
    print(f"Ако е во контекст ('Lunch') треба 1.0 -> Добиено: {get_category_relevance('Lunch', тест_контекст)}")
    print(f"Ако НЕ Е во контекст ('Museum') треба 0.0 -> Добиено: {get_category_relevance('Museum', тест_контекст)}")
    
    # 3. Нови тестови за Максим: distance_score
    print("\n3. Тестирање на distance_score (Максим):")
    print(f"Дистанца 0.1км на радиус 1.0км (Очекувано: ~0.9) -> Добиено: {round(distance_score(0.1, 1.0), 2)}")
    print(f"Дистанца 0.5км на радиус 1.0км (Очекувано: 0.5) -> Добиено: {round(distance_score(0.5, 1.0), 2)}")
    print(f"Дистанца 1.0км на радиус 1.0км (Очекувано: 0.0) -> Добиено: {round(distance_score(1.0, 1.0), 2)}")
    
    # 4. Нови тестови за Максим: popularity_score
    print("\n4. Тестирање на popularity_score (Максим):")
    print(f"Рејтинг каунт 0 (Очекувано: 0.0) -> Добиено: {round(popularity_score(0), 2)}")
    print(f"Рејтинг каунт 10 (Очекувано: ~0.26) -> Добиено: {round(popularity_score(10), 2)}")
    print(f"Рејтинг каунт 100 (Очекувано: ~0.50) -> Добиено: {round(popularity_score(100), 2)}")
    print(f"Рејтинг каунт 10000 (Очекувано: 1.0) -> Добиено: {round(popularity_score(10000), 2)}")

    # 5. Тест за calculate_score (Со вистинските пресметки сега)
    print("\n5. Тестирање на крајниот calculate_score:")
    активност = {
        "activity_type": "lunch",
        "rating": 5.0,
        "user_rating_count": 100
    }
    # Математика зад пресметката: 
    # d_score = 1 - (0.5/1.0) = 0.5
    # r_score = 5.0 / 5.0 = 1.0
    # p_score = log10(101)/4 = 2.0043 / 4 = 0.5011
    # c_score = 1.0
    # Вкупно: (0.5 * 0.35) + (1.0 * 0.30) + (0.5011 * 0.20) + (1.0 * 0.15)
    #          0.175       +  0.30       +  0.10022     +  0.15  = 0.7252
    резултат = calculate_score(активност, dist_km=0.5, radius_km=1.0, context=тест_контекст)
    print(f"Очекуван вкупен скор: ~0.7252 -> Добиен скор: {резултат}")