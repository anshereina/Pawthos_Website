#!/bin/bash

# Railway startup script
echo "🚀 Starting Pawthos Backend on Railway..."
echo "🌐 Starting FastAPI application..."
exec uvicorn main:app --host 0.0.0.0 --port ${PORT:-8000}
