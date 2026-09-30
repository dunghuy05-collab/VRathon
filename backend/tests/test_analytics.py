from datetime import datetime, timedelta, timezone
from types import SimpleNamespace

from app.services.analytics import calculate_acwr, dashboard_metrics, pace_min_per_km


def activity(days_ago: int, distance: float = 10000, moving_time: int = 3000):
    return SimpleNamespace(
        distance=distance,
        moving_time=moving_time,
        average_heartrate=150,
        start_date=datetime.now(timezone.utc) - timedelta(days=days_ago),
    )


def test_pace_minutes_per_km():
    assert pace_min_per_km(activity(0)) == 5


def test_dashboard_summary():
    result = dashboard_metrics([activity(1), activity(8), activity(15), activity(22)])
    assert result["summary"]["weekly_distance_km"] == 10
    assert result["summary"]["average_pace_min_km"] == 5
    assert result["summary"]["acwr"] == 1


def test_acwr_flags_spike():
    rows = [activity(1, 40000), activity(8, 5000), activity(15, 5000), activity(22, 5000)]
    assert calculate_acwr(rows) > 1.5

