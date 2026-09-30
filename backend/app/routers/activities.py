from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy import desc, select
from sqlalchemy.orm import Session

from app.database.session import get_db
from app.dependencies import get_current_user
from app.models import Activity, User
from app.schemas import ActivityDetail, ActivityOut
from app.services.strava_service import sync_stream

router = APIRouter(prefix="/activities", tags=["activities"])


@router.get("", response_model=list[ActivityOut])
def list_activities(
    limit: int = Query(20, ge=1, le=100),
    offset: int = Query(0, ge=0),
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> list[Activity]:
    return list(db.scalars(
        select(Activity).where(Activity.user_id == user.id).order_by(desc(Activity.start_date)).limit(limit).offset(offset)
    ))


@router.get("/{activity_id}", response_model=ActivityDetail)
async def activity_detail(
    activity_id: int,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> ActivityDetail:
    activity = db.scalar(select(Activity).where(Activity.id == activity_id, Activity.user_id == user.id))
    if not activity:
        raise HTTPException(404, "Activity not found")
    stream = await sync_stream(activity, user, db)
    result = ActivityOut.model_validate(activity).model_dump()
    result["stream"] = {
        "time": stream.time, "latlng": stream.latlng, "heartrate": stream.heartrate,
        "cadence": stream.cadence, "velocity_smooth": stream.velocity_smooth, "altitude": stream.altitude,
    }
    return ActivityDetail(**result)

