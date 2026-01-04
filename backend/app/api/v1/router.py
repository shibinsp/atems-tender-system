from fastapi import APIRouter
from app.api.v1.endpoints import (
    auth, tenders, bids, evaluation, dashboard, admin, ai, exports, contracts,
    analytics, vendors, security, communications, integrations
)

api_router = APIRouter()

# Core endpoints
api_router.include_router(auth.router)
api_router.include_router(dashboard.router)
api_router.include_router(tenders.router)
api_router.include_router(bids.router)
api_router.include_router(evaluation.router)
api_router.include_router(admin.router)
api_router.include_router(ai.router)
api_router.include_router(exports.router)
api_router.include_router(contracts.router)

# New feature endpoints
api_router.include_router(analytics.router)
api_router.include_router(vendors.router)
api_router.include_router(security.router)
api_router.include_router(communications.router)
api_router.include_router(integrations.router)
