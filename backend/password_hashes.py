# fix_password_hashes.py
from core.database import SessionLocal
from core.models import User, Admin
from core.auth import get_password_hash
from sqlalchemy.orm import Session

def update_passwords(session: Session, model, default_password: str):
    users = session.query(model).all()
    for user in users:
        # You can add logic to check if the hash is invalid, but for safety, let's reset all
        user.password_hash = get_password_hash(default_password)
        print(f"Updated {model.__tablename__} {user.email} to default password.")
    session.commit()

def main():
    db = SessionLocal()
    try:
        update_passwords(db, User, "changeme123")
        update_passwords(db, Admin, "changeme123")
    finally:
        db.close()

if __name__ == "__main__":
    main()