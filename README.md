# MarathonVis

Nền tảng AI Running Coach kết nối Strava, phân tích lịch sử chạy và tạo khuyến nghị tập luyện cá nhân hóa.

[![Deploy to Render](https://render.com/images/deploy-to-render-button.svg)](https://render.com/deploy?repo=https%3A%2F%2Fgithub.com%2Fdunghuy05-collab%2FVRathon)

## Kiến trúc

- `backend/`: FastAPI, SQLAlchemy, PostgreSQL/SQLite, Strava OAuth, OpenAI Responses API.
- `frontend/`: Next.js App Router, TypeScript, TailwindCSS, TanStack Query, Recharts.
- `render.yaml`: PostgreSQL, API, frontend và cron đồng bộ Strava trên Render.

## Chạy local

Yêu cầu Python 3.11+, Node.js 20+ và tùy chọn Docker cho PostgreSQL.

```bash
cp .env.example backend/.env
docker compose up -d db
cd backend
python -m venv .venv
# Windows: .venv\Scripts\activate
pip install -r requirements.txt
uvicorn app.main:app --reload
```

Trong terminal khác:

```bash
cd frontend
cp ../.env.example .env.local
npm install
npm run dev
```

Mở `http://localhost:3000`. API docs ở `http://localhost:8000/docs`.

Nếu không chạy PostgreSQL, bỏ `DATABASE_URL` khỏi `backend/.env`; backend sẽ dùng SQLite cho phát triển.

## Cấu hình Strava

1. Tạo ứng dụng tại Strava API settings.
2. Đặt callback domain là hostname backend (local: `localhost`).
3. Callback URL ứng dụng dùng: `{BACKEND_URL}/api/v1/strava/callback`.
4. Điền `STRAVA_CLIENT_ID`, `STRAVA_CLIENT_SECRET`, `BACKEND_URL`, `FRONTEND_URL`.
5. Sinh khóa mã hóa token bằng lệnh dưới và đặt cùng một giá trị cho API và cron:

```bash
python -c "from cryptography.fernet import Fernet; print(Fernet.generate_key().decode())"
```

## Kiểm tra

```bash
cd backend && pytest
cd frontend && npm run typecheck && npm run build
```

## Ghi chú bảo mật và vận hành

- Không commit `.env`; production bắt buộc thay `SECRET_KEY` và cấu hình `TOKEN_ENCRYPTION_KEY`.
- Access/refresh token Strava được mã hóa ở trạng thái lưu nếu có khóa Fernet.
- OAuth `state` được ký và có hạn dùng; access token Strava tự làm mới trước khi hết hạn.
- Bản MVP tạo bảng tự động khi API khởi động. Trước thay đổi schema production, nên bổ sung Alembic migration.
- Chỉ số tải và nội dung AI là hỗ trợ ra quyết định, không phải tư vấn y tế.

