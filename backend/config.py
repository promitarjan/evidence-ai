import os
from pathlib import Path
from dotenv import load_dotenv

# Look for .env in backend directory first, then root directory
backend_dir = Path(__file__).resolve().parent
root_dir = backend_dir.parent

if (backend_dir / ".env").exists():
    load_dotenv(backend_dir / ".env")
elif (root_dir / ".env").exists():
    load_dotenv(root_dir / ".env")
else:
    load_dotenv()

GEMINI_API_KEY = os.getenv("GEMINI_API_KEY", "")
OPENALEX_MAILTO = os.getenv("OPENALEX_MAILTO", "evidenceai-hackathon@example.com")
