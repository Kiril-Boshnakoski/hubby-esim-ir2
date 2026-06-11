# Weekly Progress Report

**Name:** Gjoko Beshiroski

## Week 2

- Created models.
  *Designed and implemented the SQLAlchemy ORM models that define the core database schema for the application. Each model maps to a database table—including users and activities—with properly typed columns, relationships, and constraints, establishing the foundational data layer for all subsequent API development.*
  - **AI Tools Utilized:** Conversational chatbots were used to plan the entity-relationship structure and determine field types, while GitHub Copilot assisted with scaffolding the model definitions.

## Week 3

- Generated dummy users.
  *Populated the database with a set of synthetic user records to support development and integration testing. The dummy data includes realistic attributes such as names, email addresses, and location coordinates, enabling the team to test user-related endpoints and recommendation logic without relying on production data.*
  - **AI Tools Utilized:** Chatbots were leveraged to determine realistic data distributions and required user attributes, while GitHub Copilot was utilized to implement the data-generation logic.

## Week 4

- Made the get route for the users endpoint with required query parameters.
  *Developed a GET endpoint within the FastAPI application for the users resource, supporting required query parameters for targeted retrieval. The route validates incoming parameters, queries the database through the ORM, and returns filtered user records as a structured JSON response.*
  - **AI Tools Utilized:** Conversational chatbots were used to plan the endpoint contract and parameter validation rules, while GitHub Copilot assisted with the route implementation and query construction.

## Week 5

- Made the geospecial filtering using the Haversine formula to keep only activities within the search radius, and validate that any incoming coordinates are within legal geographic bounds before processing.
  *Implemented geospatial filtering logic that applies the Haversine formula to calculate great-circle distances between the user's position and each activity's coordinates, retaining only those within the specified search radius. Additionally, built a validation layer that rejects coordinates outside legal geographic bounds (±90° latitude, ±180° longitude), ensuring data integrity before any distance computation is performed.*
  - **AI Tools Utilized:** Chatbots were leveraged to research the Haversine formula implementation details and coordinate validation edge cases, while GitHub Copilot was utilized to write the filtering and validation code.

## Week 6

- Made the design for the front end and connected it to the backend. (Used Lovable)
  *Designed and built the complete front-end user interface for the application, establishing the visual layout, component hierarchy, and styling. Connected the front-end to the FastAPI backend by wiring API calls to the appropriate endpoints, enabling live data rendering and user interaction with the recommendation system.*
  - **AI Tools Utilized:** Conversational chatbots were used to plan the UI architecture and data-flow strategy, while the front-end design and component implementation were generated and built using Lovable.

## Week 7

- Updated the design of the front end.
  *Refined and polished the existing front-end design based on usability feedback and testing observations. Adjustments included layout improvements, visual consistency fixes, and enhanced responsiveness to ensure a seamless user experience across different screen sizes.*
  - **AI Tools Utilized:** Conversational chatbots were used to identify design improvement areas and prioritize changes, while the front-end updates were implemented using Lovable.
