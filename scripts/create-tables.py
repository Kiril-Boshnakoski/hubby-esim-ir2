import sys
import os

# Додавање на коренот на проектот во sys.path за да може да се инпортира 'app'
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app.database import engine, Base
from app.models.user import User
from app.models.activity import Activity

def create_tables():
    print("Creating tables in the database...")
    try:
        # Ова ќе ги креира сите табели дефинирани во моделите кои го наследуваат Base
        Base.metadata.create_all(bind=engine)
        print("Tables created successfully!")
    except Exception as e:
        print(f"An error occurred while creating tables: {e}")

if __name__ == "__main__":
    create_tables()
