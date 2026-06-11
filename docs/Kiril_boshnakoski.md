# Weekly Progress Report

**Name:** Kiril Boshnakoski

## Week 2

- Set up GitHub repository, created venv folder and added dependencies.
  *Initialized the project's GitHub repository with a proper directory structure, README, and `.gitignore` configuration. Created a Python virtual environment (`venv`) and installed all required dependencies, documenting them in a `requirements.txt` file to ensure reproducible builds across the team.*
  - **AI Tools Utilized:** Conversational chatbots (such as Gemini) were used to determine the optimal project structure and dependency set, while GitHub Copilot assisted with scaffolding the initial configuration files.

## Week 3

- Made a path that calls the helper functions that process the raw data, enter it into the database, and calls the generate dummy users file and adds it to the database.
  *Implemented a FastAPI route that orchestrates the full data-ingestion pipeline: invoking helper functions to parse and transform raw activity data, inserting the cleaned records into the database, and triggering the `generate_dummy_users.py` script to populate the users table. This single endpoint streamlines the entire database seeding workflow into one callable action.*
  - **AI Tools Utilized:** Conversational chatbots were used to architect the pipeline sequence and error-handling strategy, while GitHub Copilot was utilized to implement the route and integrate the helper function calls.

## Week 4

- Helped with debugging and fixing bugs and refactored the code.
  *Conducted a thorough debugging session across the existing codebase, identifying and resolving issues related to data insertion, route parameter handling, and ORM query construction. Additionally, refactored several modules to improve code readability, reduce duplication, and establish consistent error-handling patterns across the API layer.*
  - **AI Tools Utilized:** Conversational chatbots were used to diagnose root causes of reported bugs and suggest refactoring strategies, while GitHub Copilot assisted with applying the code fixes and structural improvements.

## Week 5

- Added Context-Aware Logic, Category Mapping + Auto-Inference, and fixed major bug in database entries.
  *Introduced context-aware recommendation logic that adjusts activity scoring based on the user's current situation (e.g., time of day, weather conditions). Implemented a category mapping system with auto-inference capabilities that automatically assigns categories to activities lacking explicit labels. Additionally, identified and resolved a critical bug in the database insertion pipeline that was causing malformed or duplicate activity entries.*
  - **AI Tools Utilized:** Chatbots were leveraged to design the context-awareness rules and category inference algorithm, while GitHub Copilot was utilized to implement the logic and fix the database bug.

## Week 6

- Added radius and context parameters, added automatic expansion of search radius, and added more activity entries.
  *Extended the recommendation API to accept radius and context as configurable query parameters, giving users fine-grained control over their search scope and ranking criteria. Implemented an automatic radius-expansion mechanism that progressively widens the search area when too few results are found within the initial range. Also enriched the activities dataset by inserting additional entries to improve recommendation diversity and coverage.*
  - **AI Tools Utilized:** Conversational chatbots were used to plan the radius-expansion algorithm and parameter design, while GitHub Copilot assisted with the backend implementation and data entry scripting.

## Week 7

- Worked on connecting the new front-end design to the backend and made some adjustments to the design.
  *Integrated the updated front-end interface with the existing FastAPI backend by configuring API call endpoints, handling CORS policies, and ensuring proper data serialization between client and server. Made targeted design adjustments—including layout tweaks and component styling refinements—to align the front-end with the backend's response structure and improve overall usability.*
  - **AI Tools Utilized:** Conversational chatbots were used to troubleshoot integration issues and plan the data-binding approach, while the front-end adjustments were implemented using Lovable.
