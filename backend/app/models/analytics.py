from sqlalchemy import Column, Integer, String, Text, DateTime, Boolean, ForeignKey, Numeric, JSON
from sqlalchemy.orm import relationship
from datetime import datetime
from app.database import Base


class AnalyticsDashboard(Base):
    """Custom dashboard configurations"""
    __tablename__ = "analytics_dashboards"

    id = Column(Integer, primary_key=True, index=True)
    
    name = Column(String(255), nullable=False)
    description = Column(Text)
    
    user_id = Column(Integer, ForeignKey("users.id"))
    is_public = Column(Boolean, default=False)
    
    layout = Column(JSON)  # Widget positions and sizes
    widgets = Column(JSON)  # Widget configurations
    filters = Column(JSON)  # Default filters
    
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)


class CustomReport(Base):
    """Custom report definitions"""
    __tablename__ = "custom_reports"

    id = Column(Integer, primary_key=True, index=True)
    
    name = Column(String(255), nullable=False)
    description = Column(Text)
    
    report_type = Column(String(50))  # tender, bid, vendor, financial
    
    columns = Column(JSON)  # Selected columns
    filters = Column(JSON)  # Filter conditions
    grouping = Column(JSON)  # Group by fields
    sorting = Column(JSON)  # Sort order
    
    chart_type = Column(String(50))  # bar, line, pie, table
    chart_config = Column(JSON)
    
    schedule = Column(String(50))  # daily, weekly, monthly
    recipients = Column(JSON)  # Email recipients
    
    created_by = Column(Integer, ForeignKey("users.id"))
    is_public = Column(Boolean, default=False)
    
    created_at = Column(DateTime, default=datetime.utcnow)


class TenderAnalytics(Base):
    """Pre-computed tender analytics"""
    __tablename__ = "tender_analytics"

    id = Column(Integer, primary_key=True, index=True)
    
    tender_id = Column(Integer, ForeignKey("tenders.id"), nullable=False, unique=True)
    
    # Cycle times (in hours)
    draft_to_publish_hours = Column(Integer)
    publish_to_deadline_hours = Column(Integer)
    deadline_to_evaluation_hours = Column(Integer)
    evaluation_to_award_hours = Column(Integer)
    total_cycle_hours = Column(Integer)
    
    # Participation
    total_bids = Column(Integer, default=0)
    qualified_bids = Column(Integer, default=0)
    disqualified_bids = Column(Integer, default=0)
    
    # Financial
    estimated_value = Column(Numeric(18, 2))
    lowest_bid = Column(Numeric(18, 2))
    highest_bid = Column(Numeric(18, 2))
    average_bid = Column(Numeric(18, 2))
    
    # Competition
    competition_ratio = Column(Numeric(5, 2))  # bids per tender
    price_spread = Column(Numeric(5, 2))  # % difference between L1 and average
    
    computed_at = Column(DateTime, default=datetime.utcnow)


class VendorAnalytics(Base):
    """Vendor participation analytics"""
    __tablename__ = "vendor_analytics"

    id = Column(Integer, primary_key=True, index=True)
    
    bidder_id = Column(Integer, ForeignKey("bidders.id"), nullable=False, unique=True)
    
    total_bids = Column(Integer, default=0)
    won_bids = Column(Integer, default=0)
    win_rate = Column(Numeric(5, 2))
    
    total_contracts = Column(Integer, default=0)
    total_contract_value = Column(Numeric(18, 2))
    
    average_rating = Column(Numeric(3, 2))
    on_time_delivery_rate = Column(Numeric(5, 2))
    
    categories_participated = Column(JSON)
    departments_worked_with = Column(JSON)
    
    last_bid_date = Column(DateTime)
    last_win_date = Column(DateTime)
    
    computed_at = Column(DateTime, default=datetime.utcnow)


class DepartmentAnalytics(Base):
    """Department-wise analytics"""
    __tablename__ = "department_analytics"

    id = Column(Integer, primary_key=True, index=True)
    
    department_id = Column(Integer, ForeignKey("departments.id"), nullable=False)
    financial_year = Column(String(10), nullable=False)
    
    total_tenders = Column(Integer, default=0)
    published_tenders = Column(Integer, default=0)
    awarded_tenders = Column(Integer, default=0)
    cancelled_tenders = Column(Integer, default=0)
    
    total_estimated_value = Column(Numeric(18, 2))
    total_awarded_value = Column(Numeric(18, 2))
    total_savings = Column(Numeric(18, 2))
    savings_percentage = Column(Numeric(5, 2))
    
    average_cycle_time_days = Column(Integer)
    average_bids_per_tender = Column(Numeric(5, 2))
    
    computed_at = Column(DateTime, default=datetime.utcnow)


class GeographicData(Base):
    """Geographic distribution of tenders/vendors"""
    __tablename__ = "geographic_data"

    id = Column(Integer, primary_key=True, index=True)
    
    entity_type = Column(String(50))  # tender, vendor, contract
    entity_id = Column(Integer)
    
    state = Column(String(100))
    city = Column(String(100))
    pincode = Column(String(20))
    
    latitude = Column(Numeric(10, 8))
    longitude = Column(Numeric(11, 8))
    
    created_at = Column(DateTime, default=datetime.utcnow)
