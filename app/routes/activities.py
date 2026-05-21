from typing import Optional, List
from datetime import datetime
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


# ============================================================================
# Utility Functions
# ============================================================================

def is_open_now() -> int:
    """
    Get current day of week (0-6).
    
    Returns:
        Day of week (0=Monday, 6=Sunday)
    """
    return datetime.now().weekday()


def check_activity_open(activity: Activity, day_of_week: int) -> bool:
    """
    Check if an activity is currently open based on working hours.
    Verifies if the current time falls within the activity's working hours for the given day.
    
    Args:
        activity: Activity model instance
        day_of_week: Day of week (0=Monday, 6=Sunday)
    
    Returns:
        True if activity is open at the current time, False otherwise
    """
    day_names = ["monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"]
    
    if day_of_week < 0 or day_of_week > 6:
        return False
    
    working_hours_attr = f"{day_names[day_of_week]}_working_hours"
    working_hours = getattr(activity, working_hours_attr, None)
    
    # If no working hours defined for this day, assume closed
    if working_hours is None or len(working_hours) == 0:
        return False
    
    # Get current time as minutes since midnight
    now = datetime.now()
    current_minutes = now.hour * 60 + now.minute
    
    # Check if current time falls within any of the working hour ranges
    for hours_entry in working_hours:
        open_time = hours_entry.get("open")
        close_time = hours_entry.get("close")
        
        if not open_time or not close_time:
            continue
        
        try:
            # Parse time strings (format: "HH:MM")
            open_hours, open_minutes = map(int, open_time.split(":"))
            close_hours, close_minutes = map(int, close_time.split(":"))
            
            open_time_minutes = open_hours * 60 + open_minutes
            close_time_minutes = close_hours * 60 + close_minutes
            
            # Check if current time is within range
            if open_time_minutes <= current_minutes < close_time_minutes:
                return True
        except (ValueError, AttributeError):
            # Invalid time format, skip this entry
            continue
    
    return False


def build_category_filter(category: str):
    """Build a case-insensitive category filter that matches category fragments."""
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


# ============================================================================
# Pydantic Models
# ============================================================================

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


# ============================================================================
# Endpoints
# ============================================================================

@router.get("/", response_model=List[ActivityResponse], status_code=status.HTTP_200_OK)
def get_activities(
    limit: int = Query(20, ge=1, le=100, description="Number of activities to return (1-100)"),
    category: Optional[str] = Query(None, description="Filter by activity category fragment (e.g., 'restaurant' matches 'italian_restaurant')"),
    min_rating: Optional[float] = Query(None, ge=0.0, le=5.0, description="Minimum rating (0-5)"),
    min_rating_count: Optional[int] = Query(None, ge=0, description="Minimum number of ratings"),
    open_now: Optional[bool] = Query(None, description="Filter by currently open activities"),
    db: Session = Depends(get_db)
) -> List[ActivityResponse]:
    """
    Retrieve activities with optional filtering.
    
    Query Parameters:
    - **limit**: Maximum number of activities to return (default: 20, range: 1-100)
    - **category**: Filter by activity category fragment (e.g., 'restaurant' matches 'italian_restaurant')
    - **min_rating**: Minimum rating threshold (0-5)
    - **min_rating_count**: Minimum number of user ratings required
    - **open_now**: Filter by currently open activities (true/false)
    
    Returns:
        List of activities matching all provided filter criteria.
        
    Examples:
        GET /activities
        GET /activities?limit=10
        GET /activities?category=restaurant
        GET /activities?min_rating=4.5
        GET /activities?min_rating_count=100
        GET /activities?open_now=true
        GET /activities?category=restaurant&min_rating=4.5&open_now=true
    """
    
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
        day_of_week = is_open_now()
        filtered_activities = [
            activity for activity in activities
            if check_activity_open(activity, day_of_week) == open_now
        ]
        return filtered_activities
    
    return activities



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
