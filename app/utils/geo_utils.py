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