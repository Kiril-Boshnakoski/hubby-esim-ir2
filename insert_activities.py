import pandas as pd

from app.database import engine

FILE_PATH = "processed_activities.tsv"

df = pd.read_csv(FILE_PATH, sep="\t").head(1)

if df.empty:
    print("No activities found in the file.")
else:
    df = df.rename(columns={"activity_type": "type"})
    df["type"] = df.get("type", "other").fillna("other")
    df["phone_number"] = df.get("phone_number")
    df["rating"] = df.get("rating")
    df["user_rating_count"] = 0

    df = df[["name", "type", "phone_number", "latitude", "longitude", "rating", "user_rating_count"]]

    df.to_sql("activities", con=engine, index=False, if_exists="append")

    print("One activity inserted successfully!")