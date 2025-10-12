"""
Vercel serverless function entry point.
This file exports the FastAPI app for Vercel deployment.
"""
import sys
from pathlib import Path

# Add the backend directory to Python path
backend_dir = Path(__file__).parent.parent
sys.path.insert(0, str(backend_dir))

from main import app

# Vercel looks for a variable named 'app' or 'handler'
handler = app

