#!/bin/bash

# Railway startup script
# This script runs database migrations before starting the server

echo "🚀 Starting Pawthos Backend on Railway..."

# Wait for database to be ready
echo "⏳ Waiting for database connection..."
sleep 3

# Run database migrations (non-blocking - server will start even if migrations fail)
echo "📊 Running database migrations..."
if alembic upgrade head 2>&1; then
    echo "✅ Migrations completed successfully"
else
    echo "⚠️  Migrations failed or skipped - server will continue"
fi

# Start the application
echo "🌐 Starting FastAPI application..."
exec uvicorn main:app --host 0.0.0.0 --port ${PORT:-8000}
