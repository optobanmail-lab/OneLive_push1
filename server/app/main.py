from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.core.config import settings
from app.api.router import api_router
from app.db.session import engine
from app.db.base import Base

app = FastAPI(title="OneLive API", version="0.1.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins_list,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(api_router, prefix="/api")


@app.on_event("startup")
def on_startup():
    # Для старта удобно. В проде лучше Alembic.
    Base.metadata.create_all(bind=engine)


@app.get("/health")
def health():
    return {"ok": True}