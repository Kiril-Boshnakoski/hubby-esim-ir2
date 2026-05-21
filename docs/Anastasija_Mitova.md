# Weekly Progress Report

**Name:** Anastasija Mitova

## Week 2
- Made a script for creating tables

## Week 3
- Created `generate_dummy_users.py`

## Week 4
- Added a GET route in FastAPI for the “activities” table that supports all query parameters for filtering/searching

## Week 5
- Validated coordinates, then use Haversine to calculate distances and return only activities within a given radius.
- Wired GET recommendation endpoints and shared logic that validates coordinates, filters by radius, filters open activities, scores them, sorts results, and returns a unified ranked JSON response.
