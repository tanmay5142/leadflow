import os

from fastapi import FastAPI, Request
from fastapi.exceptions import RequestValidationError
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from . import models  # noqa: F401  (needed so the tables get registered)
from .database import Base, engine
from .routers import leads

Base.metadata.create_all(bind=engine)

app = FastAPI(title="LeadFlow API")

# Which websites may call this API. Comma separated list in the environment.
origins = os.getenv("CORS_ORIGINS", "http://localhost:3000").split(",")
app.add_middleware(
    CORSMiddleware,
    allow_origins=[o.strip() for o in origins],
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.exception_handler(RequestValidationError)
async def validation_error_handler(request: Request, exc: RequestValidationError):
    """Return validation errors in one simple, readable format."""
    errors = [
        {
            "field": ".".join(str(part) for part in e["loc"][1:]),
            "message": e["msg"].removeprefix("Value error, "),
        }
        for e in exc.errors()
    ]
    message = errors[0]["message"] if errors else "Invalid request"
    return JSONResponse(
        status_code=422,
        content={"detail": message, "errors": errors},
    )


app.include_router(leads.router)


@app.get("/health")
def health():
    return {"status": "ok"}