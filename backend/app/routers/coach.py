from fastapi import APIRouter, Depends
from sqlalchemy import desc, select
from sqlalchemy.orm import Session

from app.database.session import get_db
from app.dependencies import get_current_user
from app.models import Activity, User
from app.schemas import ActivityOut, CoachRequest, CoachResponse
from app.services.ai_service import generate_coaching_report
from app.services.analytics import dashboard_metrics

router = APIRouter(prefix="/coach", tags=["coach"])


@router.post("/report", response_model=CoachResponse)
async def report(
    payload: CoachRequest,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> CoachResponse:
    activities = list(db.scalars(
        select(Activity).where(Activity.user_id == user.id).order_by(desc(Activity.start_date)).limit(100)
    ))
    metrics = dashboard_metrics(activities)
    activity_data = [ActivityOut.model_validate(a).model_dump(mode="json") for a in activities]
    text, source = await generate_coaching_report(payload.goal, metrics, activity_data)
    return CoachResponse(report=text, generated_by=source)

