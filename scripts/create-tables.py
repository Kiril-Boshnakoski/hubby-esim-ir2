import sys
import os

# Додавање на коренот на проектот во sys.path за да може да се инпортира 'app'
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app.database import engine, Base
from app.models.user import User
from app.models.activity import Activity

def create_tables():
    print("Rebuilding tables in the database...")
    try:
        # Drop the existing schema so the pipeline always starts from a clean slate.
        Base.metadata.drop_all(bind=engine)
        # Recreate all tables defined in the models that inherit from Base.
        Base.metadata.create_all(bind=engine)
        print("Tables recreated successfully!")
    except Exception as e:
        print(f"An error occurred while rebuilding tables: {e}")

if __name__ == "__main__":
    create_tables()
