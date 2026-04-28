from app.database import engine
from sqlalchemy import text

def test_conn():
    try:
        with engine.connect() as connection:
            # Извршуваме едноставен тест на базата
            result = connection.execute(text("SELECT 1"))
            print("✅ Конекцијата е успешна! Базата одговори.")
    except Exception as e:
        print(f"❌ Грешка при поврзување: {e}")

if __name__ == "__main__":
    test_conn()