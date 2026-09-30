from fastapi import APIRouter, Depends
from sqlalchemy import desc, select
from sqlalchemy.orm import Session

from app.database.session import get_db
from app.dependencies import get_current_user
from app.models import Activity, User
from app.services.analytics import dashboard_metrics, heart_rate_zones

router = APIRouter(prefix="/analytics", tags=["analytics"])


def _activities(user: User, db: Session) -> list[Activity]:
    return list(db.scalars(select(Activity).where(Activity.user_id == user.id).order_by(desc(Activity.start_date)).limit(500)))


@router.get("/dashboard")
def dashboard(user: User = Depends(get_current_user), db: Session = Depends(get_db)) -> dict:
    return dashboard_metrics(_activities(user, db))


@router.get("/performance")
def performance(user: User = Depends(get_current_user), db: Session = Depends(get_db)) -> dict:
    activities = _activities(user, db)
    metrics = dashboard_metrics(activities)
    metrics["heart_rate_zones"] = heart_rate_zones(activities)
    return metrics

