from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.reservation.infrastructure.inbound.api.router import router as reservation_router
from app.user.infrastructure.inbound.api.router import router as user_router
from config import settings

app: FastAPI = FastAPI(title=settings.app_name, debug=settings.debug)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origin_list,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(user_router)
app.include_router(reservation_router)


@app.get("/health")
def health_check() -> dict[str, str]:
    return {"status": "ok"}
