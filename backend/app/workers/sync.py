import asyncio

from sqlalchemy import select

from app.database.session import SessionLocal
from app.models import User
from app.services.strava_service import sync_activities


async def sync_all() -> None:
    with SessionLocal() as db:
        users = list(db.scalars(select(User).where(User.strava_id.is_not(None))))
        for user in users:
            try:
                await sync_activities(user, db)
            except Exception as exc:
                print(f"Sync failed for user {user.id}: {exc}")


if __name__ == "__main__":
    asyncio.run(sync_all())

