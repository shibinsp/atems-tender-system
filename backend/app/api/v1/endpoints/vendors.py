from fastapi import APIRouter, Depends, HTTPException, status, UploadFile, File
from sqlalchemy.orm import Session
from typing import List, Optional
from datetime import datetime, date
from pydantic import BaseModel, EmailStr
import uuid

from app.core.dependencies import get_db, get_current_user
from app.models.user import User, UserRole

router = APIRouter(prefix="/vendors", tags=["Vendor Portal"])


class VendorRegistrationCreate(BaseModel):
    company_name: str
    email: EmailStr
    phone: str
    registration_number: Optional[str] = None
    pan_number: Optional[str] = None
    gst_number: Optional[str] = None
    address_line1: Optional[str] = None
    city: Optional[str] = None
    state: Optional[str] = None
    pincode: Optional[str] = None
    annual_turnover: Optional[float] = None
    employee_count: Optional[int] = None
    is_msme: bool = False
    msme_number: Optional[str] = None
    categories: Optional[List[int]] = []


class VendorResponse(BaseModel):
    id: int
    company_name: str
    email: str
    status: str
    created_at: datetime

    class Config:
        from_attributes = True


class EmpanelmentRequest(BaseModel):
    vendor_id: int
    category_id: int


@router.post("/register")
async def register_vendor(
    data: VendorRegistrationCreate,
    db: Session = Depends(get_db)
):
    """Self-registration for vendors"""
    from app.models.vendor import VendorRegistration, VendorStatus
    
    # Check if email exists
    existing = db.query(VendorRegistration).filter(
        VendorRegistration.email == data.email
    ).first()
    if existing:
        raise HTTPException(status_code=400, detail="Email already registered")
    
    vendor = VendorRegistration(
        company_name=data.company_name,
        email=data.email,
        phone=data.phone,
        registration_number=data.registration_number,
        pan_number=data.pan_number,
        gst_number=data.gst_number,
        address_line1=data.address_line1,
        city=data.city,
        state=data.state,
        pincode=data.pincode,
        annual_turnover=data.annual_turnover,
        employee_count=data.employee_count,
        is_msme=data.is_msme,
        msme_number=data.msme_number,
        categories=data.categories,
        status=VendorStatus.PENDING
    )
    db.add(vendor)
    db.commit()
    db.refresh(vendor)
    
    return {"message": "Registration submitted successfully", "vendor_id": vendor.id}


@router.get("/registrations")
async def list_vendor_registrations(
    status: Optional[str] = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """List vendor registrations (Admin only)"""
    if current_user.role != UserRole.ADMIN:
        raise HTTPException(status_code=403, detail="Admin access required")
    
    from app.models.vendor import VendorRegistration
    
    query = db.query(VendorRegistration)
    if status:
        query = query.filter(VendorRegistration.status == status)
    
    vendors = query.order_by(VendorRegistration.created_at.desc()).all()
    
    return [
        {
            "id": v.id,
            "company_name": v.company_name,
            "email": v.email,
            "phone": v.phone,
            "status": v.status.value if v.status else "Pending",
            "is_msme": v.is_msme,
            "city": v.city,
            "created_at": v.created_at
        }
        for v in vendors
    ]


@router.put("/registrations/{vendor_id}/verify")
async def verify_vendor(
    vendor_id: int,
    action: str,  # approve or reject
    remarks: Optional[str] = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Verify vendor registration"""
    if current_user.role != UserRole.ADMIN:
        raise HTTPException(status_code=403, detail="Admin access required")
    
    from app.models.vendor import VendorRegistration, VendorStatus
    
    vendor = db.query(VendorRegistration).filter(VendorRegistration.id == vendor_id).first()
    if not vendor:
        raise HTTPException(status_code=404, detail="Vendor not found")
    
    if action == "approve":
        vendor.status = VendorStatus.VERIFIED
    else:
        vendor.status = VendorStatus.REJECTED
        vendor.rejection_reason = remarks
    
    vendor.verified_by = current_user.id
    vendor.verified_at = datetime.utcnow()
    
    db.commit()
    
    return {"message": f"Vendor {action}d successfully"}


@router.post("/empanelment")
async def request_empanelment(
    data: EmpanelmentRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Request category empanelment"""
    from app.models.vendor import VendorEmpanelment, EmpanelmentStatus
    
    empanelment = VendorEmpanelment(
        vendor_id=data.vendor_id,
        category_id=data.category_id,
        status=EmpanelmentStatus.APPLIED
    )
    db.add(empanelment)
    db.commit()
    
    return {"message": "Empanelment request submitted"}


@router.get("/empanelments")
async def list_empanelments(
    status: Optional[str] = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """List empanelment requests"""
    from app.models.vendor import VendorEmpanelment
    
    query = db.query(VendorEmpanelment)
    if status:
        query = query.filter(VendorEmpanelment.status == status)
    
    return query.all()


@router.put("/empanelments/{empanelment_id}")
async def process_empanelment(
    empanelment_id: int,
    action: str,
    valid_until: Optional[date] = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Approve/reject empanelment"""
    if current_user.role != UserRole.ADMIN:
        raise HTTPException(status_code=403, detail="Admin access required")
    
    from app.models.vendor import VendorEmpanelment, EmpanelmentStatus
    
    emp = db.query(VendorEmpanelment).filter(VendorEmpanelment.id == empanelment_id).first()
    if not emp:
        raise HTTPException(status_code=404, detail="Empanelment not found")
    
    if action == "approve":
        emp.status = EmpanelmentStatus.APPROVED
        emp.valid_from = datetime.utcnow()
        emp.valid_until = valid_until
    else:
        emp.status = EmpanelmentStatus.REJECTED
    
    emp.approved_by = current_user.id
    emp.approved_at = datetime.utcnow()
    
    db.commit()
    
    return {"message": f"Empanelment {action}d"}


@router.get("/performance/{vendor_id}")
async def get_vendor_performance(
    vendor_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get vendor performance history"""
    from app.models.vendor import VendorPerformance
    from app.models.bid import Bidder, Bid, BidStatus
    
    # Get bidder
    bidder = db.query(Bidder).filter(Bidder.id == vendor_id).first()
    if not bidder:
        raise HTTPException(status_code=404, detail="Vendor not found")
    
    # Get bid stats
    total_bids = db.query(Bid).filter(Bid.bidder_id == vendor_id).count()
    won_bids = db.query(Bid).filter(
        Bid.bidder_id == vendor_id,
        Bid.status == BidStatus.AWARDED
    ).count()
    
    # Get performance ratings
    ratings = db.query(VendorPerformance).filter(
        VendorPerformance.vendor_id == vendor_id
    ).all()
    
    avg_rating = sum(float(r.overall_rating or 0) for r in ratings) / len(ratings) if ratings else 0
    
    return {
        "vendor_id": vendor_id,
        "company_name": bidder.company_name,
        "total_bids": total_bids,
        "won_bids": won_bids,
        "win_rate": round(won_bids / total_bids * 100, 1) if total_bids > 0 else 0,
        "average_rating": round(avg_rating, 2),
        "performance_reviews": [
            {
                "contract_id": r.contract_id,
                "quality": float(r.quality_rating or 0),
                "delivery": float(r.delivery_rating or 0),
                "overall": float(r.overall_rating or 0),
                "comments": r.review_comments
            }
            for r in ratings
        ]
    }


@router.post("/performance")
async def add_performance_review(
    vendor_id: int,
    contract_id: int,
    quality_rating: float,
    delivery_rating: float,
    compliance_rating: float,
    communication_rating: float,
    comments: Optional[str] = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Add vendor performance review"""
    from app.models.vendor import VendorPerformance
    
    overall = (quality_rating + delivery_rating + compliance_rating + communication_rating) / 4
    
    review = VendorPerformance(
        vendor_id=vendor_id,
        contract_id=contract_id,
        quality_rating=quality_rating,
        delivery_rating=delivery_rating,
        compliance_rating=compliance_rating,
        communication_rating=communication_rating,
        overall_rating=overall,
        review_comments=comments,
        reviewed_by=current_user.id
    )
    db.add(review)
    db.commit()
    
    return {"message": "Performance review added", "overall_rating": overall}
