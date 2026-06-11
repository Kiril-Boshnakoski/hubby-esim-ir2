# Master Weekly Progress Report

This document consolidates the weekly contributions of all team members into a single chronological view. Each week lists what was accomplished, by whom, which files or components were involved, and what AI tools were used.

---

## Week 2 — Project Setup & Data-Layer Foundation

### Kiril Boshnakoski
- **Task:** Set up the GitHub repository, created the Python virtual environment (`venv`), and installed all project dependencies.
- **Deliverable:** Initialized the project structure with a `README`, `.gitignore`, and `requirements.txt`, ensuring a reproducible development environment for the entire team.
- **AI Tools Utilized:** Conversational chatbots (such as Gemini) for planning the project structure and dependency set; GitHub Copilot for scaffolding configuration files.

### Anastasija Mitova
- **Task:** Made a script for creating database tables.
- **Deliverable:** Developed a Python script that automates the creation of database tables based on predefined schemas, streamlining initial data-layer setup and eliminating the need for manual SQL writing.
- **AI Tools Utilized:** Conversational chatbots for planning table schemas and column types; GitHub Copilot for script implementation.

### Gjoko Beshiroski
- **Task:** Created the ORM models.
- **Deliverable:** Designed and implemented the SQLAlchemy ORM models that define the core database schema (users, activities, etc.) with properly typed columns, relationships, and constraints.
- **AI Tools Utilized:** Conversational chatbots for planning the entity-relationship structure; GitHub Copilot for scaffolding model definitions.

### Nikola Stojanovski
- **Task:** Started the FastAPI application.
- **Deliverable:** Initialized the FastAPI entry point, configured the application instance, and set up the foundational routing structure upon which all subsequent endpoints were built.
- **AI Tools Utilized:** Conversational chatbots for planning application architecture; GitHub Copilot for scaffolding the FastAPI boilerplate.

### Petar Blazhevski
- **Task:** Made the database connection and verified it.
- **Deliverable:** Established the initial SQLAlchemy engine and session factory configuration, then performed connectivity verification via test queries to confirm successful read/write operations.
- **AI Tools Utilized:** Conversational chatbots for determining the optimal database configuration; GitHub Copilot for writing the connection setup and verification code.

### Maksim Krstev
- **Task:** Worked on the `AuditMixin`.
- **Deliverable:** Developed the `AuditMixin` class—a reusable mixin that automatically tracks `created_at` and `updated_at` timestamps across all ORM models, improving traceability and data governance.
- **AI Tools Utilized:** Conversational chatbots for researching mixin design patterns; GitHub Copilot for implementing the mixin class.

---

## Week 3 — Data Ingestion & Seeding

### Kiril Boshnakoski
- **Task:** Made a route that orchestrates the full data-ingestion pipeline.
- **Deliverable:** Implemented a FastAPI endpoint that invokes helper functions to process raw data, insert records into the database, and trigger `generate_dummy_users.py` to seed the users table—streamlining the entire database seeding workflow into one callable action.
- **AI Tools Utilized:** Conversational chatbots for architecting the pipeline sequence; GitHub Copilot for route implementation.

### Anastasija Mitova
- **Task:** Created `generate_dummy_users.py`.
- **File:** `generate_dummy_users.py`
- **Deliverable:** Authored a script that populates the database with synthetic user records (names, locations, preferences) via the ORM, enabling comprehensive integration testing without production data.
- **AI Tools Utilized:** Conversational chatbots for brainstorming realistic data distributions; GitHub Copilot for script implementation.

### Gjoko Beshiroski
- **Task:** Generated dummy users.
- **Deliverable:** Populated the database with synthetic user records containing realistic attributes (email, location, coordinates), enabling the team to test user-related endpoints and recommendation logic.
- **AI Tools Utilized:** Conversational chatbots for determining realistic data attributes; GitHub Copilot for the data-generation logic.

### Nikola Stojanovski
- **Task:** Main script for inserting activities.
- **Deliverable:** Developed the primary data-ingestion script that parses raw activity data from source files and batch-inserts processed records into the database, serving as the backbone of the data pipeline.
- **AI Tools Utilized:** Chatbots for designing the ingestion pipeline; GitHub Copilot for the insertion logic and error handling.

### Petar Blazhevski
- **Task:** Converted working hours into JSON format.
- **Deliverable:** Developed a data-transformation module that parses raw working-hours data and converts it into a structured JSON schema suitable for database storage and API responses, ensuring consistent schedule representation.
- **AI Tools Utilized:** Chatbots for designing the JSON schema; GitHub Copilot for parsing and conversion logic.

### Maksim Krstev
- **Task:** Created `preprocess_activities_tsv.py`, cleaned data, and tweaked missing values and preprocessing logic.
- **File:** `preprocess_activities_tsv.py`
- **Deliverable:** Authored a script that reads raw activity data from TSV source files and transforms it into a clean, database-ready format—handling whitespace trimming, encoding normalization, null imputation, and consistent type conversions.
- **AI Tools Utilized:** Chatbots for designing the data-cleaning pipeline; GitHub Copilot for parsing, cleaning, and transformation code.

---

## Week 4 — API Routes & Code Quality

### Kiril Boshnakoski
- **Task:** Helped with debugging and fixing bugs; refactored the code.
- **Deliverable:** Conducted debugging sessions across the codebase, resolving issues related to data insertion, route parameter handling, and ORM queries. Refactored modules for improved readability, reduced duplication, and consistent error-handling patterns.
- **AI Tools Utilized:** Conversational chatbots for diagnosing root causes; GitHub Copilot for applying fixes and structural improvements.

### Anastasija Mitova
- **Task:** Added a GET route in FastAPI for the "activities" table with full query parameter support.
- **Deliverable:** Developed a GET endpoint that dynamically handles comprehensive query parameters (date ranges, activity type, geographic filters), enabling complex server-side filtering and searching across the activities dataset.
- **AI Tools Utilized:** Chatbots for mapping out the route architecture and query constraints; GitHub Copilot for backend code implementation.

### Gjoko Beshiroski
- **Task:** Made the GET route for the users endpoint with required query parameters.
- **Deliverable:** Developed a GET endpoint for the users resource, supporting required query parameters for targeted retrieval. The route validates incoming parameters, queries the database through the ORM, and returns filtered user records as JSON.
- **AI Tools Utilized:** Conversational chatbots for planning the endpoint contract; GitHub Copilot for route implementation and query construction.

### Nikola Stojanovski
- **Task:** Added POST and PUT routes to the FastAPI for the activities table.
- **Deliverable:** Implemented POST and PUT endpoints enabling creation and modification of activity records. The POST route validates payloads and inserts new entries; the PUT route supports partial updates based on primary key.
- **AI Tools Utilized:** Conversational chatbots for defining request/response schemas; GitHub Copilot for route implementation.

### Petar Blazhevski
- **Task:** Made POST and PUT routes for users.
- **Deliverable:** Implemented POST (user registration with payload validation) and PUT (profile updates with field-level validation) endpoints for the users resource within FastAPI.
- **AI Tools Utilized:** Conversational chatbots for defining validation constraints; GitHub Copilot for endpoint implementation and ORM integration.

### Maksim Krstev
- **Task:** Tested implemented features.
- **Deliverable:** Performed manual and functional testing of the API endpoints and data-ingestion scripts implemented in prior weeks, verifying correct behavior and identifying issues for resolution.
- **AI Tools Utilized:** Conversational chatbots for structuring test scenarios; GitHub Copilot for drafting test scripts.

---

## Week 5 — Recommendation Engine & Geospatial Logic

### Kiril Boshnakoski
- **Task:** Added Context-Aware Logic, Category Mapping + Auto-Inference, and fixed a major bug in database entries.
- **Deliverable:** Introduced context-aware recommendation logic adjusting scores based on situational factors (e.g., time of day). Implemented a category mapping system with auto-inference for unlabeled activities. Resolved a critical database bug causing malformed or duplicate entries.
- **AI Tools Utilized:** Chatbots for designing context-awareness rules and the inference algorithm; GitHub Copilot for implementation and bug fixing.

### Anastasija Mitova
- **Task:** Validated coordinates and applied the Haversine formula; wired recommendation endpoints.
- **Deliverable:** Implemented coordinate validation and the Haversine formula for proximity-based filtering. Connected GET recommendation endpoints to a shared pipeline that validates inputs, applies radius filtering, excludes closed activities, computes scores, sorts results, and returns a unified ranked JSON response.
- **AI Tools Utilized:** Conversational chatbots for architecting the recommendation pipeline; GitHub Copilot for endpoint wiring and shared-logic implementation.

### Gjoko Beshiroski
- **Task:** Made the geospatial filtering using the Haversine formula.
- **Deliverable:** Implemented geospatial filtering logic applying the Haversine formula to compute great-circle distances, retaining only activities within the specified search radius. Built a validation layer rejecting coordinates outside legal geographic bounds (±90° lat, ±180° lon).
- **AI Tools Utilized:** Chatbots for researching Haversine implementation details; GitHub Copilot for filtering and validation code.

### Nikola Stojanovski
- **Task:** Implemented the Haversine formula for distance calculation and API endpoints for recommendations (Endpoint A, Endpoint B).
- **Deliverable:** Integrated the Haversine formula into the backend for accurate proximity-based filtering. Built two dedicated recommendation endpoints leveraging distance calculation and scoring logic to return ranked activity suggestions.
- **AI Tools Utilized:** Chatbots for researching the formula and planning the dual-endpoint architecture; GitHub Copilot for the distance functions and endpoint logic.

### Petar Blazhevski
- **Task:** Implemented the scoring system structure and category relevance.
- **Deliverable:** Designed and built the scoring framework that evaluates and ranks activities based on weighted criteria. Implemented category-relevance scoring that assesses alignment between activity categories and user preferences, producing normalized scores for the recommendation ranking.
- **AI Tools Utilized:** Chatbots for defining scoring weight distribution and relevance metrics; GitHub Copilot for scoring functions and pipeline integration.

### Maksim Krstev
- **Task:** Contributed to the functions used in the recommendation system.
- **Deliverable:** Developed core utility functions for the recommendation engine—including score normalization, distance weighting, and result aggregation—serving as shared building blocks consumed by the recommendation endpoints.
- **AI Tools Utilized:** Conversational chatbots for defining mathematical foundations; GitHub Copilot for coding utility functions.

---

## Week 6 — Front-End Development & UI Integration

### Kiril Boshnakoski
- **Task:** Added radius and context parameters, automatic expansion of search radius, and more activity entries.
- **Deliverable:** Extended the recommendation API with configurable `radius` and `context` query parameters. Implemented automatic radius-expansion when too few results are found. Enriched the activities dataset with additional entries for improved recommendation diversity.
- **AI Tools Utilized:** Conversational chatbots for planning the radius-expansion algorithm; GitHub Copilot for backend implementation and data entry scripting.

### Anastasija Mitova
- **Task:** Added a UI control for selecting the recommendation context.
- **Deliverable:** Integrated a dynamic UI control that captures the user's context selection client-side, appends it as a live query parameter to API requests, and updates recommendation rankings in real-time.
- **AI Tools Utilized:** Conversational chatbots for strategizing state management and context-switching logic; **Lovable** for front-end component generation and implementation.

### Gjoko Beshiroski
- **Task:** Made the design for the front end and connected it to the backend.
- **Deliverable:** Designed and built the complete front-end user interface, establishing the visual layout, component hierarchy, and styling. Wired API calls to the FastAPI backend, enabling live data rendering and user interaction with the recommendation system.
- **AI Tools Utilized:** Conversational chatbots for planning UI architecture and data-flow strategy; **Lovable** for front-end design and component implementation.

### Nikola Stojanovski
- **Task:** Implemented Loading State, Empty State, and Validation State.
- **Deliverable:** Developed three UI state handlers: a Loading State with visual indicators during data fetching, an Empty State with meaningful messages when no results are returned, and a Validation State that surfaces input errors before API requests are sent.
- **AI Tools Utilized:** Conversational chatbots for designing state-management flow; **Lovable** for front-end state component generation and implementation.

### Petar Blazhevski
- **Task:** Added `limit` and `offset` parameters in recommendation; implemented pagination and infinite scroll.
- **Deliverable:** Extended the recommendation API with `limit` and `offset` query parameters for server-side pagination. Implemented an infinite-scroll mechanism on the front end that automatically fetches the next page of results as the user scrolls.
- **AI Tools Utilized:** Conversational chatbots for planning the pagination strategy; **Lovable** for front-end infinite-scroll component implementation.

### Maksim Krstev
- **Task:** Implemented the interactive map using Leaflet.js, category filtering, and marker clustering.
- **Deliverable:** Integrated a Leaflet.js interactive map displaying activity locations as clickable markers. Implemented client-side category filtering for toggling recommendation visibility. Added marker clustering via a Leaflet plugin for improved rendering performance at lower zoom levels.
- **AI Tools Utilized:** Conversational chatbots for planning the map integration architecture; **Lovable** for front-end map components and filtering logic.

---

## Week 7 — Documentation & Final Integration

### Kiril Boshnakoski
- **Task:** Connected the new front-end design to the backend and made design adjustments.
- **Deliverable:** Integrated the updated front-end with the FastAPI backend by configuring API endpoints, handling CORS policies, and ensuring proper data serialization. Made targeted layout tweaks and styling refinements for improved usability.
- **AI Tools Utilized:** Conversational chatbots for troubleshooting integration issues; **Lovable** for front-end adjustments.

### Anastasija Mitova
- **Task:** Wrote three documentation sections on setup and configuration.
- **Deliverable:** Authored sections covering installation, startup procedures, and configuration details—guiding new contributors through environment setup, dependency installation, and runtime configuration.
- **AI Tools Utilized:** Conversational chatbots for outlining documentation structure; GitHub Copilot for drafting and formatting Markdown content.

### Gjoko Beshiroski
- **Task:** Updated the design of the front end.
- **Deliverable:** Refined and polished the existing front-end design with layout improvements, visual consistency fixes, and enhanced responsiveness across different screen sizes.
- **AI Tools Utilized:** Conversational chatbots for identifying improvement areas; **Lovable** for implementing front-end updates.

### Nikola Stojanovski
- **Task:** Wrote the first four sections of the technical documentation.
- **Deliverable:** Authored sections covering the project overview, motivation and objectives, system architecture summary, and prerequisites—providing readers with a comprehensive introduction to the project's purpose and technical stack.
- **AI Tools Utilized:** Conversational chatbots for structuring the documentation outline; GitHub Copilot for drafting and formatting Markdown content.

### Petar Blazhevski
- **Task:** Wrote the User Manual and the API Documentation.
- **Deliverable:** Authored two major documentation deliverables: a User Manual with step-by-step feature walkthroughs, and a detailed API Documentation section cataloging every backend route with HTTP methods, parameters, response schemas, and example payloads.
- **AI Tools Utilized:** Conversational chatbots for structuring the outline and ensuring endpoint coverage; GitHub Copilot for drafting and formatting Markdown content.

### Maksim Krstev
- **Task:** Wrote three sections on the recommendation system, defined key terms, and listed all important project files.
- **Deliverable:** Authored in-depth documentation covering the recommendation system's architecture, algorithmic workflow, and scoring methodology. Defined a glossary of key technical terms and compiled an annotated file listing of all important project files.
- **AI Tools Utilized:** Conversational chatbots for structuring the documentation outline; GitHub Copilot for drafting and formatting Markdown content.
