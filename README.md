# Hubby eSIM - Database & Activities Pipeline

This repository contains the backend services and data processing scripts for the Hubby eSIM project.

## Getting Started

### 1. Prerequisites

- **Python 3.11+**
- **Docker & Docker Compose**
- **pip** (or `uv` if preferred)

### 2. Setup Environment

1. Clone the repository.
2. Create a virtual environment:
   ```powershell
   python -m venv .venv
   .\.venv\Scripts\Activate.ps1
   ```
3. Install dependencies:
   ```powershell
   uv sync
   # Or using pip
   pip install .
   ```
4. Configure environment variables:
   - Copy `.env.example` to `.env`.
   - The default settings are configured to work with the provided Docker setup.

### 3. Start the Database

Use Docker Compose to start the PostgreSQL instance:

```powershell
docker-compose up -d
```

### 4. Initialize and Populate Data

#### Full Pipeline
To perform a complete setup (schema creation + data population), run the orchestrator from the root directory:

```powershell
python orchestrator.py
```

#### Schema Only (No Dummy Data)
If you want to create the database tables **without** filling them with dummy users and activities, you can run the creation script separately:

```powershell
# From the root directory
$env:PYTHONPATH = "."; python scripts/create-tables.py
```

**The orchestrator pipeline executes:**

1. **Table Creation**: `create-tables.py` - Initializes the database schema.
2. **Data Cleaning**: `preprocess_activities_tsv.py` - Cleans raw TSV data.
3. **Activities & Hours**: `insert_activities.py` - Inserts activities and handles working hours.
4. **User Management**: `generate_dummy_users.py` - Generates and inserts mock users.

## Troubleshooting

If you move scripts into the `scripts/` directory and encounter `ModuleNotFoundError: No module named 'app'`, ensure you run them via the `orchestrator.py` or manually set the `PYTHONPATH`:

```powershell
$env:PYTHONPATH = "."; python scripts/your_script.py
```

## Project Structure

- `app/`: Core application logic, models, and database configuration.
- `scripts/`: Data processing and utility scripts.
- `data/`: Raw data files (TSV).
- `orchestrator.py`: Master pipeline script.
