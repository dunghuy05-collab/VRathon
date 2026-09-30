export const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "/api/v1";

export type User = { id: number; email: string; name: string; strava_connected: boolean };
export type Activity = {
  id: number; strava_activity_id: number; name: string; sport_type: string; distance: number;
  moving_time: number; average_speed: number | null; average_heartrate: number | null;
  max_heartrate: number | null; elevation_gain: number | null; calories: number | null; start_date: string;
};
export type ActivityDetail = Activity & { stream: Record<string, number[] | number[][]> | null };
export type Metrics = {
  summary: {
    weekly_distance_km: number; weekly_activities: number; average_pace_min_km: number | null;
    average_heartrate: number | null; acwr: number | null; overtraining_risk: string;
  };
  weekly_distance: { week: string; distance: number }[];
  pace_trend: { date: string; pace: number }[];
  heart_rate_zones?: { zone: string; minutes: number }[];
};

export function token() {
  return typeof window === "undefined" ? null : localStorage.getItem("token");
}

export async function api<T>(path: string, options: RequestInit = {}): Promise<T> {
  const headers = new Headers(options.headers);
  headers.set("Content-Type", "application/json");
  const auth = token();
  if (auth) headers.set("Authorization", `Bearer ${auth}`);
  const response = await fetch(`${API_URL}${path}`, { ...options, headers });
  if (response.status === 401 && typeof window !== "undefined") {
    localStorage.removeItem("token");
    window.location.href = "/login";
  }
  if (!response.ok) {
    const body = await response.json().catch(() => ({}));
    throw new Error(body.detail ?? "Có lỗi xảy ra. Vui lòng thử lại.");
  }
  return response.json();
}

export const formatPace = (pace: number | null) => {
  if (!pace) return "—";
  const minutes = Math.floor(pace);
  return `${minutes}:${Math.round((pace - minutes) * 60).toString().padStart(2, "0")}`;
};

export const formatDuration = (seconds: number) => {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  return hours ? `${hours}h ${minutes}m` : `${minutes}m`;
};

