from datetime import datetime, timedelta, timezone
from uuid import uuid4

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.database.session import get_db
from app.dependencies import get_current_user
from app.models import Activity, User
from app.schemas import AuthResponse, LoginRequest, RegisterRequest, UserOut
from app.security import create_access_token, hash_password, verify_password

router = APIRouter(prefix="/auth", tags=["auth"])


def user_out(user: User) -> UserOut:
    return UserOut(id=user.id, email=user.email, name=user.name, strava_connected=bool(user.strava_id))


@router.post("/register", response_model=AuthResponse, status_code=status.HTTP_201_CREATED)
def register(payload: RegisterRequest, db: Session = Depends(get_db)) -> AuthResponse:
    email = payload.email.lower()
    if db.scalar(select(User).where(User.email == email)):
        raise HTTPException(409, "Email is already registered")
    user = User(email=email, name=payload.name.strip(), password_hash=hash_password(payload.password))
    db.add(user)
    db.commit()
    db.refresh(user)
    return AuthResponse(access_token=create_access_token(user.id), user=user_out(user))


@router.post("/login", response_model=AuthResponse)
def login(payload: LoginRequest, db: Session = Depends(get_db)) -> AuthResponse:
    user = db.scalar(select(User).where(User.email == payload.email.lower()))
    if not user or not verify_password(payload.password, user.password_hash):
        raise HTTPException(401, "Incorrect email or password")
    return AuthResponse(access_token=create_access_token(user.id), user=user_out(user))


@router.post("/demo", response_model=AuthResponse, status_code=status.HTTP_201_CREATED)
def create_demo(db: Session = Depends(get_db)) -> AuthResponse:
    """Create an isolated preview account with representative running history."""
    user = User(
        email=f"demo-{uuid4().hex}@preview.marathonvis.app",
        name="Demo Runner",
        password_hash=hash_password(uuid4().hex),
    )
    db.add(user)
    db.flush()
    now = datetime.now(timezone.utc)
    distances = [5.0, 7.2, 6.0, 9.5, 5.4, 11.0, 7.0, 13.2, 6.2, 15.0, 8.0, 17.5]
    for week, long_km in enumerate(distances):
        for session, ratio in enumerate((0.55, 1.0)):
            km = round(long_km * ratio, 1)
            pace = 6.25 - week * 0.055 + session * 0.12
            db.add(Activity(
                user_id=user.id,
                strava_activity_id=-(week * 10 + session + 1),
                name="Long run" if session else "Easy run",
                sport_type="Run",
                distance=km * 1000,
                moving_time=int(km * pace * 60),
                average_speed=1000 / (pace * 60),
                average_heartrate=143 + session * 7 + week % 3,
                max_heartrate=168 + session * 5,
                elevation_gain=round(km * (4 + week % 4), 1),
                start_date=now - timedelta(days=(11 - week) * 7 + (3 if session == 0 else 0)),
            ))
    db.commit()
    db.refresh(user)
    return AuthResponse(access_token=create_access_token(user.id), user=user_out(user))


@router.get("/me", response_model=UserOut)
def me(user: User = Depends(get_current_user)) -> UserOut:
    return user_out(user)

