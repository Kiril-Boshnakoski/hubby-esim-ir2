from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session


from app.database import get_db  
from app.models.user import User
from pydantic import BaseModel, EmailStr

router = APIRouter(
    prefix="/users",
    tags=["Users"]
)


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