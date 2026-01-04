from sqlalchemy import Column, Integer, String, Text, DateTime, Boolean, ForeignKey, JSON
from sqlalchemy.orm import relationship
from datetime import datetime
from app.database import Base


class Integration(Base):
    """External system integrations"""
    __tablename__ = "integrations"

    id = Column(Integer, primary_key=True, index=True)
    
    name = Column(String(100), nullable=False)
    type = Column(String(50))  # erp, gem, cppp, dms, payment
    
    base_url = Column(String(500))
    api_key = Column(String(500))
    api_secret = Column(String(500))
    
    config = Column(JSON)
    
    is_active = Column(Boolean, default=True)
    last_sync_at = Column(DateTime)
    
    created_at = Column(DateTime, default=datetime.utcnow)


class IntegrationLog(Base):
    """Integration sync logs"""
    __tablename__ = "integration_logs"

    id = Column(Integer, primary_key=True, index=True)
    
    integration_id = Column(Integer, ForeignKey("integrations.id"), nullable=False)
    
    action = Column(String(100))
    direction = Column(String(10))  # inbound, outbound
    
    request_data = Column(JSON)
    response_data = Column(JSON)
    
    status = Column(String(20))  # success, failed
    error_message = Column(Text)
    
    created_at = Column(DateTime, default=datetime.utcnow)


class Webhook(Base):
    """Webhook configurations"""
    __tablename__ = "webhooks"

    id = Column(Integer, primary_key=True, index=True)
    
    name = Column(String(100), nullable=False)
    url = Column(String(500), nullable=False)
    secret = Column(String(255))
    
    events = Column(JSON)  # List of events to trigger
    headers = Column(JSON)  # Custom headers
    
    is_active = Column(Boolean, default=True)
    
    created_by = Column(Integer, ForeignKey("users.id"))
    created_at = Column(DateTime, default=datetime.utcnow)


class WebhookDelivery(Base):
    """Webhook delivery attempts"""
    __tablename__ = "webhook_deliveries"

    id = Column(Integer, primary_key=True, index=True)
    
    webhook_id = Column(Integer, ForeignKey("webhooks.id"), nullable=False)
    
    event = Column(String(100))
    payload = Column(JSON)
    
    response_code = Column(Integer)
    response_body = Column(Text)
    
    status = Column(String(20))  # pending, delivered, failed
    attempts = Column(Integer, default=0)
    
    created_at = Column(DateTime, default=datetime.utcnow)
    delivered_at = Column(DateTime)


class APIKey(Base):
    """API keys for external access"""
    __tablename__ = "api_keys"

    id = Column(Integer, primary_key=True, index=True)
    
    name = Column(String(100), nullable=False)
    key = Column(String(255), unique=True, nullable=False)
    
    user_id = Column(Integer, ForeignKey("users.id"))
    
    permissions = Column(JSON)  # List of allowed endpoints
    rate_limit = Column(Integer, default=1000)  # Requests per hour
    
    is_active = Column(Boolean, default=True)
    expires_at = Column(DateTime)
    
    last_used_at = Column(DateTime)
    usage_count = Column(Integer, default=0)
    
    created_at = Column(DateTime, default=datetime.utcnow)


class GeMSync(Base):
    """GeM portal sync records"""
    __tablename__ = "gem_sync"

    id = Column(Integer, primary_key=True, index=True)
    
    tender_id = Column(Integer, ForeignKey("tenders.id"), nullable=False)
    
    gem_bid_id = Column(String(100))
    gem_status = Column(String(50))
    
    published_to_gem = Column(Boolean, default=False)
    published_at = Column(DateTime)
    
    last_sync_at = Column(DateTime)
    sync_status = Column(String(20))
    sync_error = Column(Text)


class CPPPSync(Base):
    """CPPP portal sync records"""
    __tablename__ = "cppp_sync"

    id = Column(Integer, primary_key=True, index=True)
    
    tender_id = Column(Integer, ForeignKey("tenders.id"), nullable=False)
    
    cppp_tender_id = Column(String(100))
    cppp_status = Column(String(50))
    
    published_to_cppp = Column(Boolean, default=False)
    published_at = Column(DateTime)
    
    last_sync_at = Column(DateTime)
    sync_status = Column(String(20))
    sync_error = Column(Text)
