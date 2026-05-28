from fastapi import FastAPI
from fastapi.exceptions import RequestValidationError
from fastapi.responses import JSONResponse

from app.api.v1.router import api_router
from app.core.exceptions import (
    ConflictException,
    NotFoundException,
    UnauthorizedException,
    ValidationException,
)
from app.middleware.cors import setup_cors

from app.database.base import Base
from app.database.session import engine

import app.models

app = FastAPI(
    title="DriveX API",
    version="1.0.0"
)

Base.metadata.create_all(bind=engine)

@app.get("/")
def root():
    return {"message": "DriveX Rental API running"}


setup_cors(app)


app.include_router(api_router, prefix="/api/v1")


@app.exception_handler(NotFoundException)
async def not_found_exception_handler(request, exc):
    return JSONResponse(
        status_code=404,
        content={
            "success": False,
            "message": str(exc)
        }
    )


@app.exception_handler(UnauthorizedException)
async def unauthorized_exception_handler(request, exc):
    return JSONResponse(
        status_code=401,
        content={
            "success": False,
            "message": str(exc)
        }
    )


@app.exception_handler(ConflictException)
async def conflict_exception_handler(request, exc):
    return JSONResponse(
        status_code=409,
        content={
            "success": False,
            "message": str(exc)
        }
    )


@app.exception_handler(ValidationException)
async def validation_exception_handler(request, exc):
    return JSONResponse(
        status_code=422,
        content={
            "success": False,
            "message": str(exc)
        }
    )


@app.exception_handler(RequestValidationError)
async def request_validation_exception_handler(request, exc):
    return JSONResponse(
        status_code=422,
        content={
            "success": False,
            "errors": exc.errors()
        }
    )