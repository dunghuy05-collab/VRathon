import json

from openai import AsyncOpenAI

from app.config.settings import settings


async def generate_coaching_report(goal: str, metrics: dict, activities: list[dict]) -> tuple[str, str]:
    if not settings.openai_api_key:
        summary = metrics["summary"]
        report = (
            f"Đánh giá hiện tại: bạn đã chạy {summary['weekly_distance_km']} km trong 7 ngày qua. "
            f"Mục tiêu: {goal}.\n\n"
            "Khuyến nghị: duy trì phần lớn buổi chạy ở cường độ dễ, tăng khối lượng tuần không quá đột ngột, "
            "thêm một buổi chất lượng và ít nhất một ngày nghỉ. Kết nối OPENAI_API_KEY để nhận kế hoạch cá nhân hóa chi tiết."
        )
        return report, "fallback"

    client = AsyncOpenAI(api_key=settings.openai_api_key)
    prompt = {
        "goal": goal,
        "metrics": metrics,
        "recent_activities": activities[:14],
    }
    response = await client.responses.create(
        model=settings.openai_model,
        instructions=(
            "Bạn là HLV chạy bộ thận trọng. Viết bằng tiếng Việt, súc tích. Dựa duy nhất trên dữ liệu được cung cấp. "
            "Gồm: đánh giá thể lực, điểm yếu, phục hồi, và lịch 7 ngày có cự ly/cường độ. "
            "Không chẩn đoán y khoa; nêu rõ khi dữ liệu chưa đủ."
        ),
        input=json.dumps(prompt, ensure_ascii=False, default=str),
    )
    return response.output_text, settings.openai_model

