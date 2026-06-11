# Weekly Progress Report

**Name:** Nikola Stojanovski

## Week 2

- Started the FastAPI.
  *Initialized the FastAPI application by creating the main entry point, configuring the application instance, and setting up the foundational routing structure. This established the core backend framework upon which all subsequent API endpoints and middleware were built.*
  - **AI Tools Utilized:** Conversational chatbots were used to plan the application architecture and determine the optimal project layout, while GitHub Copilot assisted with scaffolding the initial FastAPI boilerplate.

## Week 3

- Main script for inserting activities.
  *Developed the primary data-ingestion script responsible for parsing raw activity data from source files and inserting the processed records into the database. The script handles data transformation, type casting, and batch insertion, serving as the backbone of the project's data pipeline.*
  - **AI Tools Utilized:** Chatbots were leveraged to design the ingestion pipeline and handle edge cases in data parsing, while GitHub Copilot was utilized to implement the insertion logic and error handling.

## Week 4

- Added POST and PUT routes to the FastAPI for the activities table.
  *Implemented POST and PUT endpoints within the FastAPI application for the activities resource, enabling creation and modification of activity records. The POST route validates incoming payloads and inserts new entries, while the PUT route supports partial updates to existing records based on their primary key.*
  - **AI Tools Utilized:** Conversational chatbots were used to define the request/response schemas and validation rules, while GitHub Copilot assisted with the route implementation and database transaction handling.

## Week 5

- Implemented the Haversine formula for distance calculation and API Endpoints for recommendations (Endpoint A, Endpoint B).
  *Integrated the Haversine formula into the backend to compute accurate great-circle distances between geographic coordinates, enabling proximity-based activity filtering. Built two dedicated recommendation API endpoints (Endpoint A and Endpoint B) that leverage this distance calculation alongside scoring logic to return ranked activity suggestions to the client.*
  - **AI Tools Utilized:** Chatbots were leveraged to research the Haversine formula's mathematical implementation and plan the dual-endpoint architecture, while GitHub Copilot was utilized to write the distance-calculation functions and endpoint logic.

## Week 6

- Implemented Loading State, Empty State, and Validation State.
  *Developed three distinct UI state handlers to improve the front-end user experience: a Loading State that displays a visual indicator while data is being fetched, an Empty State that presents a meaningful message when no results are returned, and a Validation State that surfaces input errors to the user before requests are sent to the API.*
  - **AI Tools Utilized:** Conversational chatbots were used to design the state-management flow and user-feedback patterns, while the front-end state components were generated and implemented using Lovable.

## Week 7

- Wrote the first four sections of the technical documentation. These sections introduce the project to any reader and tell them what it is, why it exists, and what they need before running it.
  *Authored the opening four sections of the project's technical documentation, covering the project overview, motivation and objectives, system architecture summary, and prerequisites. These sections provide any new reader with a comprehensive understanding of the project's purpose, technical stack, and the requirements needed to set up a local development environment.*
  - **AI Tools Utilized:** Conversational chatbots were used to structure the documentation outline and ensure logical flow between sections, while GitHub Copilot assisted with drafting and formatting the Markdown content.
