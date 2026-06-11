# Weekly Progress Report

**Name:** Maksim Krstev

## Week 2

- Worked on auditmixin.
  *Developed the `AuditMixin` class, a reusable mixin that automatically tracks record-level metadata—such as `created_at` and `updated_at` timestamps—across all ORM models. By inheriting from this mixin, every database table gains consistent audit fields without duplicating column definitions, improving traceability and data governance.*
  - **AI Tools Utilized:** Conversational chatbots were used to research mixin design patterns and determine the optimal audit-field set, while GitHub Copilot assisted with implementing the mixin class and integrating it into the model hierarchy.

## Week 3

- Created `preprocess_activities_tsv.py`
- Cleaned data
- Tweaked missing values and preprocessing logic
  *Authored the `preprocess_activities_tsv.py` script, which reads raw activity data from TSV source files and transforms it into a clean, database-ready format. Performed data-cleaning operations including trimming whitespace, normalizing encodings, and handling null or malformed fields. Refined the preprocessing logic to intelligently impute missing values and apply consistent type conversions, ensuring high data quality for downstream consumption.*
  - **AI Tools Utilized:** Chatbots were leveraged to design the data-cleaning pipeline and determine appropriate strategies for handling missing values, while GitHub Copilot was utilized to implement the parsing, cleaning, and transformation code.

## Week 4

- Tested implemented features

## Week 5

- Contributed to the functions used in the recommendation system.
  *Developed and refined several core utility functions within the recommendation engine, including helper methods for score normalization, distance weighting, and result aggregation. These functions serve as shared building blocks consumed by the recommendation endpoints, ensuring consistent scoring behavior across different recommendation contexts.*
  - **AI Tools Utilized:** Conversational chatbots were used to define the mathematical foundations for scoring and normalization, while GitHub Copilot assisted with coding the utility functions and writing unit-level validation checks.

## Week 6

- Implemented the map using Leaflet.js
- Implemented the logic for filtering recommendations based on category
- Added marker clustering for better performance
  *Integrated an interactive map into the front-end application using the Leaflet.js library, displaying activity locations as clickable markers on a geographic tile layer. Implemented client-side category filtering that allows users to toggle recommendation visibility by activity type. Added marker clustering via a Leaflet plugin to group nearby markers at lower zoom levels, significantly improving rendering performance and visual clarity when displaying large numbers of activities.*
  - **AI Tools Utilized:** Conversational chatbots were used to plan the map integration architecture and clustering strategy, while the front-end map components and filtering logic were generated and implemented using Lovable.

## Week 7

- Wrote three sections that explain the recommendation system in detail, defined key terms, and listed all important project files.
  *Authored three in-depth documentation sections covering the recommendation system's internal architecture, algorithmic workflow, and scoring methodology. Defined a glossary of key technical terms used throughout the project to ensure a shared vocabulary among readers. Additionally, compiled and annotated a comprehensive file-listing section that catalogs all important project files with brief descriptions of their purpose and relationships.*
  - **AI Tools Utilized:** Conversational chatbots were used to structure the documentation outline and ensure accurate technical descriptions, while GitHub Copilot assisted with drafting and formatting the Markdown content.
