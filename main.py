from fastapi import FastAPI

from app.routes import users, activities

app = FastAPI()


@app.get("/")
def read_root():
    return {"message": "Hello from hubby-esim-ir2!"}


app.include_router(users.router)
app.include_router(activities.router)