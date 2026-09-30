from datetime import datetime

from pydantic import BaseModel, ConfigDict, EmailStr, Field


class RegisterRequest(BaseModel):
    email: EmailStr
    name: str = Field(min_length=2, max_length=120)
    password: str = Field(min_length=8, max_length=128)


class LoginRequest(BaseModel):
    email: EmailStr
    password: str


class UserOut(BaseModel):
    id: int
    email: EmailStr
    name: str
    strava_connected: bool = False
    model_config = ConfigDict(from_attributes=True)


class AuthResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserOut


class ActivityOut(BaseModel):
    id: int
    strava_activity_id: int
    name: str
    sport_type: str
    distance: float
    moving_time: int
    average_speed: float | None
    average_heartrate: float | None
    max_heartrate: float | None
    elevation_gain: float | None
    calories: float | None
    start_date: datetime
    model_config = ConfigDict(from_attributes=True)


class ActivityDetail(ActivityOut):
    stream: dict | None = None


class CoachRequest(BaseModel):
    goal: str = Field(min_length=3, max_length=500)


class CoachResponse(BaseModel):
    report: str
    generated_by: str

