from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List, Optional
from datetime import datetime
from pydantic import BaseModel

from app.core.dependencies import get_db, get_current_user
from app.models.user import User, UserRole
from app.services.notification_service import TwoFactorService

router = APIRouter(prefix="/security", tags=["Security & 2FA"])


class Enable2FARequest(BaseModel):
    method: str = "totp"  # totp, sms, email


class Verify2FARequest(BaseModel):
    code: str


class SessionResponse(BaseModel):
    id: int
    device_info: str
    ip_address: str
    location: str
    is_current: bool
    last_activity: datetime


@router.post("/2fa/enable")
async def enable_2fa(
    data: Enable2FARequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Enable two-factor authentication"""
    from app.models.compliance import TwoFactorAuth
    
    # Check if already enabled
    existing = db.query(TwoFactorAuth).filter(TwoFactorAuth.user_id == current_user.id).first()
    
    if data.method == "totp":
        secret = TwoFactorService.generate_secret()
        uri = TwoFactorService.get_totp_uri(secret, current_user.email)
        backup_codes = TwoFactorService.generate_backup_codes()
        
        if existing:
            existing.secret_key = secret
            existing.backup_codes = backup_codes
            existing.method = "totp"
        else:
            tfa = TwoFactorAuth(
                user_id=current_user.id,
                method="totp",
                secret_key=secret,
                backup_codes=backup_codes,
                is_enabled=False  # Enable after verification
            )
            db.add(tfa)
        
        db.commit()
        
        return {
            "method": "totp",
            "secret": secret,
            "qr_uri": uri,
            "backup_codes": backup_codes,
            "message": "Scan QR code with authenticator app, then verify"
        }
    
    elif data.method == "sms":
        otp = TwoFactorService.generate_otp()
        # Store OTP temporarily (in production, use Redis)
        if existing:
            existing.method = "sms"
        else:
            tfa = TwoFactorAuth(
                user_id=current_user.id,
                method="sms",
                is_enabled=False
            )
            db.add(tfa)
        db.commit()
        
        return {"method": "sms", "message": f"OTP sent to registered phone (Demo: {otp})"}
    
    return {"error": "Invalid method"}


@router.post("/2fa/verify")
async def verify_2fa(
    data: Verify2FARequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Verify 2FA code and enable"""
    from app.models.compliance import TwoFactorAuth
    
    tfa = db.query(TwoFactorAuth).filter(TwoFactorAuth.user_id == current_user.id).first()
    if not tfa:
        raise HTTPException(status_code=400, detail="2FA not configured")
    
    if tfa.method == "totp":
        if TwoFactorService.verify_totp(tfa.secret_key, data.code):
            tfa.is_enabled = True
            db.commit()
            return {"message": "2FA enabled successfully"}
        else:
            raise HTTPException(status_code=400, detail="Invalid code")
    
    return {"error": "Verification failed"}


@router.post("/2fa/disable")
async def disable_2fa(
    data: Verify2FARequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Disable 2FA"""
    from app.models.compliance import TwoFactorAuth
    
    tfa = db.query(TwoFactorAuth).filter(TwoFactorAuth.user_id == current_user.id).first()
    if not tfa:
        raise HTTPException(status_code=400, detail="2FA not enabled")
    
    # Verify code before disabling
    if tfa.method == "totp" and TwoFactorService.verify_totp(tfa.secret_key, data.code):
        tfa.is_enabled = False
        db.commit()
        return {"message": "2FA disabled"}
    
    raise HTTPException(status_code=400, detail="Invalid code")


@router.get("/2fa/status")
async def get_2fa_status(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get 2FA status"""
    from app.models.compliance import TwoFactorAuth
    
    tfa = db.query(TwoFactorAuth).filter(TwoFactorAuth.user_id == current_user.id).first()
    
    return {
        "enabled": tfa.is_enabled if tfa else False,
        "method": tfa.method if tfa else None,
        "backup_codes_remaining": len(tfa.backup_codes) if tfa and tfa.backup_codes else 0
    }


@router.get("/sessions")
async def get_active_sessions(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get user's active sessions"""
    from app.models.compliance import UserSession
    
    sessions = db.query(UserSession).filter(
        UserSession.user_id == current_user.id,
        UserSession.is_active == True
    ).order_by(UserSession.last_activity.desc()).all()
    
    return [
        {
            "id": s.id,
            "device_info": s.device_info,
            "ip_address": s.ip_address,
            "location": s.location,
            "last_activity": s.last_activity,
            "created_at": s.created_at
        }
        for s in sessions
    ]


@router.delete("/sessions/{session_id}")
async def terminate_session(
    session_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Terminate a specific session"""
    from app.models.compliance import UserSession
    
    session = db.query(UserSession).filter(
        UserSession.id == session_id,
        UserSession.user_id == current_user.id
    ).first()
    
    if not session:
        raise HTTPException(status_code=404, detail="Session not found")
    
    session.is_active = False
    db.commit()
    
    return {"message": "Session terminated"}


@router.delete("/sessions")
async def terminate_all_sessions(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Terminate all sessions except current"""
    from app.models.compliance import UserSession
    
    db.query(UserSession).filter(
        UserSession.user_id == current_user.id,
        UserSession.is_active == True
    ).update({"is_active": False})
    db.commit()
    
    return {"message": "All sessions terminated"}


@router.get("/ip-whitelist")
async def get_ip_whitelist(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get IP whitelist"""
    if current_user.role != UserRole.ADMIN:
        raise HTTPException(status_code=403, detail="Admin access required")
    
    from app.models.compliance import IPWhitelist
    
    return db.query(IPWhitelist).filter(IPWhitelist.is_active == True).all()


@router.post("/ip-whitelist")
async def add_ip_whitelist(
    ip_address: str,
    description: str,
    user_id: Optional[int] = None,
    department_id: Optional[int] = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Add IP to whitelist"""
    if current_user.role != UserRole.ADMIN:
        raise HTTPException(status_code=403, detail="Admin access required")
    
    from app.models.compliance import IPWhitelist
    
    entry = IPWhitelist(
        ip_address=ip_address,
        description=description,
        user_id=user_id,
        department_id=department_id
    )
    db.add(entry)
    db.commit()
    
    return {"message": "IP added to whitelist"}


@router.get("/audit-trail")
async def get_audit_trail(
    entity_type: Optional[str] = None,
    entity_id: Optional[int] = None,
    user_id: Optional[int] = None,
    limit: int = 100,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get audit trail with blockchain hashes"""
    if current_user.role not in [UserRole.ADMIN, UserRole.TENDER_OFFICER]:
        raise HTTPException(status_code=403, detail="Access denied")
    
    from app.models.audit import AuditLog
    
    query = db.query(AuditLog)
    
    if entity_type:
        query = query.filter(AuditLog.entity_type == entity_type)
    if entity_id:
        query = query.filter(AuditLog.entity_id == entity_id)
    if user_id:
        query = query.filter(AuditLog.user_id == user_id)
    
    logs = query.order_by(AuditLog.created_at.desc()).limit(limit).all()
    
    return [
        {
            "id": log.id,
            "action": log.action,
            "entity_type": log.entity_type,
            "entity_id": log.entity_id,
            "user": log.user.full_name if log.user else "System",
            "ip_address": log.ip_address,
            "timestamp": log.created_at
        }
        for log in logs
    ]
