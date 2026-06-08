# Hubby eSIM - Database Schema Documentation

This document describes the database schema, lists all tables and their columns, and explains their relationships for the **Hubby eSIM - Local Vibe Finder** application.

---

## 1. Database Schema Diagram

The database consists of two main tables: `users` and `activities`. They do not share a static physical foreign key constraint, as relationships are resolved dynamically based on spatial coordinates and temporal/contextual recommendation criteria.

```mermaid
erDiagram
    users {
        integer id PK "Primary Key"
        varchar email UK "Unique, Indexed"
        varchar name "Not Null"
        varchar surname "Not Null"
        varchar destination "Nullable"
        timestamp timestamp "Not Null, Default: UTC Now"
        float latitude "Nullable"
        float longitude "Nullable"
        timestamp created_at "Audit, Not Null"
        timestamp updated_at "Audit, Not Null"
        timestamp deleted_at "Audit, Nullable"
    }

    activities {
        integer id PK "Primary Key"
        varchar name "Indexed, Not Null"
        varchar type "Indexed, Default: 'other'"
        varchar phone_number "Nullable"
        float latitude "Indexed, Not Null"
        float longitude "Indexed, Not Null"
        float rating "Nullable"
        integer user_rating_count "Not Null, Default: 0"
        json monday_working_hours "Nullable"
        json tuesday_working_hours "Nullable"
        json wednesday_working_hours "Nullable"
        json thursday_working_hours "Nullable"
        json friday_working_hours "Nullable"
        json saturday_working_hours "Nullable"
        json sunday_working_hours "Nullable"
        timestamp created_at "Audit, Not Null"
        timestamp updated_at "Audit, Not Null"
        timestamp deleted_at "Audit, Nullable"
    }

    users ..o{ activities : "dynamically matched via spatial proximity"}
```

### Explanation of the Diagram and Relations

- **Decoupled Tables**: The `users` and `activities` tables are physically decoupled. Proximity, relevance, and ranking are computed dynamically.
- **Spatial Relationship**: When a user requests recommendations, their current coordinate pair (`latitude`, `longitude`) is matched against all activities' coordinate pairs to calculate distances using the Haversine formula.
- **Temporal Matching**: The current query time is matched against the specific day's JSON working hours (e.g., `monday_working_hours`) in the `activities` table to determine if the activity is open.
- **Contextual Matching**: The recommendation engine uses categories (e.g., matching a user's inferred breakfast, lunch, or dinner context with the activity `type`).

---

## 2. Table Explanations & Column Details

### A. Users Table (`users`)

- **Description**: Stores profile details and coordinates of registered users. The current latitude and longitude values are used to dynamically filter and rank nearby activities.
- **Source File**: [user.py](file:///c:/Users/kiril/Documents/hubby-esim-ir2/app/models/user.py)

| Column Name   | Database Type              | Constraints / Defaults                                                     | Description                                                                        |
| :------------ | :------------------------- | :------------------------------------------------------------------------- | :--------------------------------------------------------------------------------- |
| `id`          | `INTEGER`                  | `PRIMARY KEY`, `INDEX`                                                     | Unique auto-incrementing identifier for the user.                                  |
| `email`       | `VARCHAR(255)`             | `UNIQUE`, `INDEX`, `NOT NULL`                                              | The user's unique email address.                                                   |
| `name`        | `VARCHAR(255)`             | `NOT NULL`                                                                 | The user's first name.                                                             |
| `surname`     | `VARCHAR(255)`             | `NOT NULL`                                                                 | The user's last name/surname.                                                      |
| `destination` | `VARCHAR(500)`             | `NULL`                                                                     | Inbound destination context for the user (e.g. city or country they are visiting). |
| `timestamp`   | `TIMESTAMP WITH TIME ZONE` | `NOT NULL`, `DEFAULT: UTC Now`                                             | Account creation or activation date/time.                                          |
| `latitude`    | `FLOAT`                    | `NULL`                                                                     | Last known latitude of the user (e.g., `41.9981`).                                 |
| `longitude`   | `FLOAT`                    | `NULL`                                                                     | Last known longitude of the user (e.g., `21.4254`).                                |
| `created_at`  | `TIMESTAMP WITH TIME ZONE` | `NOT NULL`, `DEFAULT: server_default=func.now()`                           | Audit timestamp indicating when the user record was first inserted.                |
| `updated_at`  | `TIMESTAMP WITH TIME ZONE` | `NOT NULL`, `DEFAULT: server_default=func.now()`, updates on modifications | Audit timestamp indicating when the user record was last modified.                 |
| `deleted_at`  | `TIMESTAMP WITH TIME ZONE` | `NULL`                                                                     | Audit timestamp used for soft-deleting user records without removing them.         |

---

### B. Activities Table (`activities`)

- **Description**: Stores tourist sights, dining places, hotels, cafes, and other recommended local activities. Contains coordinates, ratings (popularity indices), and schedules for open/closed verification.
- **Source File**: [activity.py](file:///c:/Users/kiril/Documents/hubby-esim-ir2/app/models/activity.py)

| Column Name               | Database Type              | Constraints / Defaults                                                     | Description                                                                        |
| :------------------------ | :------------------------- | :------------------------------------------------------------------------- | :--------------------------------------------------------------------------------- |
| `id`                      | `INTEGER`                  | `PRIMARY KEY`, `INDEX`                                                     | Unique identifier for the activity.                                                |
| `name`                    | `VARCHAR(255)`             | `INDEX`, `NOT NULL`                                                        | The name of the local place/activity.                                              |
| `type`                    | `VARCHAR(100)`             | `INDEX`, `DEFAULT: 'other'`                                                | Categorization tag (e.g., `'restaurant'`, `'cafe'`, `'museum'`).                   |
| `phone_number`            | `VARCHAR(50)`              | `NULL`                                                                     | Contact phone number.                                                              |
| `latitude`                | `FLOAT`                    | `INDEX`, `NOT NULL`                                                        | The latitude coordinate of the activity.                                           |
| `longitude`               | `FLOAT`                    | `INDEX`, `NOT NULL`                                                        | The longitude coordinate of the activity.                                          |
| `rating`                  | `FLOAT`                    | `NULL`                                                                     | Average rating scored from Google Maps/ratings (0.0 to 5.0).                       |
| `user_rating_count`       | `INTEGER`                  | `NOT NULL`, `DEFAULT: 0`                                                   | Total number of rating submissions (used for popularity/weighting scoring).        |
| `monday_working_hours`    | `JSON`                     | `NULL`                                                                     | Opening/closing intervals on Monday. E.g., `[{"open": "08:00", "close": "22:00"}]` |
| `tuesday_working_hours`   | `JSON`                     | `NULL`                                                                     | Opening/closing intervals on Tuesday.                                              |
| `wednesday_working_hours` | `JSON`                     | `NULL`                                                                     | Opening/closing intervals on Wednesday.                                            |
| `thursday_working_hours`  | `JSON`                     | `NULL`                                                                     | Opening/closing intervals on Thursday.                                             |
| `friday_working_hours`    | `JSON`                     | `NULL`                                                                     | Opening/closing intervals on Friday.                                               |
| `saturday_working_hours`  | `JSON`                     | `NULL`                                                                     | Opening/closing intervals on Saturday.                                             |
| `sunday_working_hours`    | `JSON`                     | `NULL`                                                                     | Opening/closing intervals on Sunday.                                               |
| `created_at`              | `TIMESTAMP WITH TIME ZONE` | `NOT NULL`, `DEFAULT: server_default=func.now()`                           | Audit timestamp indicating when the activity was added.                            |
| `updated_at`              | `TIMESTAMP WITH TIME ZONE` | `NOT NULL`, `DEFAULT: server_default=func.now()`, updates on modifications | Audit timestamp indicating when the activity was last modified.                    |
| `deleted_at`              | `TIMESTAMP WITH TIME ZONE` | `NULL`                                                                     | Audit timestamp used for soft-deleting activity records.                           |
