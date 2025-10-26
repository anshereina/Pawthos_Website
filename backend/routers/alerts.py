from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from core import models, schemas
from core.database import get_db
import re
import json

router = APIRouter(prefix="/alerts", tags=["alerts"])

def generate_alert_id(db: Session) -> str:
    """Generate a unique alert ID in ALT-0001 format"""
    last_alert = db.query(models.Alert).order_by(models.Alert.id.desc()).first()
    if last_alert:
        # Extract number from last alert_id (e.g., "ALT-0001" -> 1)
        match = re.search(r'ALT-(\d+)', last_alert.alert_id)
        if match:
            next_num = int(match.group(1)) + 1
        else:
            next_num = 1
    else:
        next_num = 1
    
    return f"ALT-{next_num:04d}"

@router.post("/", response_model=schemas.Alert)
def create_alert(alert: schemas.AlertCreate, db: Session = Depends(get_db)):
    """Create a new alert"""
    alert_id = generate_alert_id(db)
    
    # Convert recipients list to JSON string if provided
    recipients_json = None
    if alert.recipients:
        # If recipients is already a JSON string, use it directly
        # If it's a list, convert it to JSON string
        if isinstance(alert.recipients, str):
            try:
                # Check if it's already valid JSON
                recipients_list = json.loads(alert.recipients)
            except json.JSONDecodeError:
                # If it's not valid JSON, treat it as a regular string
                recipients_list = [alert.recipients]
        else:
            recipients_list = alert.recipients
        
        # Check if ALL_USERS is in the recipients list
        if 'ALL_USERS' in recipients_list:
            # Remove ALL_USERS from the list
            recipients_list = [r for r in recipients_list if r != 'ALL_USERS']
            
            # Get all users from the database
            all_users = db.query(models.User).all()
            all_user_emails = [user.email for user in all_users]
            
            # Add all user emails to the recipients list
            recipients_list.extend(all_user_emails)
            
            # Remove duplicates while preserving order
            seen = set()
            unique_recipients = []
            for recipient in recipients_list:
                if recipient not in seen:
                    seen.add(recipient)
                    unique_recipients.append(recipient)
            
            recipients_list = unique_recipients
        
        recipients_json = json.dumps(recipients_list)
        print(f"Creating alert with recipients: {recipients_json}")
    else:
        print("Creating alert with no recipients")
    
    db_alert = models.Alert(
        alert_id=alert_id,
        title=alert.title,
        message=alert.message,
        priority=alert.priority,
        submitted_by=alert.submitted_by,
        submitted_by_email=alert.submitted_by_email,
        recipients=recipients_json
    )
    db.add(db_alert)
    db.commit()
    db.refresh(db_alert)
    print(f"Created alert with recipients: {db_alert.recipients}")
    return db_alert

@router.get("/", response_model=List[schemas.Alert])
def get_alerts(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    """Get all alerts with pagination"""
    alerts = db.query(models.Alert).offset(skip).limit(limit).all()
    for alert in alerts:
        print(f"Alert {alert.alert_id} recipients: {alert.recipients}")
    return alerts

@router.get("/{alert_id}", response_model=schemas.Alert)
def get_alert(alert_id: str, db: Session = Depends(get_db)):
    """Get a specific alert by ID"""
    alert = db.query(models.Alert).filter(models.Alert.alert_id == alert_id).first()
    if alert is None:
        raise HTTPException(status_code=404, detail="Alert not found")
    return alert

@router.put("/{alert_id}", response_model=schemas.Alert)
def update_alert(alert_id: str, alert_update: schemas.AlertUpdate, db: Session = Depends(get_db)):
    """Update an alert"""
    db_alert = db.query(models.Alert).filter(models.Alert.alert_id == alert_id).first()
    if db_alert is None:
        raise HTTPException(status_code=404, detail="Alert not found")
    
    update_data = alert_update.dict(exclude_unset=True)
    
    # Handle recipients field specifically
    if 'recipients' in update_data:
        recipients_json = None
        if update_data['recipients']:
            # If recipients is already a JSON string, use it directly
            if isinstance(update_data['recipients'], str):
                try:
                    # Check if it's already valid JSON
                    recipients_list = json.loads(update_data['recipients'])
                except json.JSONDecodeError:
                    # If it's not valid JSON, treat it as a regular string
                    recipients_list = [update_data['recipients']]
            else:
                recipients_list = update_data['recipients']
            
            # Check if ALL_USERS is in the recipients list
            if 'ALL_USERS' in recipients_list:
                # Remove ALL_USERS from the list
                recipients_list = [r for r in recipients_list if r != 'ALL_USERS']
                
                # Get all users from the database
                all_users = db.query(models.User).all()
                all_user_emails = [user.email for user in all_users]
                
                # Add all user emails to the recipients list
                recipients_list.extend(all_user_emails)
                
                # Remove duplicates while preserving order
                seen = set()
                unique_recipients = []
                for recipient in recipients_list:
                    if recipient not in seen:
                        seen.add(recipient)
                        unique_recipients.append(recipient)
                
                recipients_list = unique_recipients
            
            recipients_json = json.dumps(recipients_list)
        update_data['recipients'] = recipients_json
    
    for field, value in update_data.items():
        setattr(db_alert, field, value)
    
    db.commit()
    db.refresh(db_alert)
    return db_alert

@router.delete("/{alert_id}")
def delete_alert(alert_id: str, db: Session = Depends(get_db)):
    """Delete an alert"""
    db_alert = db.query(models.Alert).filter(models.Alert.alert_id == alert_id).first()
    if db_alert is None:
        raise HTTPException(status_code=404, detail="Alert not found")
    
    db.delete(db_alert)
    db.commit()
    return {"message": "Alert deleted successfully"}

@router.get("/search/", response_model=List[schemas.Alert])
def search_alerts(query: str, db: Session = Depends(get_db)):
    """Search alerts by title or message"""
    alerts = db.query(models.Alert).filter(
        models.Alert.title.ilike(f"%{query}%") | 
        models.Alert.message.ilike(f"%{query}%")
    ).all()
    return alerts

@router.get("/priority/{priority}", response_model=List[schemas.Alert])
def get_alerts_by_priority(priority: str, db: Session = Depends(get_db)):
    """Get alerts by priority level"""
    alerts = db.query(models.Alert).filter(models.Alert.priority == priority).all()
    return alerts

@router.get("/user/{email}", response_model=List[schemas.Alert])
def get_user_alerts(email: str, db: Session = Depends(get_db)):
    """Get alerts for a specific user by email"""
    # Get all alerts
    all_alerts = db.query(models.Alert).all()
    
    # Filter alerts that include this user's email in recipients
    user_alerts = []
    for alert in all_alerts:
        if alert.recipients:
            try:
                recipients_list = json.loads(alert.recipients)
                if email in recipients_list:
                    user_alerts.append(alert)
            except json.JSONDecodeError:
                continue
    
    # Sort by created_at descending (most recent first)
    user_alerts.sort(key=lambda x: x.created_at, reverse=True)
    
    return user_alerts 