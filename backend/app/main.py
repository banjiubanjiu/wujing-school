from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv
from pathlib import Path

from app.routers import api, auth, health
from app.seed import init_db_with_sample_data

# 自动加载项目根目录下的 .env（方便本地运行时无需手动导出环境变量）
load_dotenv(dotenv_path=Path(__file__).resolve().parent.parent / ".env")

app = FastAPI(title="Police Academy Backend", version="0.1.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(health.router)
app.include_router(auth.router)
app.include_router(api.router)


@app.on_event("startup")
def startup():
    init_db_with_sample_data()


@app.get("/", tags=["health"])
def root():
    return {"service": "police-academy-backend"}


if __name__ == "__main__":
    import uvicorn

    uvicorn.run("app.main:app", host="0.0.0.0", port=8000, reload=True)
