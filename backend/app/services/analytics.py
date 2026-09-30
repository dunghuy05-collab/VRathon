from collections import defaultdict
from datetime import datetime, timedelta, timezone
from statistics import mean

from app.models import Activity


def pace_min_per_km(activity: Activity) -> float | None:
    if not activity.distance or not activity.moving_time:
        return None
    return (activity.moving_time / 60) / (activity.distance / 1000)


def calculate_acwr(activities: list[Activity], now: datetime | None = None) -> float | None:
    now = now or datetime.now(timezone.utc)
    weekly = []
    for offset in range(4):
        end = now - timedelta(days=7 * offset)
        start = end - timedelta(days=7)
        weekly.append(sum(a.distance for a in activities if start <= _aware(a.start_date) < end) / 1000)
    chronic = mean(weekly) if weekly else 0
    return round(weekly[0] / chronic, 2) if chronic else None


def _aware(value: datetime) -> datetime:
    return value if value.tzinfo else value.replace(tzinfo=timezone.utc)


def dashboard_metrics(activities: list[Activity]) -> dict:
    now = datetime.now(timezone.utc)
    start_7d = now - timedelta(days=7)
    recent = [a for a in activities if _aware(a.start_date) >= start_7d]
    total_km = sum(a.distance for a in recent) / 1000
    paces = [p for a in recent if (p := pace_min_per_km(a))]
    hrs = [a.average_heartrate for a in recent if a.average_heartrate]

    by_week: dict[str, float] = defaultdict(float)
    for activity in activities:
        iso = activity.start_date.isocalendar()
        by_week[f"{iso.year}-W{iso.week:02d}"] += activity.distance / 1000

    pace_trend = [
        {"date": a.start_date.date().isoformat(), "pace": round(p, 2)}
        for a in sorted(activities, key=lambda x: x.start_date)[-20:]
        if (p := pace_min_per_km(a))
    ]
    weekly = [{"week": key, "distance": round(value, 2)} for key, value in sorted(by_week.items())[-12:]]
    acwr = calculate_acwr(activities, now)
    if acwr is None:
        risk = "insufficient_data"
    elif acwr > 1.5:
        risk = "high"
    elif acwr > 1.3:
        risk = "elevated"
    else:
        risk = "balanced"

    return {
        "summary": {
            "weekly_distance_km": round(total_km, 2),
            "weekly_activities": len(recent),
            "average_pace_min_km": round(mean(paces), 2) if paces else None,
            "average_heartrate": round(mean(hrs), 1) if hrs else None,
            "acwr": acwr,
            "overtraining_risk": risk,
        },
        "weekly_distance": weekly,
        "pace_trend": pace_trend,
    }


def heart_rate_zones(activities: list[Activity], max_hr: int = 190) -> list[dict]:
    bounds = [(0, .6), (.6, .7), (.7, .8), (.8, .9), (.9, 2)]
    minutes = [0.0] * 5
    for activity in activities:
        if not activity.average_heartrate:
            continue
        ratio = activity.average_heartrate / max_hr
        for idx, (low, high) in enumerate(bounds):
            if low <= ratio < high:
                minutes[idx] += activity.moving_time / 60
                break
    return [{"zone": f"Z{i + 1}", "minutes": round(value, 1)} for i, value in enumerate(minutes)]

