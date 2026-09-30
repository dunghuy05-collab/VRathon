from fastapi import APIRouter, Depends, HTTPException, Query
from fastapi.responses import RedirectResponse
from sqlalchemy.orm import Session

from app.config.settings import settings
from app.database.session import get_db
from app.dependencies import get_current_user
from app.models import User
from app.security import create_access_token, decode_access_token, encrypt_secret
from app.services.strava_service import authorization_url, exchange_code, sync_activities

router = APIRouter(prefix="/strava", tags=["strava"])


@router.get("/connect")
def connect(user: User = Depends(get_current_user)) -> dict:
    return {"authorization_url": authorization_url(create_access_token(user.id))}


@router.get("/callback")
async def callback(
    code: str = Query(...),
    state: str = Query(...),
    scope: str = Query(""),
    db: Session = Depends(get_db),
) -> RedirectResponse:
    user_id = decode_access_token(state)
    user = db.get(User, user_id) if user_id else None
    if not user:
        raise HTTPException(400, "Invalid OAuth state")
    payload = await exchange_code(code)
    athlete = payload.get("athlete", {})
    user.strava_id = athlete.get("id")
    user.access_token = encrypt_secret(payload["access_token"])
    user.refresh_token = encrypt_secret(payload["refresh_token"])
    user.token_expires_at = payload["expires_at"]
    user.strava_scope = payload.get("scope", scope)
    if athlete.get("firstname") and user.name == user.email.split("@")[0]:
        user.name = f"{athlete.get('firstname', '')} {athlete.get('lastname', '')}".strip()
    db.commit()
    return RedirectResponse(f"{settings.frontend_url}/?strava=connected")


@router.post("/sync")
async def sync(user: User = Depends(get_current_user), db: Session = Depends(get_db)) -> dict:
    count = await sync_activities(user, db)
    return {"synced": count}

