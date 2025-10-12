#!/usr/bin/env python3
"""
Database schema migration script to ensure compatibility between mobile and web backends
"""

import os
import sys
from sqlalchemy import create_engine, text
from sqlalchemy.orm import sessionmaker
from core.config import DATABASE_URL
import logging

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

def migrate_schema():
    """Apply schema migrations to ensure compatibility"""
    try:
        engine = create_engine(DATABASE_URL)
        
        with engine.begin() as connection:
            logger.info("Starting schema migration...")
            
            # Add missing columns to users table
            try:
                connection.execute(text("ALTER TABLE users ADD COLUMN IF NOT EXISTS photo_url VARCHAR(500) NULL"))
                connection.execute(text("ALTER TABLE users ADD COLUMN IF NOT EXISTS reset_token VARCHAR(255) NULL"))
                connection.execute(text("ALTER TABLE users ADD COLUMN IF NOT EXISTS reset_token_expiry TIMESTAMP NULL"))
                logger.info("Added missing columns to users table")
            except Exception as e:
                logger.warning(f"Could not add columns to users table: {e}")
            
            # Update pets table schema
            try:
                connection.execute(text("ALTER TABLE pets ALTER COLUMN pet_id DROP NOT NULL"))
                connection.execute(text("ALTER TABLE pets ALTER COLUMN date_of_birth TYPE VARCHAR(255)"))
                connection.execute(text("ALTER TABLE pets ALTER COLUMN created_at DROP NOT NULL"))
                connection.execute(text("ALTER TABLE pets ALTER COLUMN updated_at DROP NOT NULL"))
                logger.info("Updated pets table schema")
            except Exception as e:
                logger.warning(f"Could not update pets table schema: {e}")
            
            # Update appointments table schema
            try:
                connection.execute(text("ALTER TABLE appointments ALTER COLUMN date TYPE VARCHAR(255)"))
                connection.execute(text("ALTER TABLE appointments ALTER COLUMN time TYPE VARCHAR(255)"))
                connection.execute(text("ALTER TABLE appointments ALTER COLUMN updated_at DROP NOT NULL"))
                logger.info("Updated appointments table schema")
            except Exception as e:
                logger.warning(f"Could not update appointments table schema: {e}")
            
            # Update pain_assessments table schema
            try:
                connection.execute(text("ALTER TABLE pain_assessments ALTER COLUMN pet_name DROP NOT NULL"))
                connection.execute(text("ALTER TABLE pain_assessments ALTER COLUMN pet_type DROP NOT NULL"))
                connection.execute(text("ALTER TABLE pain_assessments ALTER COLUMN pain_level DROP NOT NULL"))
                connection.execute(text("ALTER TABLE pain_assessments ALTER COLUMN pain_score SET NOT NULL"))
                connection.execute(text("ALTER TABLE pain_assessments ALTER COLUMN assessment_date TYPE TIMESTAMP"))
                connection.execute(text("ALTER TABLE pain_assessments ALTER COLUMN created_at TYPE TIMESTAMP"))
                logger.info("Updated pain_assessments table schema")
            except Exception as e:
                logger.warning(f"Could not update pain_assessments table schema: {e}")
            
            # Update medical_records table schema
            try:
                connection.execute(text("ALTER TABLE medical_records ADD COLUMN IF NOT EXISTS record_type VARCHAR(255) NULL"))
                connection.execute(text("ALTER TABLE medical_records ADD COLUMN IF NOT EXISTS title VARCHAR(255) NULL"))
                connection.execute(text("ALTER TABLE medical_records ADD COLUMN IF NOT EXISTS description TEXT NULL"))
                connection.execute(text("ALTER TABLE medical_records ADD COLUMN IF NOT EXISTS clinic VARCHAR(255) NULL"))
                connection.execute(text("ALTER TABLE medical_records ADD COLUMN IF NOT EXISTS next_due_date TIMESTAMP NULL"))
                connection.execute(text("ALTER TABLE medical_records ALTER COLUMN updated_at DROP NOT NULL"))
                logger.info("Updated medical_records table schema")
            except Exception as e:
                logger.warning(f"Could not update medical_records table schema: {e}")
            
            # Update vaccination_records table schema
            try:
                connection.execute(text("ALTER TABLE vaccination_records ADD COLUMN IF NOT EXISTS date_given TIMESTAMP NULL"))
                connection.execute(text("ALTER TABLE vaccination_records ADD COLUMN IF NOT EXISTS next_due_date TIMESTAMP NULL"))
                connection.execute(text("ALTER TABLE vaccination_records ADD COLUMN IF NOT EXISTS clinic VARCHAR(255) NULL"))
                connection.execute(text("ALTER TABLE vaccination_records ADD COLUMN IF NOT EXISTS notes TEXT NULL"))
                connection.execute(text("ALTER TABLE vaccination_records ALTER COLUMN veterinarian DROP NOT NULL"))
                connection.execute(text("ALTER TABLE vaccination_records ALTER COLUMN updated_at DROP NOT NULL"))
                logger.info("Updated vaccination_records table schema")
            except Exception as e:
                logger.warning(f"Could not update vaccination_records table schema: {e}")
            
            # Update vaccination_events table schema
            try:
                connection.execute(text("ALTER TABLE vaccination_events ALTER COLUMN event_date TYPE TIMESTAMP"))
                logger.info("Updated vaccination_events table schema")
            except Exception as e:
                logger.warning(f"Could not update vaccination_events table schema: {e}")
            
            logger.info("Schema migration completed successfully!")
            
    except Exception as e:
        logger.error(f"Schema migration failed: {e}")
        sys.exit(1)

if __name__ == "__main__":
    migrate_schema()
