from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.routes import activities, recommendations, users

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        # Vite dev server (default)
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        # Vite preview/build
        "http://localhost:4173",
        "http://127.0.0.1:4173",
        # Common dev/test ports
        "http://localhost:3000",
        "http://127.0.0.1:3000",
        "http://localhost:3001",
        "http://127.0.0.1:3001",
        "http://localhost:8080",
        "http://127.0.0.1:8080",
        "http://localhost:8081",
        "http://127.0.0.1:8081",
        # Cloudflare Workers / Wrangler local
        "http://localhost:8787",
        "http://127.0.0.1:8787",
    ],
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allow_headers=["*"],
)


@app.get("/")
def read_root():
    return {"message": "Hello from hubby-esim-ir2!"}


app.include_router(users.router)
app.include_router(activities.router)
app.include_router(recommendations.router)