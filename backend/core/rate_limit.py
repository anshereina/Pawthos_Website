from fastapi import Request, HTTPException, status
from starlette.middleware.base import BaseHTTPMiddleware
from starlette.responses import Response
from collections import defaultdict
from datetime import datetime, timedelta
from typing import Dict, Tuple
import time

class RateLimitMiddleware(BaseHTTPMiddleware):
    """
    Rate limiting middleware to prevent abuse.
    Uses sliding window algorithm per IP address.
    """
    
    def __init__(self, app, requests_per_minute: int = 60, requests_per_hour: int = 300):
        super().__init__(app)
        self.requests_per_minute = requests_per_minute
        self.requests_per_hour = requests_per_hour
        self.minute_windows: Dict[str, list] = defaultdict(list)
        self.hour_windows: Dict[str, list] = defaultdict(list)
        self.cleanup_interval = timedelta(minutes=5)
        self.last_cleanup = datetime.now()
    
    def get_client_ip(self, request: Request) -> str:
        """Extract client IP address from request"""
        if request.client:
            return request.client.host
        return "unknown"
    
    def cleanup_old_entries(self):
        """Remove old entries to prevent memory leaks"""
        now = datetime.now()
        if now - self.last_cleanup < self.cleanup_interval:
            return
        
        cutoff_minute = now - timedelta(minutes=1)
        cutoff_hour = now - timedelta(hours=1)
        
        for ip in list(self.minute_windows.keys()):
            self.minute_windows[ip] = [
                ts for ts in self.minute_windows[ip] if ts > cutoff_minute
            ]
            if not self.minute_windows[ip]:
                del self.minute_windows[ip]
        
        for ip in list(self.hour_windows.keys()):
            self.hour_windows[ip] = [
                ts for ts in self.hour_windows[ip] if ts > cutoff_hour
            ]
            if not self.hour_windows[ip]:
                del self.hour_windows[ip]
        
        self.last_cleanup = now
    
    async def dispatch(self, request: Request, call_next):
        # Skip rate limiting for health checks and static files
        if request.url.path in ["/health", "/docs", "/openapi.json", "/redoc"]:
            return await call_next(request)
        
        client_ip = self.get_client_ip(request)
        now = datetime.now()
        
        # Cleanup old entries periodically
        self.cleanup_old_entries()
        
        # Check minute limit
        minute_window = self.minute_windows[client_ip]
        minute_window = [ts for ts in minute_window if ts > now - timedelta(minutes=1)]
        
        if len(minute_window) >= self.requests_per_minute:
            raise HTTPException(
                status_code=status.HTTP_429_TOO_MANY_REQUESTS,
                detail=f"Rate limit exceeded: {self.requests_per_minute} requests per minute"
            )
        
        # Check hour limit
        hour_window = self.hour_windows[client_ip]
        hour_window = [ts for ts in hour_window if ts > now - timedelta(hours=1)]
        
        if len(hour_window) >= self.requests_per_hour:
            raise HTTPException(
                status_code=status.HTTP_429_TOO_MANY_REQUESTS,
                detail=f"Rate limit exceeded: {self.requests_per_hour} requests per hour"
            )
        
        # Record this request
        minute_window.append(now)
        hour_window.append(now)
        self.minute_windows[client_ip] = minute_window
        self.hour_windows[client_ip] = hour_window
        
        # Add rate limit headers
        response = await call_next(request)
        response.headers["X-RateLimit-Limit-Minute"] = str(self.requests_per_minute)
        response.headers["X-RateLimit-Limit-Hour"] = str(self.requests_per_hour)
        response.headers["X-RateLimit-Remaining-Minute"] = str(self.requests_per_minute - len(minute_window))
        response.headers["X-RateLimit-Remaining-Hour"] = str(self.requests_per_hour - len(hour_window))
        
        return response

