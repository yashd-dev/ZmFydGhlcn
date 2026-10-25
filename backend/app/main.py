from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from .api import router
from .config import settings
from .repository import repository


@asynccontextmanager
async def lifespan(_: FastAPI):
    repository.initialize()
    repository.seed_if_empty()
    yield


app = FastAPI(title="Wind Intelligence API", version="0.1.0", lifespan=lifespan)
app.add_middleware(
    CORSMiddleware,
    allow_origins=list(settings.allowed_origins),
    allow_methods=["GET"],
    allow_headers=["Accept", "Content-Type"],
)
app.include_router(router)
