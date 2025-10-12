#!/bin/bash

# Railway startup script
# This script runs database migrations before starting the server

echo "🚀 Starting Pawthos Backend on Railway..."

# Run database migrations
echo "📊 Running database migrations..."
alembic upgrade head

# Check if migrations succeeded
if [ $? -eq 0 ]; then
    echo "✅ Migrations completed successfully"
else
    echo "⚠️  Migrations failed or skipped"
fi

# Start the application
echo "🌐 Starting FastAPI application..."
exec uvicorn main:app --host 0.0.0.0 --port ${PORT:-8000}

