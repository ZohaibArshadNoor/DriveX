from fastapi import APIRouter

from app.api.v1.auth import router as auth_router
from app.api.v1.health import router as health_router
from app.api.v1.vehicles import router as vehicles_router
from app.api.v1.bookings import router as bookings_router
from app.api.v1.documents import router as documents_router
from app.api.v1.payments import router as payment_router
from app.api.v1.dashboard import router as dashboard_router
from app.api.v1.reports import router as reports_router
from app.api.v1 import users
from app.api.v1 import admin_documents


api_router = APIRouter()

api_router.include_router(health_router)
api_router.include_router(auth_router)
api_router.include_router(vehicles_router)
api_router.include_router(bookings_router)
api_router.include_router(documents_router)
api_router.include_router(payment_router)
api_router.include_router(dashboard_router)
api_router.include_router(reports_router)
api_router.include_router(users.router)
api_router.include_router(admin_documents.router)
