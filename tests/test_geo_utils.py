import unittest

from app.utils.geo_utils import EARTH_RADIUS_KM, haversine


class HaversineTests(unittest.TestCase):
    def test_same_point_returns_zero(self) -> None:
        self.assertAlmostEqual(haversine(41.9981, 21.4254, 41.9981, 21.4254), 0.0, places=9)

    def test_quarter_earth_circumference(self) -> None:
        expected = (3.141592653589793 * EARTH_RADIUS_KM) / 2
        self.assertAlmostEqual(haversine(0.0, 0.0, 0.0, 90.0), expected, places=6)

    def test_london_to_new_york(self) -> None:
        distance = haversine(51.5074, -0.1278, 40.7128, -74.0060)
        self.assertAlmostEqual(distance, 5570.0, delta=20.0)


if __name__ == "__main__":
    unittest.main()