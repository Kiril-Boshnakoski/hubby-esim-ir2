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
    category_relevance: float
    is_open: bool


class RecommendationsResponse(BaseModel):
    response_timestamp: str
    recommendations: list[RankedRecommendation]


@router.get("/{user_id}", response_model=RecommendationsResponse, status_code=status.HTTP_200_OK)
def get_recommendations_for_user(
    user_id: int,
    radius: float | None = Query(default=None, gt=0, description="Optional search radius in kilometers"),
    context: str | None = Query(default=None, description="Optional context override for ranking"),
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
        return build_ranked_recommendations(db, latitude, longitude, radius_km=radius, context=context)
    except ValueError as exc:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(exc),
        ) from exc


@router.get("/", response_model=RecommendationsResponse, status_code=status.HTTP_200_OK)
def get_recommendations_by_coordinates(
    lat: float = Query(..., description="Latitude used for ranking recommendations"),
    lon: float = Query(..., description="Longitude used for ranking recommendations"),
    radius: float | None = Query(default=None, gt=0, description="Optional search radius in kilometers"),
    context: str | None = Query(default=None, description="Optional context override for ranking"),
    db: Session = Depends(get_db),
) -> RecommendationsResponse:
    try:
        latitude, longitude = validate_coordinates(lat, lon)
        return build_ranked_recommendations(db, latitude, longitude, radius_km=radius, context=context)
    except ValueError as exc:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(exc),
        ) from exc