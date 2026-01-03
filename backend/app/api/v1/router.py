from fastapi import APIRouter
from app.api.v1.endpoints import auth, tenders, bids, evaluation, dashboard, admin, ai, exports

api_router = APIRouter()

# Include all endpoint routers
api_router.include_router(auth.router)
api_router.include_router(dashboard.router)
api_router.include_router(tenders.router)
api_router.include_router(bids.router)
api_router.include_router(evaluation.router)
api_router.include_router(admin.router)
api_router.include_router(ai.router)
api_router.include_router(exports.router)
