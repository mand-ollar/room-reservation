from fastapi import FastAPI

from app.user.infrastructure.inbound.api.router import router as user_router
from config import settings

app: FastAPI = FastAPI(title=settings.app_name, debug=settings.debug)

app.include_router(user_router)


@app.get("/health")
def health_check() -> dict[str, str]:
    return {"status": "ok"}
