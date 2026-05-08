import random
from faker import Faker

from app.database import SessionLocal
from app.models.user import User 

fake = Faker()

SKOPJE_LAT = 41.9981
SKOPJE_LON = 21.4254


def generate_coordinates():
    lat_offset = random.uniform(-0.02, 0.02)
    lon_offset = random.uniform(-0.02, 0.02)
    return SKOPJE_LAT + lat_offset, SKOPJE_LON + lon_offset


def generate_dummy_users(n=70):  #test
    db = SessionLocal()

    users = []

    for _ in range(n): 
        first_name = fake.first_name()
        last_name = fake.last_name()
        email = fake.unique.email()
        lat, lon = generate_coordinates()

        user = User(
            name=first_name,
            surname=last_name,
            email=email,
            destination="Skopje",
            latitude=lat,
            longitude=lon
        )

        users.append(user)

    db.add_all(users)
    db.commit()
    db.close()

    print(f"Inserted {n} user successfully")


if __name__ == "__main__":
    generate_dummy_users()