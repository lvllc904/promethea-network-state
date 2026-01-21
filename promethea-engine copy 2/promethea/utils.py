import os
from pathlib import Path
from dotenv import load_dotenv

def get_project_root() -> Path:
    """
    Returns the Path object corresponding to the project root directory.
    This is determined by searching up the directory tree for a known root file (e.g., ROADMAP.md).
    """
    current_dir = Path(__file__).parent.resolve()
    
    # Define marker files that exist only in the project root
    marker_files = ["ROADMAP.md", ".gitignore", "pyproject.toml"] 
    
    for parent in [current_dir] + list(current_dir.parents):
        if any((parent / marker).exists() for marker in marker_files):
            return parent
    
    # This fallback is less ideal but can work in some structures. The marker search is preferred.
    raise FileNotFoundError("Could not find the project root. Make sure a marker file like 'pyproject.toml' exists.")

def load_project_env():
    """
    Loads environment variables from the .env file located at the project root.
    """
    root = get_project_root()
    load_dotenv(dotenv_path=root / '.env')