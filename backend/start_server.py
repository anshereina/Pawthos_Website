#!/usr/bin/env python3
"""
Startup script for the unified backend server
Ensures the server binds to all interfaces for network access
"""

import uvicorn
from main import app

if __name__ == "__main__":
    print("Starting Pawthos Unified Backend Server...")
    print("Server will be accessible at:")
    print("  - http://localhost:8000 (local)")
    print("  - http://192.168.1.13:8000 (network)")
    print("Press Ctrl+C to stop the server")
    print("-" * 50)
    
    uvicorn.run(
        app, 
        host="0.0.0.0", 
        port=8000, 
        reload=True,
        access_log=True
    )
