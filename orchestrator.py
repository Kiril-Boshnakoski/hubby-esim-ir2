import subprocess
import sys
import os

def run_script(script_name):
    """Runs a python script using subprocess and handles errors."""
    print(f"--- Starting: {script_name} ---")
    
    # Use the absolute path if necessary, assuming scripts are in the 'scripts' directory
    script_path = os.path.join("scripts", script_name)
    
    if not os.path.exists(script_path):
        # Fallback to root directory if not in scripts/
        script_path = script_name
        if not os.path.exists(script_path):
            print(f"Error: Script '{script_name}' not found in root or scripts/.")
            sys.exit(1)

    try:
        # Set PYTHONPATH to the root directory so scripts can find the 'app' module
        env = os.environ.copy()
        env["PYTHONPATH"] = os.getcwd()
        
        result = subprocess.run([sys.executable, script_path], check=True, env=env)
        print(f"--- Finished: {script_name} successfully ---\n")
    except subprocess.CalledProcessError:
        print(f"CRITICAL ERROR: {script_name} failed.")
        sys.exit(1)
    except Exception as e:
        print(f"An unexpected error occurred while running {script_name}: {e}")
        sys.exit(1)

def main():
    # Sequence of scripts to execute
    pipeline = [
        ("create-tables.py"),             # Table Creation
        ("preprocess_activities_tsv.py"),  # Data Cleaning
        ("insert_activities.py"),          # Includes Activities Insertion & Convert Hours
        ("generate_dummy_users.py"),       # User Generation & Insertion
    ]

    print("=== Database Preparation Orchestrator Started ===\n")

    for script in pipeline:
        run_script(script)

    print("=== Database Preparation Completed Successfully ===")

if __name__ == "__main__":
    main()
