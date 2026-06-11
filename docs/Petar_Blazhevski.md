# Weekly Progress Report

**Name:** Petar Blazhevski

## Week 2

- Made connection with database and checked if it worked.
  *Established the initial database connection by configuring the SQLAlchemy engine and session factory with the appropriate connection string. Performed connectivity verification by executing test queries and confirming successful read/write operations, ensuring the data layer was operational before any models or routes were built on top of it.*
  - **AI Tools Utilized:** Conversational chatbots were used to determine the optimal database configuration and connection-pooling strategy, while GitHub Copilot assisted with writing the connection setup and verification code.

## Week 3

- Converted working hours into JSON format.
  *Developed a data-transformation module that parses raw working-hours data from the source dataset and converts it into a structured JSON format suitable for database storage and API responses. This normalization step ensures consistent representation of operating schedules across all activity records.*
  - **AI Tools Utilized:** Chatbots were leveraged to design the JSON schema for working-hours representation, while GitHub Copilot was utilized to implement the parsing and conversion logic.

## Week 4

- Made POST and PUT routes for users.
  *Implemented POST and PUT endpoints within the FastAPI application for the users resource. The POST route handles new user registration by validating payloads and inserting records into the database, while the PUT route supports updating existing user profiles with partial data, ensuring proper field-level validation and conflict handling.*
  - **AI Tools Utilized:** Conversational chatbots were used to define the request schemas and validation constraints, while GitHub Copilot assisted with the endpoint implementation and ORM integration.

## Week 5

- Implemented scoring system structure and category relevance.
  *Designed and built the core scoring-system framework that evaluates and ranks activities based on multiple weighted criteria. Implemented category-relevance scoring that assesses how well each activity's category aligns with the user's stated preferences, producing a normalized relevance score that feeds into the overall recommendation ranking.*
  - **AI Tools Utilized:** Chatbots were leveraged to define the scoring algorithm's weight distribution and relevance metrics, while GitHub Copilot was utilized to implement the scoring functions and integrate them into the recommendation pipeline.

## Week 6

- Added limit and offset parameters in recommendation, and implemented pagination and infinite scroll.
  *Extended the recommendation API endpoints to accept `limit` and `offset` query parameters, enabling server-side pagination of recommendation results. On the front end, implemented an infinite-scroll mechanism that automatically fetches the next page of results as the user scrolls, providing a seamless and performant browsing experience for large result sets.*
  - **AI Tools Utilized:** Conversational chatbots were used to plan the pagination strategy and infinite-scroll trigger logic, while the front-end infinite-scroll components were generated and implemented using Lovable.

## Week 7

- Wrote the User Manual which explains how someone uses the application and the API Documentation which describes every backend route in detail.
  *Authored two major documentation deliverables: a comprehensive User Manual that walks end-users through the application's features, navigation, and common workflows with step-by-step instructions; and a detailed API Documentation section that catalogs every backend route, including HTTP methods, required parameters, response schemas, and example payloads.*
  - **AI Tools Utilized:** Conversational chatbots were used to structure the documentation outline and ensure complete endpoint coverage, while GitHub Copilot assisted with drafting and formatting the Markdown content.
