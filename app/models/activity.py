from sqlalchemy import Column, Integer, String, Float
from app.database import Base
from app.models.base import AuditMixin


class Activity(Base, AuditMixin):
    """Activity model for storing activity information."""

    __tablename__ = "activities"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(255), nullable=False, index=True)
    type = Column(String(100), nullable=True, index=True)
    phone_number = Column(String(20), nullable=True)
    latitude = Column(Float, nullable=True)
    longitude = Column(Float, nullable=True)
    rating = Column(Float, default=0.0, nullable=False)
    user_rating_count = Column(Integer, default=0, nullable=False)
    monday_working_hours = Column(String(50), nullable=True)
    tuesday_working_hours = Column(String(50), nullable=True)
    wednesday_working_hours = Column(String(50), nullable=True)
    thursday_working_hours = Column(String(50), nullable=True)
    friday_working_hours = Column(String(50), nullable=True)
    saturday_working_hours = Column(String(50), nullable=True)
    sunday_working_hours = Column(String(50), nullable=True)