from fastapi import APIRouter, Depends, HTTPException, Query, status
from pydantic import BaseModel
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.user import User
from app.services.recommendation import build_ranked_recommendations
from app.utils.geo_utils import validate_coordinates

router = APIRouter(
    prefix="/recommendations",
    tags=["Recommendations"],
)

class RankedRecommendation(BaseModel):
    rank: int
    name: str
    type: str | None = None
    distance_km: float
    recommendation_score: float
    context: str
    category_relevance: float | None = None
    is_open: bool
    latitude: float
    longitude: float
    id: int
    phone_number: str | None = None
    rating: float | None = None
    user_rating_count: int = 0

class RecommendationsResponse(BaseModel):
    response_timestamp: str
    recommendations: list[RankedRecommendation]


# 1. ENDPOINT ZA PREPORAKI PO USER_ID (Dodadeni limit i offset)
@router.get("/{user_id}", response_model=RecommendationsResponse, status_code=status.HTTP_200_OK)
def get_recommendations_for_user(
    user_id: int,
    radius: float | None = Query(default=None, gt=0, description="Optional search radius in kilometers"),
    context: str | None = Query(default=None, description="Optional context override for ranking"),
    category: str | None = Query(default=None, description="Optional category filter e.g. restaurant,cafe"),
    open_now: bool | None = Query(default=None, description="If true, only return currently open places"),
    limit: int = Query(default=10, ge=1, description="Колку препораки да врати"),
    offset: int = Query(default=0, ge=0, description="Колку препораки да прескокне"),
    db: Session = Depends(get_db),
) -> RecommendationsResponse:
    user = db.execute(select(User).where(User.id == user_id)).scalar_one_or_none()
    if user is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"User with id {user_id} was not found.",
        )

    if user.latitude is None or user.longitude is None:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"User with id {user_id} does not have coordinates set.",
        )

    try:
        latitude, longitude = validate_coordinates(user.latitude, user.longitude)
        # TODO: Allow client-supplied lat/lon to override stored user coordinates.
        full_response = build_ranked_recommendations(
            db,
            latitude,
            longitude,
            radius_km=radius,
            context=context,
            category=category,
            open_now=open_now,
        )
        
        # Ekstrakcija na listata (ista logika kako vtoriot endpoint)
        if hasattr(full_response, "recommendations"):
            all_recs = full_response.recommendations
            timestamp = getattr(full_response, "response_timestamp", "now")
        elif isinstance(full_response, dict):
            all_recs = full_response.get("recommendations", [])
            timestamp = full_response.get("response_timestamp", "now")
        else:
            all_recs = full_response if isinstance(full_response, list) else []
            timestamp = "now"

        # Paginacija i prevencija na infinite loop na frontend
        total_recs = len(all_recs)
        if offset >= total_recs:
            return RecommendationsResponse(
                response_timestamp=str(timestamp),
                recommendations=[]
            )

        paginated_list = all_recs[offset : offset + limit]
        
        return RecommendationsResponse(
            response_timestamp=str(timestamp),
            recommendations=paginated_list
        )

    except ValueError as exc:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(exc),
        ) from exc
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Database mapping error: {str(e)}",
        )


# 2. ENDPOINT ZA PREPORAKI PO KOORDINATI (Ostanuva ist)
@router.get("/", response_model=RecommendationsResponse, status_code=status.HTTP_200_OK)
def get_recommendations_by_coordinates(
    lat: float = Query(..., description="Latitude used for ranking recommendations"),
    lon: float = Query(..., description="Longitude used for ranking recommendations"),
    radius: float | None = Query(default=None, gt=0, description="Optional search radius in kilometers"),
    context: str | None = Query(default=None, description="Optional context override for ranking"),
    category: str | None = Query(default=None, description="Optional category filter e.g. restaurant,cafe"),
    open_now: bool | None = Query(default=None, description="If true, only return currently open places"),
    limit: int = Query(default=10, ge=1, description="Колку препораки да врати"),
    offset: int = Query(default=0, ge=0, description="Колку preporaki da preskokne"),
    db: Session = Depends(get_db),
) -> RecommendationsResponse:
    try:
        latitude, longitude = validate_coordinates(lat, lon)
        full_response = build_ranked_recommendations(
            db,
            latitude,
            longitude,
            radius_km=radius,
            context=context,
            category=category,
            open_now=open_now,
        )
        
        if hasattr(full_response, "recommendations"):
            all_recs = full_response.recommendations
            timestamp = getattr(full_response, "response_timestamp", "now")
        elif isinstance(full_response, dict):
            all_recs = full_response.get("recommendations", [])
            timestamp = full_response.get("response_timestamp", "now")
        else:
            all_recs = full_response if isinstance(full_response, list) else []
            timestamp = "now"

        total_recs = len(all_recs)
        if offset >= total_recs:
            return RecommendationsResponse(
                response_timestamp=str(timestamp),
                recommendations=[]
            )

        paginated_list = all_recs[offset : offset + limit]
        
        return RecommendationsResponse(
            response_timestamp=str(timestamp),
            recommendations=paginated_list
        )

    except ValueError as exc:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(exc),
        ) from exc
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Database mapping error: {str(e)}",
        )