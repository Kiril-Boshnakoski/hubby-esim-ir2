from math import atan2, cos, isfinite, radians, sin, sqrt


EARTH_RADIUS_KM = 6371.0


def haversine(lat1: float, lon1: float, lat2: float, lon2: float) -> float:
    """Return the great-circle distance between two points in kilometers."""

    lat1_rad = radians(lat1)
    lon1_rad = radians(lon1)
    lat2_rad = radians(lat2)
    lon2_rad = radians(lon2)

    dlat = lat2_rad - lat1_rad
    dlon = lon2_rad - lon1_rad

    a = sin(dlat / 2) ** 2 + cos(lat1_rad) * cos(lat2_rad) * sin(dlon / 2) ** 2
    c = 2 * atan2(sqrt(a), sqrt(1 - a))
    return EARTH_RADIUS_KM * c


def validate_coordinates(latitude: float, longitude: float) -> tuple[float, float]:
    """Validate latitude and longitude values and return normalized floats."""

    if latitude is None or longitude is None:
        raise ValueError("Latitude and longitude must be provided.")

    if not isfinite(latitude) or not isfinite(longitude):
        raise ValueError("Latitude and longitude must be finite numbers.")

    if latitude < -90.0 or latitude > 90.0:
        raise ValueError("Latitude must be between -90 and 90 degrees.")

    if longitude < -180.0 or longitude > 180.0:
        raise ValueError("Longitude must be between -180 and 180 degrees.")

    return float(latitude), float(longitude)


def filter_by_radius(user_lat: float, user_lon: float, activities, radius_km: float = 1.0) -> list[dict]:
    """Filter an iterable of activity-like objects by distance to (user_lat, user_lon).

    - `activities` may be SQLAlchemy model instances or dict-like objects with
      `latitude` and `longitude` attributes/keys.
    - Returns a list of dicts: {"activity": <orig>, "distance_km": <float>} for
      activities whose distance is <= `radius_km`.
    """
    latitude, longitude = validate_coordinates(user_lat, user_lon)

    results = []
    for item in activities:
        # support both attribute access and dict-style
        try:
            act_lat = getattr(item, "latitude")
            act_lon = getattr(item, "longitude")
        except Exception:
            act_lat = item.get("latitude") if isinstance(item, dict) else None
            act_lon = item.get("longitude") if isinstance(item, dict) else None

        if act_lat is None or act_lon is None:
            continue

        try:
            dist = haversine(latitude, longitude, float(act_lat), float(act_lon))
        except Exception:
            continue

        if dist <= radius_km:
            results.append({"activity": item, "distance_km": round(dist, 4)})

    return results