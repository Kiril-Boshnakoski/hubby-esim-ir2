from typing import Optional, List
from datetime import datetime, timezone
from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from sqlalchemy import select, and_, or_, func
from pydantic import BaseModel

from app.database import get_db
from app.models.activity import Activity

router = APIRouter(
    prefix="/activities",
    tags=["Activities"]
)



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
            # Overnight shift, e.g. 22:00-02:00
            if current_time >= open_time or current_time < close_time:
                return True

    return False


def build_category_filter(category: str):
    normalized_category = " ".join(category.lower().split())
    search_terms = {
        normalized_category,
        normalized_category.replace(" ", "_"),
        normalized_category.replace("_", " "),
        normalized_category.replace(" ", "-"),
    }

    return or_(
        *[
            func.lower(Activity.type).like(f"%{term}%")
            for term in search_terms
            if term
        ]
    )


class ActivityResponse(BaseModel):
    """Response model for Activity."""
    id: int
    name: str
    type: Optional[str] = None
    phone_number: Optional[str] = None
    latitude: float
    longitude: float
    rating: Optional[float] = None
    user_rating_count: int
    
    class Config:
        from_attributes = True


class ActivitiesResponse(BaseModel):
    response_timestamp: str
    activities: List[ActivityResponse]


class ActivityCreate(BaseModel):
    name: str
    type: str | None = None
    phone_number: str | None = None
    latitude: float
    longitude: float
    rating: float | None = None
    user_rating_count: int = 0
    monday_working_hours: list[dict[str, str]] | None = None
    tuesday_working_hours: list[dict[str, str]] | None = None
    wednesday_working_hours: list[dict[str, str]] | None = None
    thursday_working_hours: list[dict[str, str]] | None = None
    friday_working_hours: list[dict[str, str]] | None = None
    saturday_working_hours: list[dict[str, str]] | None = None
    sunday_working_hours: list[dict[str, str]] | None = None


class ActivityUpdate(BaseModel):
    name: str | None = None
    type: str | None = None
    phone_number: str | None = None
    latitude: float | None = None
    longitude: float | None = None
    rating: float | None = None
    user_rating_count: int | None = None
    monday_working_hours: list[dict[str, str]] | None = None
    tuesday_working_hours: list[dict[str, str]] | None = None
    wednesday_working_hours: list[dict[str, str]] | None = None
    thursday_working_hours: list[dict[str, str]] | None = None
    friday_working_hours: list[dict[str, str]] | None = None
    saturday_working_hours: list[dict[str, str]] | None = None
    sunday_working_hours: list[dict[str, str]] | None = None


@router.get("/", response_model=ActivitiesResponse, status_code=status.HTTP_200_OK)
def get_activities(
    limit: int = Query(20, ge=1, le=100, description="Number of activities to return (1-100)"),
    category: Optional[str] = Query(None, description="Filter by activity category fragment (e.g., 'restaurant' matches 'italian_restaurant')"),
    min_rating: Optional[float] = Query(None, ge=0.0, le=5.0, description="Minimum rating (0-5)"),
    min_rating_count: Optional[int] = Query(None, ge=0, description="Minimum number of ratings"),
    open_now: Optional[bool] = Query(None, description="Filter by currently open activities"),
    db: Session = Depends(get_db)
) -> ActivitiesResponse:
    """
    Retrieve activities with optional filtering.
    
    Query Parameters:
    - **limit**: Maximum number of activities to return (default: 20, range: 1-100)
    - **category**: Filter by activity category fragment (e.g., 'restaurant' matches 'italian_restaurant')
    - **min_rating**: Minimum rating threshold (0-5)
    - **min_rating_count**: Minimum number of user ratings required
    - **open_now**: Filter by currently open activities (true/false)
    
    Returns:
        Timestamped response object containing the matching activities.
        
    Examples:
        GET /activities
        GET /activities?limit=10
        GET /activities?category=restaurant
        GET /activities?min_rating=4.5
        GET /activities?min_rating_count=100
        GET /activities?open_now=true
        GET /activities?category=restaurant&min_rating=4.5&open_now=true
    """
    
    response_timestamp = datetime.now(timezone.utc)

    # Start with base query
    query = select(Activity)
    filters = []
    
    # Apply category filter if provided
    if category is not None and category.strip():
        filters.append(build_category_filter(category.strip()))
    
    # Apply minimum rating filter if provided
    if min_rating is not None:
        filters.append(Activity.rating >= min_rating)
    
    # Apply minimum rating count filter if provided
    if min_rating_count is not None:
        filters.append(Activity.user_rating_count >= min_rating_count)
    
    # Combine all filters with AND logic
    if filters:
        query = query.where(and_(*filters))
    
    # Apply limit
    query = query.limit(limit)
    
    # Execute query
    activities = db.execute(query).scalars().all()
    
    # Filter by open_now if requested (in-memory filtering based on actual working hours)
    if open_now is not None:
        filtered_activities = [
            activity for activity in activities
            if is_open(activity, response_timestamp) == open_now
        ]
    else:
        filtered_activities = activities

    return ActivitiesResponse(
        response_timestamp=response_timestamp.isoformat(),
        activities=filtered_activities,
    )



@router.post("/", status_code=status.HTTP_201_CREATED)
def create_activity(activity: ActivityCreate, db: Session = Depends(get_db)):
    db_activity = Activity(**activity.model_dump())
    db.add(db_activity)
    db.commit()
    db.refresh(db_activity)
    return db_activity


@router.put("/{activity_id}")
def update_activity(activity_id: int, activity: ActivityUpdate, db: Session = Depends(get_db)):
    db_activity = db.query(Activity).filter(Activity.id == activity_id).first()
    if db_activity is None:
        raise HTTPException(status_code=404, detail="Activity not found")

    update_data = activity.model_dump(exclude_unset=True)
    for field_name, value in update_data.items():
        setattr(db_activity, field_name, value)

    db.commit()
    db.refresh(db_activity)
    return db_activity
