from sqlalchemy.orm import DeclarativeBase
from sqlalchemy import Column, DateTime
from sqlalchemy.sql import func

class Base(DeclarativeBase):
    """Abstract base class for all models"""
    pass

class AuditMixin:
    """
    Reusable mixin for audit timestamps.
    """
    created_at = Column(
        DateTime(timezone=True), 
        server_default=func.now(), 
        nullable=False
    )
    
    updated_at = Column(
        DateTime(timezone=True), 
        server_default=func.now(), 
        onupdate=func.now(), 
        nullable=False
    )
    
    deleted_at = Column(
        DateTime(timezone=True), 
        nullable=True
    )