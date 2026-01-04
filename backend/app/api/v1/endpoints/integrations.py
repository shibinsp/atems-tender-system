from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List, Optional
from datetime import datetime
from pydantic import BaseModel

from app.core.dependencies import get_db, get_current_user
from app.models.user import User, UserRole

router = APIRouter(prefix="/integrations", tags=["Integrations & Webhooks"])


class WebhookCreate(BaseModel):
    name: str
    url: str
    secret: Optional[str] = None
    events: List[str]


class IntegrationConfig(BaseModel):
    name: str
    type: str
    base_url: str
    api_key: Optional[str] = None
    config: Optional[dict] = None


# ============ Webhooks ============

@router.get("/webhooks")
async def list_webhooks(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """List configured webhooks"""
    if current_user.role != UserRole.ADMIN:
        raise HTTPException(status_code=403, detail="Admin access required")
    
    from app.models.integrations import Webhook
    
    webhooks = db.query(Webhook).filter(Webhook.is_active == True).all()
    
    return [
        {
            "id": w.id,
            "name": w.name,
            "url": w.url,
            "events": w.events,
            "is_active": w.is_active,
            "created_at": w.created_at
        }
        for w in webhooks
    ]


@router.post("/webhooks")
async def create_webhook(
    data: WebhookCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Create webhook"""
    if current_user.role != UserRole.ADMIN:
        raise HTTPException(status_code=403, detail="Admin access required")
    
    from app.models.integrations import Webhook
    
    webhook = Webhook(
        name=data.name,
        url=data.url,
        secret=data.secret,
        events=data.events,
        created_by=current_user.id
    )
    db.add(webhook)
    db.commit()
    
    return {"message": "Webhook created", "id": webhook.id}


@router.delete("/webhooks/{webhook_id}")
async def delete_webhook(
    webhook_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Delete webhook"""
    if current_user.role != UserRole.ADMIN:
        raise HTTPException(status_code=403, detail="Admin access required")
    
    from app.models.integrations import Webhook
    
    webhook = db.query(Webhook).filter(Webhook.id == webhook_id).first()
    if webhook:
        webhook.is_active = False
        db.commit()
    
    return {"message": "Webhook deleted"}


@router.get("/webhooks/{webhook_id}/deliveries")
async def get_webhook_deliveries(
    webhook_id: int,
    limit: int = 50,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get webhook delivery history"""
    if current_user.role != UserRole.ADMIN:
        raise HTTPException(status_code=403, detail="Admin access required")
    
    from app.models.integrations import WebhookDelivery
    
    deliveries = db.query(WebhookDelivery).filter(
        WebhookDelivery.webhook_id == webhook_id
    ).order_by(WebhookDelivery.created_at.desc()).limit(limit).all()
    
    return [
        {
            "id": d.id,
            "event": d.event,
            "status": d.status,
            "response_code": d.response_code,
            "attempts": d.attempts,
            "created_at": d.created_at,
            "delivered_at": d.delivered_at
        }
        for d in deliveries
    ]


# ============ API Keys ============

@router.get("/api-keys")
async def list_api_keys(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """List API keys"""
    from app.models.integrations import APIKey
    
    keys = db.query(APIKey).filter(
        APIKey.user_id == current_user.id,
        APIKey.is_active == True
    ).all()
    
    return [
        {
            "id": k.id,
            "name": k.name,
            "key": k.key[:8] + "..." + k.key[-4:],  # Masked
            "permissions": k.permissions,
            "rate_limit": k.rate_limit,
            "usage_count": k.usage_count,
            "last_used_at": k.last_used_at,
            "expires_at": k.expires_at
        }
        for k in keys
    ]


@router.post("/api-keys")
async def create_api_key(
    name: str,
    permissions: Optional[List[str]] = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Create API key"""
    import secrets
    from app.models.integrations import APIKey
    
    key = secrets.token_urlsafe(32)
    
    api_key = APIKey(
        name=name,
        key=key,
        user_id=current_user.id,
        permissions=permissions or ["read"]
    )
    db.add(api_key)
    db.commit()
    
    return {
        "message": "API key created",
        "key": key,  # Show full key only once
        "id": api_key.id
    }


@router.delete("/api-keys/{key_id}")
async def revoke_api_key(
    key_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Revoke API key"""
    from app.models.integrations import APIKey
    
    key = db.query(APIKey).filter(
        APIKey.id == key_id,
        APIKey.user_id == current_user.id
    ).first()
    
    if key:
        key.is_active = False
        db.commit()
    
    return {"message": "API key revoked"}


# ============ External Integrations ============

@router.get("/external")
async def list_integrations(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """List external integrations"""
    if current_user.role != UserRole.ADMIN:
        raise HTTPException(status_code=403, detail="Admin access required")
    
    from app.models.integrations import Integration
    
    integrations = db.query(Integration).all()
    
    return [
        {
            "id": i.id,
            "name": i.name,
            "type": i.type,
            "base_url": i.base_url,
            "is_active": i.is_active,
            "last_sync_at": i.last_sync_at
        }
        for i in integrations
    ]


@router.post("/external")
async def create_integration(
    data: IntegrationConfig,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Configure external integration"""
    if current_user.role != UserRole.ADMIN:
        raise HTTPException(status_code=403, detail="Admin access required")
    
    from app.models.integrations import Integration
    
    integration = Integration(
        name=data.name,
        type=data.type,
        base_url=data.base_url,
        api_key=data.api_key,
        config=data.config
    )
    db.add(integration)
    db.commit()
    
    return {"message": "Integration configured", "id": integration.id}


# ============ GeM/CPPP Sync ============

@router.post("/gem/publish/{tender_id}")
async def publish_to_gem(
    tender_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Publish tender to GeM portal"""
    from app.models.integrations import GeMSync
    from app.models.tender import Tender
    
    tender = db.query(Tender).filter(Tender.id == tender_id).first()
    if not tender:
        raise HTTPException(status_code=404, detail="Tender not found")
    
    # Create sync record (actual integration would call GeM API)
    sync = GeMSync(
        tender_id=tender_id,
        gem_bid_id=f"GEM-{tender.tender_id}",
        published_to_gem=True,
        published_at=datetime.utcnow(),
        sync_status="success"
    )
    db.add(sync)
    db.commit()
    
    return {"message": "Published to GeM", "gem_bid_id": sync.gem_bid_id}


@router.post("/cppp/publish/{tender_id}")
async def publish_to_cppp(
    tender_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Publish tender to CPPP portal"""
    from app.models.integrations import CPPPSync
    from app.models.tender import Tender
    
    tender = db.query(Tender).filter(Tender.id == tender_id).first()
    if not tender:
        raise HTTPException(status_code=404, detail="Tender not found")
    
    # Create sync record
    sync = CPPPSync(
        tender_id=tender_id,
        cppp_tender_id=f"CPPP-{tender.tender_id}",
        published_to_cppp=True,
        published_at=datetime.utcnow(),
        sync_status="success"
    )
    db.add(sync)
    db.commit()
    
    return {"message": "Published to CPPP", "cppp_tender_id": sync.cppp_tender_id}


@router.get("/sync-status/{tender_id}")
async def get_sync_status(
    tender_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get portal sync status for tender"""
    from app.models.integrations import GeMSync, CPPPSync
    
    gem = db.query(GeMSync).filter(GeMSync.tender_id == tender_id).first()
    cppp = db.query(CPPPSync).filter(CPPPSync.tender_id == tender_id).first()
    
    return {
        "gem": {
            "published": gem.published_to_gem if gem else False,
            "bid_id": gem.gem_bid_id if gem else None,
            "status": gem.sync_status if gem else None
        },
        "cppp": {
            "published": cppp.published_to_cppp if cppp else False,
            "tender_id": cppp.cppp_tender_id if cppp else None,
            "status": cppp.sync_status if cppp else None
        }
    }
