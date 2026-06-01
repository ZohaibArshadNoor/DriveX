from fastapi import FastAPI
from fastapi.exceptions import RequestValidationError
from fastapi.responses import JSONResponse
from fastapi.staticfiles import StaticFiles        # ADD THIS IMPORT
from fastapi.encoders import jsonable_encoder

from app.api.v1.router import api_router
from app.core.exceptions import (
    ConflictException,
    NotFoundException,
    UnauthorizedException,
    ValidationException,
    BadRequestException,
)
from app.middleware.cors import setup_cors
from app.database.base import Base
from app.database.session import engine

app = FastAPI(title="DriveX API", version="1.0.0")

Base.metadata.create_all(bind=engine)

@app.get("/")
def root():
    return {"message": "DriveX Rental API running"}

setup_cors(app)

# Include the main API router
app.include_router(api_router, prefix="/api/v1")

# Exception handlers (only once each)
@app.exception_handler(NotFoundException)
async def not_found_exception_handler(request, exc):
    return JSONResponse(status_code=404, content={"success": False, "message": str(exc)})

@app.exception_handler(UnauthorizedException)
async def unauthorized_exception_handler(request, exc):
    return JSONResponse(status_code=401, content={"success": False, "message": str(exc)})

@app.exception_handler(ConflictException)
async def conflict_exception_handler(request, exc):
    return JSONResponse(status_code=409, content={"success": False, "message": str(exc)})

@app.exception_handler(ValidationException)
async def validation_exception_handler(request, exc):
    return JSONResponse(status_code=422, content={"success": False, "message": str(exc)})

@app.exception_handler(RequestValidationError)
async def request_validation_exception_handler(request, exc):
    return JSONResponse(status_code=422, content={"success": False, "errors": jsonable_encoder(exc.errors())})

@app.exception_handler(BadRequestException)
async def bad_request_handler(request, exc):
    return JSONResponse(status_code=400, content={"success": False, "message": str(exc)})

# ⬇️ IMPORTANT: mount the uploads directory for static file serving
app.mount("/uploads", StaticFiles(directory="uploads"), name="uploads")