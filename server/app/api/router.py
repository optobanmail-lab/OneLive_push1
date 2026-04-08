from fastapi import APIRouter

from app.api.routes.auth import router as auth_router
from app.api.routes.users import router as users_router
from app.api.routes.habits import router as habits_router
from app.api.routes.notes import router as notes_router
from app.api.routes.stats import router as stats_router
from app.api.routes.timer import router as timer_router

api_router = APIRouter()

api_router.include_router(auth_router, prefix="/auth", tags=["auth"])
api_router.include_router(users_router, prefix="/users", tags=["users"])
api_router.include_router(habits_router, prefix="/habits", tags=["habits"])
api_router.include_router(notes_router, prefix="/notes", tags=["notes"])
api_router.include_router(stats_router, prefix="/stats", tags=["stats"])
api_router.include_router(timer_router, prefix="/timer", tags=["timer"])