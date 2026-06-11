# Weekly Progress Report

**Name:** Anastasija Mitova

## Week 2

- Made a script for creating tables
  *Developed a Python script that automates the creation of database tables based on predefined schemas, streamlining the initial data-layer setup. The script programmatically defines table structures and executes the corresponding SQL statements, eliminating the need for manual schema definition and ensuring consistency across development environments.*
  - **AI Tools Utilized:** Conversational chatbots were used to plan the table schemas and determine the optimal column types and constraints, while GitHub Copilot assisted with generating the script implementation.

## Week 3

- Created `generate_dummy_users.py`
  *Authored the `generate_dummy_users.py` script, which populates the database with synthetic user records for development and testing purposes. The script generates realistic user attributes—such as names, locations, and preferences—and inserts them via the ORM, enabling comprehensive integration testing of user-facing features without requiring production data.*
  - **AI Tools Utilized:** Chatbots were leveraged to brainstorm realistic dummy-data distributions and field requirements, while GitHub Copilot was utilized to accelerate the script's code implementation.

## Week 4

- Added a GET route in FastAPI for the "activities" table that supports all query parameters for filtering/searching
  *Developed a dedicated GET endpoint within the FastAPI application to interface with the "activities" database table. This implementation dynamically handles comprehensive query parameters—including date ranges, activity type, and geographic filters—enabling users to perform complex server-side filtering and searching across the dataset efficiently.*
  - **AI Tools Utilized:** Chatbots were leveraged during the planning phase to map out the route architecture and query constraints, while GitHub Copilot was utilized to accelerate the backend code implementation.

## Week 5

- Validated coordinates, then use Haversine to calculate distances and return only activities within a given radius.
  *Implemented robust coordinate validation logic that checks incoming latitude and longitude values against legal geographic bounds before processing. Applied the Haversine formula to compute great-circle distances between the user's location and each activity, filtering results to return only those within a configurable search radius.*
- Wired GET recommendation endpoints and shared logic that validates coordinates, filters by radius, filters open activities, scores them, sorts results, and returns a unified ranked JSON response.
  *Connected the GET recommendation endpoints to a shared processing pipeline that orchestrates the full recommendation flow: validating geographic inputs, applying radius-based filtering, excluding closed activities, computing relevance scores, sorting by rank, and returning a unified JSON response to the client.*
  - **AI Tools Utilized:** Conversational chatbots were used to architect the recommendation pipeline and define the scoring criteria, while GitHub Copilot assisted with the endpoint wiring and shared-logic implementation.

## Week 6

- Added a UI control that lets the user select the recommendation context. When a context is selected, it is passed as a query parameter to the API and changes the ranking of recommendations.
  *Integrated a dynamic user interface control that allows users to seamlessly select and switch their recommendation context. This selection is captured client-side and appended as a live query parameter to the API request, directly altering the backend ranking weights and updating the displayed results in real-time.*
  - **AI Tools Utilized:** Conversational chatbots were used to strategize the state management and context-switching logic, while the front-end components and layout were generated and implemented using Lovable.

## Week 7

- Wrote three sections that explain how to get the project running and how it is configured.
  *Authored three dedicated sections of the project's technical documentation covering installation, startup procedures, and configuration details. These sections guide new contributors through environment setup, dependency installation, and runtime configuration, ensuring a smooth onboarding experience.*
  - **AI Tools Utilized:** Conversational chatbots were used to outline the documentation structure and ensure comprehensive coverage of setup steps, while GitHub Copilot assisted with drafting and formatting the Markdown content.
