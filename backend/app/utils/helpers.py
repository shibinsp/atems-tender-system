"""
Utility functions for ATEMS
"""
from datetime import datetime, timezone
import re
import hashlib
import secrets


def utc_now():
    """Return current UTC time as timezone-aware datetime"""
    return datetime.now(timezone.utc)


def make_aware(dt: datetime) -> datetime:
    """Convert naive datetime to UTC aware datetime"""
    if dt is None:
        return None
    if dt.tzinfo is None:
        return dt.replace(tzinfo=timezone.utc)
    return dt


def compare_datetimes(dt1: datetime, dt2: datetime) -> int:
    """
    Safely compare two datetimes (handles naive vs aware)
    Returns: -1 if dt1 < dt2, 0 if equal, 1 if dt1 > dt2
    """
    dt1 = make_aware(dt1) if dt1 else None
    dt2 = make_aware(dt2) if dt2 else None
    
    if dt1 is None or dt2 is None:
        return 0
    
    if dt1 < dt2:
        return -1
    elif dt1 > dt2:
        return 1
    return 0


def is_past(dt: datetime) -> bool:
    """Check if datetime is in the past"""
    if dt is None:
        return False
    return compare_datetimes(utc_now(), dt) > 0


def escape_like(value: str) -> str:
    """Escape special characters for SQL LIKE queries"""
    if not value:
        return value
    return value.replace("\\", "\\\\").replace("%", "\\%").replace("_", "\\_")


def generate_token(length: int = 32) -> str:
    """Generate a secure random token"""
    return secrets.token_urlsafe(length)


def hash_string(value: str) -> str:
    """Generate SHA256 hash of a string"""
    return hashlib.sha256(value.encode()).hexdigest()


def sanitize_filename(filename: str) -> str:
    """Sanitize filename to prevent path traversal"""
    # Remove path separators and null bytes
    filename = re.sub(r'[/\\:\x00]', '', filename)
    # Remove leading dots
    filename = filename.lstrip('.')
    return filename or 'unnamed'


def format_currency(amount: float, currency: str = "INR") -> str:
    """Format amount as currency string"""
    if currency == "INR":
        return f"₹{amount:,.2f}"
    return f"{currency} {amount:,.2f}"
