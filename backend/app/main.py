from fastapi import FastAPI

from . import models
from .database import Base, engine

Base.metadata.create_all(bind=engine)

app = FastAPI(title="LeadFlow API")

@app.get("/health")
def health():
    return {"status": "ok"}