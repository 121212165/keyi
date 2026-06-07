"""Vercel serverless function entry point for FastAPI backend."""

import sys
import os

# Add backend/ to Python path so `from app.main import app` resolves correctly.
sys.path.insert(0, os.path.join(os.path.dirname(__file__), "..", "backend"))

from app.main import app  # noqa: E402, F401
