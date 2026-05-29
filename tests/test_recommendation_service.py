import unittest
from unittest.mock import patch

from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool

from app.models.activity import Activity
from app.models.base import Base
from app.services.recommendation import build_ranked_recommendations


class RecommendationServiceTests(unittest.TestCase):
    def setUp(self) -> None:
        self.engine = create_engine(
            "sqlite://",
            connect_args={"check_same_thread": False},
            poolclass=StaticPool,
        )
        Base.metadata.create_all(self.engine)
        self.SessionLocal = sessionmaker(bind=self.engine)

    def tearDown(self) -> None:
        Base.metadata.drop_all(self.engine)
        self.engine.dispose()

    def _create_activity(self, **kwargs) -> Activity:
        defaults = {
            "name": "Sample Activity",
            "type": "restaurant",
            "latitude": 41.0,
            "longitude": 21.0,
            "rating": 4.5,
            "user_rating_count": 25,
        }
        defaults.update(kwargs)
        return Activity(**defaults)

    def test_expands_radius_when_no_open_activities_are_found_initially(self) -> None:
        session = self.SessionLocal()
        session.add(
            self._create_activity(
                name="Far But Open",
                latitude=41.018,
                longitude=21.0,
            )
        )
        session.commit()

        with patch("app.services.recommendation.infer_context", return_value="breakfast"), patch(
            "app.services.recommendation.is_open", return_value=True
        ):
            response = build_ranked_recommendations(session, 41.0, 21.0)

        self.assertEqual(len(response["recommendations"]), 1)
        self.assertEqual(response["recommendations"][0]["name"], "Far But Open")
        self.assertGreater(response["search_radius_km"], 1.0)

        session.close()

    def test_explicit_radius_searches_requested_distance(self) -> None:
        session = self.SessionLocal()
        session.add(
            self._create_activity(
                name="Far Enough For Twenty Km Radius",
                latitude=41.16,
                longitude=21.0,
            )
        )
        session.commit()

        with patch("app.services.recommendation.infer_context", return_value="breakfast"), patch(
            "app.services.recommendation.is_open", return_value=True
        ):
            response = build_ranked_recommendations(session, 41.0, 21.0, radius_km=20.0, context="lunch")

        self.assertEqual(len(response["recommendations"]), 1)
        self.assertEqual(response["recommendations"][0]["name"], "Far Enough For Twenty Km Radius")
        self.assertAlmostEqual(response["search_radius_km"], 20.0)

        session.close()

    def test_explicit_context_override_is_used_for_scoring(self) -> None:
        session = self.SessionLocal()
        session.add(
            self._create_activity(
                name="Lunch Spot",
                latitude=41.004,
                longitude=21.0,
            )
        )
        session.commit()

        with patch("app.services.recommendation.infer_context", return_value="breakfast"), patch(
            "app.services.recommendation.is_open", return_value=True
        ):
            response = build_ranked_recommendations(session, 41.0, 21.0, context="lunch")

        self.assertEqual(len(response["recommendations"]), 1)
        self.assertEqual(response["recommendations"][0]["context"], "lunch")
        self.assertEqual(response["recommendations"][0]["category_relevance"], 1.0)

        session.close()


if __name__ == "__main__":
    unittest.main()