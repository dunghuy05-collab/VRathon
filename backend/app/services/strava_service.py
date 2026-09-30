import time
from datetime import datetime
from urllib.parse import urlencode

import httpx
from fastapi import HTTPException
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.config.settings import settings
from app.models import Activity, ActivityStream, User
from app.security import decrypt_secret, encrypt_secret

AUTH_URL = "https://www.strava.com/oauth/authorize"
TOKEN_URL = "https://www.strava.com/oauth/token"
API_URL = "https://api-v3.strava.com"


def authorization_url(state: str) -> str:
    if not settings.strava_client_id:
        raise HTTPException(503, "Strava integration is not configured")
    params = {
        "client_id": settings.strava_client_id,
        "redirect_uri": f"{settings.backend_url}/api/v1/strava/callback",
        "response_type": "code",
        "approval_prompt": "auto",
        "scope": "read,activity:read_all",
        "state": state,
    }
    return f"{AUTH_URL}?{urlencode(params)}"


async def exchange_code(code: str) -> dict:
    async with httpx.AsyncClient(timeout=20) as client:
        response = await client.post(TOKEN_URL, data={
            "client_id": settings.strava_client_id,
            "client_secret": settings.strava_client_secret,
            "code": code,
            "grant_type": "authorization_code",
        })
    if response.is_error:
        raise HTTPException(400, "Strava authorization failed")
    return response.json()


async def valid_access_token(user: User, db: Session) -> str:
    if not user.access_token or not user.refresh_token:
        raise HTTPException(400, "Connect Strava first")
    if user.token_expires_at and user.token_expires_at > int(time.time()) + 300:
        return decrypt_secret(user.access_token)
    async with httpx.AsyncClient(timeout=20) as client:
        response = await client.post(TOKEN_URL, data={
            "client_id": settings.strava_client_id,
            "client_secret": settings.strava_client_secret,
            "grant_type": "refresh_token",
            "refresh_token": decrypt_secret(user.refresh_token),
        })
    if response.is_error:
        raise HTTPException(502, "Could not refresh Strava access")
    payload = response.json()
    user.access_token = encrypt_secret(payload["access_token"])
    user.refresh_token = encrypt_secret(payload["refresh_token"])
    user.token_expires_at = payload["expires_at"]
    db.commit()
    return payload["access_token"]


async def sync_activities(user: User, db: Session) -> int:
    token = await valid_access_token(user, db)
    headers = {"Authorization": f"Bearer {token}"}
    synced = 0
    async with httpx.AsyncClient(base_url=API_URL, headers=headers, timeout=30) as client:
        for page in range(1, 6):
            response = await client.get("/api/v3/athlete/activities", params={"page": page, "per_page": 100})
            response.raise_for_status()
            rows = response.json()
            if not rows:
                break
            for row in rows:
                if row.get("sport_type") not in {"Run", "TrailRun", "VirtualRun"}:
                    continue
                activity = db.scalar(select(Activity).where(
                    Activity.user_id == user.id,
                    Activity.strava_activity_id == row["id"],
                ))
                if not activity:
                    activity = Activity(user_id=user.id, strava_activity_id=row["id"])
                    db.add(activity)
                    synced += 1
                activity.name = row.get("name", "Run")
                activity.sport_type = row.get("sport_type", "Run")
                activity.distance = row.get("distance", 0)
                activity.moving_time = row.get("moving_time", 0)
                activity.average_speed = row.get("average_speed")
                activity.average_heartrate = row.get("average_heartrate")
                activity.max_heartrate = row.get("max_heartrate")
                activity.elevation_gain = row.get("total_elevation_gain")
                activity.start_date = datetime.fromisoformat(row["start_date"].replace("Z", "+00:00"))
            db.commit()
    return synced


async def sync_stream(activity: Activity, user: User, db: Session) -> ActivityStream:
    if activity.stream:
        return activity.stream
    token = await valid_access_token(user, db)
    async with httpx.AsyncClient(base_url=API_URL, timeout=30) as client:
        response = await client.get(
            f"/api/v3/activities/{activity.strava_activity_id}/streams",
            headers={"Authorization": f"Bearer {token}"},
            params={"keys": "time,latlng,heartrate,cadence,velocity_smooth,altitude", "key_by_type": "true"},
        )
    response.raise_for_status()
    payload = response.json()
    stream = ActivityStream(activity_id=activity.id)
    for key in ("time", "latlng", "heartrate", "cadence", "velocity_smooth", "altitude"):
        setattr(stream, key, payload.get(key, {}).get("data", []))
    db.add(stream)
    db.commit()
    db.refresh(stream)
    return stream

