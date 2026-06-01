from typing import Optional, List
from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from sqlalchemy import select


from app.database import get_db  
from app.models.user import User
from app.utils.geo_utils import haversine
from pydantic import BaseModel, EmailStr

router = APIRouter(
    prefix="/users",
    tags=["Users"]
)


# ============================================================================
# Pydantic Models
# ============================================================================

class UserResponse(BaseModel):
    """Response model for User."""
    id: int
    email: str
    name: str
    surname: str
    destination: Optional[str] = None
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    
    class Config:
        from_attributes = True


class UserCreate(BaseModel):
    email: EmailStr
    name: str
    surname: str
    destination: Optional[str] = None
    latitude: Optional[float] = None
    longitude: Optional[float] = None


class UserUpdate(BaseModel):
    name: Optional[str] = None
    surname: Optional[str] = None
    destination: Optional[str] = None
    latitude: Optional[float] = None
    longitude: Optional[float] = None


# ============================================================================
# Endpoints
# ============================================================================

@router.get("/", response_model=List[UserResponse], status_code=status.HTTP_200_OK)
def get_users(
    limit: int = Query(20, ge=1, le=100, description="Number of users to return (1-100)"),
    latitude: Optional[float] = Query(None, description="Latitude for geolocation filter"),
    longitude: Optional[float] = Query(None, description="Longitude for geolocation filter"),
    radius_km: Optional[float] = Query(None, ge=0.1, description="Search radius in kilometers"),
    db: Session = Depends(get_db)
) -> List[UserResponse]:
    """
    Retrieve users with optional geolocation filtering.
    
    Query Parameters:
    - **limit**: Maximum number of users to return (default: 20, range: 1-100)
    - **latitude**: User's latitude for nearby user search (requires longitude and radius_km)
    - **longitude**: User's longitude for nearby user search (requires latitude and radius_km)
    - **radius_km**: Search radius in kilometers (requires latitude and longitude)
    
    Returns:
        List of users matching the query criteria.
        
    Examples:
        GET /users
        GET /users?limit=10
        GET /users?latitude=41.123&longitude=20.801&radius_km=5
    """
    
    # Validate geolocation parameters
    has_latitude = latitude is not None
    has_longitude = longitude is not None
    has_radius = radius_km is not None
    
    # Check if coordinates are partially provided
    if (has_latitude or has_longitude or has_radius):
        if not (has_latitude and has_longitude and has_radius):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Latitude, longitude, and radius_km must all be provided together for geolocation filtering"
            )
    
    # Query users. If geolocation filtering is requested, fetch all users
    # and apply the radius filter in Python, then apply the `limit`.
    if has_latitude and has_longitude and has_radius:
        query = select(User)
    else:
        query = select(User).limit(limit)

    users = db.execute(query).scalars().all()

    # Filter by geolocation if all parameters are provided
    if has_latitude and has_longitude and has_radius:
        filtered_users = []
        for user in users:
            # Skip users without coordinates
            if user.latitude is None or user.longitude is None:
                continue

            # Calculate distance using Haversine formula
            distance = haversine(
                latitude, longitude,
                user.latitude, user.longitude
            )

            # Include user if within radius
            if distance <= radius_km:
                filtered_users.append(user)

        # Apply the limit after filtering
        return filtered_users[:limit]

    return users


@router.get("/{user_id}", response_model=UserResponse, status_code=status.HTTP_200_OK)
def get_user_by_id(user_id: int, db: Session = Depends(get_db)) -> UserResponse:
    """Retrieve a single user by ID."""

    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"User with id {user_id} was not found.",
        )

    return user



@router.post("/", status_code=status.HTTP_201_CREATED)
def create_user(user_data: UserCreate, db: Session = Depends(get_db)):
    
    existing_user = db.query(User).filter(User.email == user_data.email).first()
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST, 
            detail="Email-от веќе е зафатен."
        )
    
    
    new_user = User(
        email=user_data.email,
        name=user_data.name,
        surname=user_data.surname,
        destination=user_data.destination,
        latitude=user_data.latitude,
        longitude=user_data.longitude
    )
    
    db.add(new_user)
    db.commit()
    db.refresh(new_user)  
    return new_user



@router.put("/{user_id}")
def update_user(user_id: int, user_data: UserUpdate, db: Session = Depends(get_db)):
  
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, 
            detail="Корисникот со тоа ID не постои."
        )
    
    
    update_dict = user_data.model_dump(exclude_unset=True)
    for key, value in update_dict.items():
        setattr(user, key, value)
        
    db.commit()
    db.refresh(user)
    return user