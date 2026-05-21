from fastapi import FastAPI

from app.routes import activities, recommendations, users

app = FastAPI()


@app.get("/")
def read_root():
    return {"message": "Hello from hubby-esim-ir2!"}


app.include_router(users.router)
app.include_router(activities.router)
app.include_router(recommendations.router)