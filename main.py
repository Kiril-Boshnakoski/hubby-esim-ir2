from fastapi import Depends, FastAPI, HTTPException
from pydantic import BaseModel
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.activity import Activity

app = FastAPI()


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

@app.get("/")
def read_root():
    return {"message": "Hello from hubby-esim-ir2!"}


@app.post("/activities")
def create_activity(activity: ActivityCreate, db: Session = Depends(get_db)):
    db_activity = Activity(**activity.model_dump())
    db.add(db_activity)
    db.commit()
    db.refresh(db_activity)
    return db_activity


@app.put("/activities/{activity_id}")
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