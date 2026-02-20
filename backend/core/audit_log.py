from datetime import datetime
from typing import Optional, Dict, Any
from sqlalchemy.orm import Session
from core.models import Admin, User
import json

class AuditLogger:
    """
    Audit logging utility for tracking sensitive operations.
    Logs to console in development, can be extended to log to database/file in production.
    """
    
    @staticmethod
    def get_user_identifier(user: Optional[Admin | User]) -> str:
        """Get identifier for user (email or 'anonymous')"""
        if user:
            if hasattr(user, 'email'):
                return user.email
            elif hasattr(user, 'name'):
                return user.name
        return "anonymous"
    
    @staticmethod
    def log_action(
        action: str,
        resource: str,
        user: Optional[Admin | User] = None,
        details: Optional[Dict[str, Any]] = None,
        ip_address: Optional[str] = None,
        success: bool = True
    ):
        """
        Log an audit event.
        
        Args:
            action: Action performed (e.g., 'create', 'update', 'delete', 'login', 'access')
            resource: Resource affected (e.g., 'shipping_permit_record', 'user', 'report')
            user: User performing the action (Admin or User object)
            details: Additional details about the action
            ip_address: IP address of the requester
            success: Whether the action was successful
        """
        log_entry = {
            "timestamp": datetime.utcnow().isoformat(),
            "action": action,
            "resource": resource,
            "user": AuditLogger.get_user_identifier(user),
            "user_type": "admin" if isinstance(user, Admin) else ("user" if isinstance(user, User) else None),
            "ip_address": ip_address or "unknown",
            "success": success,
            "details": details or {}
        }
        
        # In production, this should log to a database or file
        # For now, we'll use structured logging that can be captured by logging systems
        import logging
        logger = logging.getLogger("audit")
        logger.setLevel(logging.INFO)
        
        # Format as JSON for easy parsing
        log_message = json.dumps(log_entry, default=str)
        logger.info(log_message)
    
    @staticmethod
    def log_sensitive_access(
        resource: str,
        resource_id: Optional[str] = None,
        user: Optional[Admin | User] = None,
        ip_address: Optional[str] = None
    ):
        """Log access to sensitive resources"""
        AuditLogger.log_action(
            action="access",
            resource=resource,
            user=user,
            details={"resource_id": resource_id} if resource_id else {},
            ip_address=ip_address
        )
    
    @staticmethod
    def log_data_modification(
        action: str,
        resource: str,
        resource_id: Optional[str] = None,
        user: Optional[Admin | User] = None,
        changes: Optional[Dict[str, Any]] = None,
        ip_address: Optional[str] = None,
        success: bool = True
    ):
        """Log data modification operations (create, update, delete)"""
        details = {}
        if resource_id:
            details["resource_id"] = resource_id
        if changes:
            # Sanitize sensitive fields
            sanitized_changes = {}
            sensitive_fields = ["password", "password_hash", "otp_code", "token"]
            for key, value in changes.items():
                if any(sensitive in key.lower() for sensitive in sensitive_fields):
                    sanitized_changes[key] = "***REDACTED***"
                else:
                    sanitized_changes[key] = value
            details["changes"] = sanitized_changes
        
        AuditLogger.log_action(
            action=action,
            resource=resource,
            user=user,
            details=details,
            ip_address=ip_address,
            success=success
        )
    
    @staticmethod
    def log_authentication_event(
        event_type: str,
        email: Optional[str] = None,
        success: bool = True,
        ip_address: Optional[str] = None,
        reason: Optional[str] = None
    ):
        """Log authentication events (login, logout, failed login, etc.)"""
        details = {}
        if email:
            details["email"] = email
        if reason:
            details["reason"] = reason
        
        AuditLogger.log_action(
            action=event_type,
            resource="authentication",
            user=None,
            details=details,
            ip_address=ip_address,
            success=success
        )

