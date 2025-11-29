#!/bin/bash

echo "========================================"
echo "AI API Key Setup Script"
echo "========================================"
echo ""

# Set the API key as environment variable for current session
export AI_API_KEY=AIzaSyB3XDsEqilYW6BefX4SzOWYgC_dKyputmk

echo "✅ AI_API_KEY environment variable set for this session"
echo ""
echo "To make this permanent, you can:"
echo "1. Create a .env file in the backend folder with:"
echo "   AI_API_KEY=AIzaSyB3XDsEqilYW6BefX4SzOWYgC_dKyputmk"
echo ""
echo "2. Or set it in Railway dashboard (for production)"
echo ""
echo "Current value: $AI_API_KEY"
echo ""
echo "You can now start your backend server!"
echo ""

