from sqlalchemy import Integer, String, Float, JSON
from sqlalchemy.orm import Mapped, mapped_column
from app.database import Base
from app.models.base import AuditMixin

class Activity(Base, AuditMixin):
    """Activity model for storing activity information."""

    __tablename__ = "activities"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    name: Mapped[str] = mapped_column(String(255), nullable=False, index=True)
    type: Mapped[str | None] = mapped_column(String(100), nullable=True, index=True, default="other")
    phone_number: Mapped[str | None] = mapped_column(String(50), nullable=True)
    latitude: Mapped[float] = mapped_column(Float, nullable=False, index=True)
    longitude: Mapped[float] = mapped_column(Float, nullable=False, index=True)
    rating: Mapped[float | None] = mapped_column(Float, nullable=True)
    user_rating_count: Mapped[int] = mapped_column(Integer, nullable=False, default=0)

    # JSON koloni za rabotno vreme
    monday_working_hours: Mapped[list[dict[str, str]] | None] = mapped_column(JSON, nullable=True)
    tuesday_working_hours: Mapped[list[dict[str, str]] | None] = mapped_column(JSON, nullable=True)
    wednesday_working_hours: Mapped[list[dict[str, str]] | None] = mapped_column(JSON, nullable=True)
    thursday_working_hours: Mapped[list[dict[str, str]] | None] = mapped_column(JSON, nullable=True)
    friday_working_hours: Mapped[list[dict[str, str]] | None] = mapped_column(JSON, nullable=True)
    saturday_working_hours: Mapped[list[dict[str, str]] | None] = mapped_column(JSON, nullable=True)
    sunday_working_hours: Mapped[list[dict[str, str]] | None] = mapped_column(JSON, nullable=True)