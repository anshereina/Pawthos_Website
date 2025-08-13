from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List, Union
from core import models, schemas, auth
from core.database import get_db

router = APIRouter(prefix="/users", tags=["users"])

# Recipients endpoints (for alerts) - accessible by any authenticated user
@router.get("/recipients", response_model=List[dict])
def get_recipients(
    search: str = None,
    db: Session = Depends(get_db),
    current_user: models.Admin = Depends(auth.get_current_admin)
):
    """Get all users and admins for recipients dropdown"""
    # Get admins
    admin_query = db.query(models.Admin)
    if search:
        search_filter = f"%{search}%"
        admin_query = admin_query.filter(
            (models.Admin.name.ilike(search_filter)) |
            (models.Admin.email.ilike(search_filter))
        )
    admins = admin_query.all()
    
    # Get users
    user_query = db.query(models.User)
    if search:
        search_filter = f"%{search}%"
        user_query = user_query.filter(
            (models.User.name.ilike(search_filter)) |
            (models.User.email.ilike(search_filter))
        )
    users = user_query.all()
    
    # Combine and format results
    recipients = []
    for admin in admins:
        recipients.append({
            "id": admin.id,
            "name": admin.name,
            "email": admin.email,
            "type": "Admin"
        })
    
    for user in users:
        recipients.append({
            "id": user.id,
            "name": user.name,
            "email": user.email,
            "type": "User"
        })
    
    return recipients

# Admin management endpoints
@router.get("/admins", response_model=List[schemas.Admin])
def get_admins(
    search: str = None,
    db: Session = Depends(get_db),
    current_admin: models.Admin = Depends(auth.get_current_admin)
):
    """Get all admins with optional search"""
    query = db.query(models.Admin)
    
    if search:
        search_filter = f"%{search}%"
        query = query.filter(
            (models.Admin.name.ilike(search_filter)) |
            (models.Admin.email.ilike(search_filter))
        )
    
    admins = query.all()
    return admins

@router.get("/admins/{admin_id}", response_model=schemas.Admin)
def get_admin(
    admin_id: int,
    db: Session = Depends(get_db),
    current_admin: models.Admin = Depends(auth.get_current_admin)
):
    """Get a specific admin by ID"""
    admin = db.query(models.Admin).filter(models.Admin.id == admin_id).first()
    if not admin:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Admin not found"
        )
    return admin

@router.put("/admins/{admin_id}", response_model=schemas.Admin)
def update_admin(
    admin_id: int,
    admin_update: schemas.AdminBase,
    db: Session = Depends(get_db),
    current_admin: models.Admin = Depends(auth.get_current_admin)
):
    """Update an admin"""
    admin = db.query(models.Admin).filter(models.Admin.id == admin_id).first()
    if not admin:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Admin not found"
        )
    
    for field, value in admin_update.dict(exclude_unset=True).items():
        setattr(admin, field, value)
    
    db.commit()
    db.refresh(admin)
    return admin

@router.delete("/admins/{admin_id}")
def delete_admin(
    admin_id: int,
    db: Session = Depends(get_db),
    current_admin: models.Admin = Depends(auth.get_current_admin)
):
    """Delete an admin"""
    if current_admin.id == admin_id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Cannot delete your own account"
        )
    
    admin = db.query(models.Admin).filter(models.Admin.id == admin_id).first()
    if not admin:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Admin not found"
        )
    
    db.delete(admin)
    db.commit()
    return {"message": "Admin deleted successfully"}

@router.post("/admins", response_model=schemas.Admin)
def create_admin(
    admin_create: schemas.AdminCreate,
    db: Session = Depends(get_db),
    current_admin: models.Admin = Depends(auth.get_current_admin)
):
    """Create a new admin"""
    existing_admin = auth.get_admin(db, email=admin_create.email)
    if existing_admin:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email already registered"
        )
    
    hashed_password = auth.get_password_hash(admin_create.password)
    
    db_admin = models.Admin(
        name=admin_create.name,
        email=admin_create.email,
        password_hash=hashed_password,
        is_confirmed=1
    )
    
    db.add(db_admin)
    db.commit()
    db.refresh(db_admin)
    return db_admin

# User management endpoints
@router.get("/", response_model=List[schemas.User])
def get_users(
    search: str = None,
    db: Session = Depends(get_db),
    current_user: Union[models.Admin, models.User] = Depends(auth.get_current_user)
):
    """Get all users with optional search - accessible by any authenticated user"""
    query = db.query(models.User)
    
    if search:
        search_filter = f"%{search}%"
        query = query.filter(
            (models.User.name.ilike(search_filter)) |
            (models.User.email.ilike(search_filter))
        )
    
    users = query.all()
    return users

@router.get("/{user_id}", response_model=schemas.User)
def get_user(
    user_id: int,
    db: Session = Depends(get_db),
    current_admin: models.Admin = Depends(auth.get_current_admin)
):
    """Get a specific user by ID"""
    user = db.query(models.User).filter(models.User.id == user_id).first()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
    return user

@router.put("/{user_id}", response_model=schemas.User)
def update_user(
    user_id: int,
    user_update: schemas.UserUpdate,
    db: Session = Depends(get_db),
    current_admin: models.Admin = Depends(auth.get_current_admin)
):
    """Update a user"""
    user = db.query(models.User).filter(models.User.id == user_id).first()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
    
    for field, value in user_update.dict(exclude_unset=True).items():
        setattr(user, field, value)
    
    db.commit()
    db.refresh(user)
    return user

@router.delete("/{user_id}")
def delete_user(
    user_id: int,
    db: Session = Depends(get_db),
    current_admin: models.Admin = Depends(auth.get_current_admin)
):
    """Delete a user"""
    user = db.query(models.User).filter(models.User.id == user_id).first()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
    
    db.delete(user)
    db.commit()
    return {"message": "User deleted successfully"}

@router.post("/", response_model=schemas.User)
def create_user(
    user_create: schemas.UserCreate,
    db: Session = Depends(get_db),
    current_admin: models.Admin = Depends(auth.get_current_admin)
):
    """Create a new user"""
    existing_user = auth.get_user(db, email=user_create.email)
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email already registered"
        )
    
    hashed_password = auth.get_password_hash(user_create.password)
    
    db_user = models.User(
        name=user_create.name,
        email=user_create.email,
        password_hash=hashed_password,
        address=user_create.address,
        phone_number=user_create.phone_number,
        is_confirmed=1
    )
    
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    return db_user 