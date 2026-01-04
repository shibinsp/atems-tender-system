from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from datetime import datetime, date
import uuid

from app.core.dependencies import get_db, get_current_user, require_tender_officer
from app.models.user import User, UserRole
from app.models.tender import Tender, TenderStatus
from app.models.bid import Bid, BidStatus, BankGuarantee
from app.models.contract import Contract, ContractStatus, PurchaseOrder, Invoice, ContractMilestone, Delivery, Corrigendum, VendorBlacklist, PaymentStatus, BGStatus
from app.schemas.contract import (
    ContractCreate, ContractResponse, LoICreate, LoACreate,
    POCreate, POResponse, InvoiceCreate, InvoiceResponse, InvoiceApproval,
    CorrigendumCreate, CorrigendumResponse, BlacklistCreate, BlacklistResponse,
    BGValidation, BGResponse, DeliveryCreate, DeliveryResponse,
    MilestoneCreate, MilestoneResponse
)

router = APIRouter(prefix="/contracts", tags=["Contracts & Post-Award"])


def generate_number(prefix: str) -> str:
    return f"{prefix}-{datetime.now().strftime('%Y%m%d')}-{str(uuid.uuid4())[:6].upper()}"


# ============ LoI / LoA Endpoints ============

@router.post("/loi", response_model=ContractResponse)
async def issue_loi(
    data: LoICreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_tender_officer)
):
    """Issue Letter of Intent to winning bidder"""
    bid = db.query(Bid).filter(Bid.id == data.bid_id).first()
    if not bid:
        raise HTTPException(status_code=404, detail="Bid not found")
    
    tender = db.query(Tender).filter(Tender.id == data.tender_id).first()
    if tender.status not in [TenderStatus.EVALUATED, TenderStatus.AWARDED]:
        raise HTTPException(status_code=400, detail="Tender must be evaluated first")
    
    contract = Contract(
        contract_number=generate_number("CON"),
        tender_id=data.tender_id,
        bid_id=data.bid_id,
        bidder_id=bid.bidder_id,
        title=tender.title,
        contract_value=data.contract_value,
        status=ContractStatus.LOI_ISSUED,
        loi_date=datetime.utcnow(),
        created_by=current_user.id
    )
    db.add(contract)
    
    bid.status = BidStatus.AWARDED
    tender.status = TenderStatus.AWARDED
    
    db.commit()
    db.refresh(contract)
    return contract


@router.post("/{contract_id}/loa", response_model=ContractResponse)
async def issue_loa(
    contract_id: int,
    data: LoACreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_tender_officer)
):
    """Issue Letter of Acceptance after vendor accepts LoI"""
    contract = db.query(Contract).filter(Contract.id == contract_id).first()
    if not contract:
        raise HTTPException(status_code=404, detail="Contract not found")
    
    if contract.status != ContractStatus.LOI_ISSUED:
        raise HTTPException(status_code=400, detail="LoI must be issued first")
    
    contract.status = ContractStatus.LOA_ISSUED
    contract.loa_date = datetime.utcnow()
    contract.start_date = data.start_date
    contract.end_date = data.end_date
    
    db.commit()
    db.refresh(contract)
    return contract


@router.post("/{contract_id}/activate", response_model=ContractResponse)
async def activate_contract(
    contract_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_tender_officer)
):
    """Activate contract after BG verification"""
    contract = db.query(Contract).filter(Contract.id == contract_id).first()
    if not contract:
        raise HTTPException(status_code=404, detail="Contract not found")
    
    contract.status = ContractStatus.ACTIVE
    db.commit()
    db.refresh(contract)
    return contract


@router.get("", response_model=List[ContractResponse])
async def list_contracts(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """List all contracts"""
    return db.query(Contract).order_by(Contract.created_at.desc()).all()


@router.get("/{contract_id}", response_model=ContractResponse)
async def get_contract(
    contract_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get contract details"""
    contract = db.query(Contract).filter(Contract.id == contract_id).first()
    if not contract:
        raise HTTPException(status_code=404, detail="Contract not found")
    return contract


# ============ Purchase Order Endpoints ============

@router.post("/po", response_model=POResponse)
async def create_purchase_order(
    data: POCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_tender_officer)
):
    """Create Purchase Order for a contract"""
    contract = db.query(Contract).filter(Contract.id == data.contract_id).first()
    if not contract:
        raise HTTPException(status_code=404, detail="Contract not found")
    
    if contract.status not in [ContractStatus.LOA_ISSUED, ContractStatus.ACTIVE]:
        raise HTTPException(status_code=400, detail="Contract must have LoA issued")
    
    po = PurchaseOrder(
        po_number=generate_number("PO"),
        contract_id=data.contract_id,
        po_date=date.today(),
        delivery_date=data.delivery_date,
        amount=data.amount,
        description=data.description,
        created_by=current_user.id
    )
    db.add(po)
    db.commit()
    db.refresh(po)
    return po


@router.get("/po/{po_id}", response_model=POResponse)
async def get_purchase_order(
    po_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get PO details"""
    po = db.query(PurchaseOrder).filter(PurchaseOrder.id == po_id).first()
    if not po:
        raise HTTPException(status_code=404, detail="PO not found")
    return po


# ============ Invoice & Payment Endpoints ============

@router.post("/invoice", response_model=InvoiceResponse)
async def submit_invoice(
    data: InvoiceCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Submit invoice against a PO"""
    po = db.query(PurchaseOrder).filter(PurchaseOrder.id == data.po_id).first()
    if not po:
        raise HTTPException(status_code=404, detail="PO not found")
    
    total = data.amount + (data.tax_amount or 0)
    
    invoice = Invoice(
        invoice_number=data.invoice_number,
        po_id=data.po_id,
        invoice_date=data.invoice_date,
        amount=data.amount,
        tax_amount=data.tax_amount,
        total_amount=total,
        status=PaymentStatus.PENDING
    )
    db.add(invoice)
    db.commit()
    db.refresh(invoice)
    return invoice


@router.put("/invoice/{invoice_id}/approve", response_model=InvoiceResponse)
async def approve_invoice(
    invoice_id: int,
    data: InvoiceApproval,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_tender_officer)
):
    """Approve or reject invoice"""
    invoice = db.query(Invoice).filter(Invoice.id == invoice_id).first()
    if not invoice:
        raise HTTPException(status_code=404, detail="Invoice not found")
    
    invoice.status = data.status
    invoice.approved_by = current_user.id
    invoice.approved_at = datetime.utcnow()
    
    if data.status == PaymentStatus.PAID:
        invoice.payment_date = date.today()
        invoice.payment_reference = data.payment_reference
    
    db.commit()
    db.refresh(invoice)
    return invoice


# ============ Bank Guarantee Endpoints ============

@router.get("/bg/expiring", response_model=List[BGResponse])
async def get_expiring_bgs(
    days: int = 30,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_tender_officer)
):
    """Get BGs expiring within specified days"""
    from datetime import timedelta
    expiry_date = date.today() + timedelta(days=days)
    
    bgs = db.query(BankGuarantee).filter(
        BankGuarantee.expiry_date <= expiry_date,
        BankGuarantee.status == "Active"
    ).all()
    return bgs


@router.put("/bg/{bg_id}/verify", response_model=BGResponse)
async def verify_bg(
    bg_id: int,
    data: BGValidation,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_tender_officer)
):
    """Verify bank guarantee"""
    bg = db.query(BankGuarantee).filter(BankGuarantee.id == bg_id).first()
    if not bg:
        raise HTTPException(status_code=404, detail="BG not found")
    
    bg.status = "Verified" if data.is_valid else "Rejected"
    bg.verified_by = current_user.id
    bg.verified_at = datetime.utcnow()
    
    db.commit()
    db.refresh(bg)
    return bg


@router.put("/bg/{bg_id}/release")
async def release_bg(
    bg_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_tender_officer)
):
    """Release bank guarantee after contract completion"""
    bg = db.query(BankGuarantee).filter(BankGuarantee.id == bg_id).first()
    if not bg:
        raise HTTPException(status_code=404, detail="BG not found")
    
    bg.status = "Released"
    db.commit()
    return {"message": "BG released successfully"}


# ============ Delivery & GRN Endpoints ============

@router.post("/delivery", response_model=DeliveryResponse)
async def record_delivery(
    data: DeliveryCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_tender_officer)
):
    """Record delivery and generate GRN"""
    delivery = Delivery(
        contract_id=data.contract_id,
        grn_number=generate_number("GRN"),
        delivery_date=data.delivery_date,
        received_by=current_user.id,
        quantity=data.quantity,
        description=data.description,
        status="Received"
    )
    db.add(delivery)
    db.commit()
    db.refresh(delivery)
    return delivery


# ============ Corrigendum Endpoints ============

@router.post("/corrigendum", response_model=CorrigendumResponse)
async def publish_corrigendum(
    data: CorrigendumCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_tender_officer)
):
    """Publish corrigendum/amendment for a tender"""
    tender = db.query(Tender).filter(Tender.id == data.tender_id).first()
    if not tender:
        raise HTTPException(status_code=404, detail="Tender not found")
    
    if tender.status != TenderStatus.PUBLISHED:
        raise HTTPException(status_code=400, detail="Can only add corrigendum to published tenders")
    
    count = db.query(Corrigendum).filter(Corrigendum.tender_id == data.tender_id).count()
    
    corrigendum = Corrigendum(
        tender_id=data.tender_id,
        corrigendum_number=f"COR-{count + 1}",
        subject=data.subject,
        description=data.description,
        changes=data.changes,
        new_submission_deadline=data.new_submission_deadline,
        new_opening_date=data.new_opening_date,
        published_by=current_user.id
    )
    db.add(corrigendum)
    
    # Update tender dates if provided
    if data.new_submission_deadline:
        tender.submission_deadline = data.new_submission_deadline
    if data.new_opening_date:
        tender.technical_opening_date = data.new_opening_date
    
    db.commit()
    db.refresh(corrigendum)
    return corrigendum


@router.get("/corrigendum/tender/{tender_id}", response_model=List[CorrigendumResponse])
async def get_tender_corrigenda(
    tender_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get all corrigenda for a tender"""
    return db.query(Corrigendum).filter(Corrigendum.tender_id == tender_id).order_by(Corrigendum.published_at).all()


# ============ Vendor Blacklist Endpoints ============

@router.post("/blacklist", response_model=BlacklistResponse)
async def blacklist_vendor(
    data: BlacklistCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_tender_officer)
):
    """Blacklist/debar a vendor"""
    if current_user.role != UserRole.ADMIN:
        raise HTTPException(status_code=403, detail="Only admin can blacklist vendors")
    
    blacklist = VendorBlacklist(
        bidder_id=data.bidder_id,
        reason=data.reason,
        blacklist_date=data.blacklist_date,
        expiry_date=data.expiry_date,
        is_permanent=data.is_permanent,
        reference_tender_id=data.reference_tender_id,
        created_by=current_user.id
    )
    db.add(blacklist)
    db.commit()
    db.refresh(blacklist)
    return blacklist


@router.get("/blacklist", response_model=List[BlacklistResponse])
async def get_blacklisted_vendors(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get all blacklisted vendors"""
    return db.query(VendorBlacklist).filter(
        (VendorBlacklist.is_permanent == True) |
        (VendorBlacklist.expiry_date >= date.today())
    ).all()


@router.delete("/blacklist/{blacklist_id}")
async def remove_from_blacklist(
    blacklist_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_tender_officer)
):
    """Remove vendor from blacklist"""
    if current_user.role != UserRole.ADMIN:
        raise HTTPException(status_code=403, detail="Only admin can remove from blacklist")
    
    blacklist = db.query(VendorBlacklist).filter(VendorBlacklist.id == blacklist_id).first()
    if not blacklist:
        raise HTTPException(status_code=404, detail="Blacklist entry not found")
    
    db.delete(blacklist)
    db.commit()
    return {"message": "Vendor removed from blacklist"}


# ============ Milestone Endpoints ============

@router.post("/milestone", response_model=MilestoneResponse)
async def create_milestone(
    data: MilestoneCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_tender_officer)
):
    """Create contract milestone"""
    milestone = ContractMilestone(
        contract_id=data.contract_id,
        milestone_name=data.milestone_name,
        description=data.description,
        due_date=data.due_date,
        payment_percentage=data.payment_percentage
    )
    db.add(milestone)
    db.commit()
    db.refresh(milestone)
    return milestone


@router.put("/milestone/{milestone_id}/complete")
async def complete_milestone(
    milestone_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_tender_officer)
):
    """Mark milestone as completed"""
    milestone = db.query(ContractMilestone).filter(ContractMilestone.id == milestone_id).first()
    if not milestone:
        raise HTTPException(status_code=404, detail="Milestone not found")
    
    milestone.status = "Completed"
    milestone.completion_date = date.today()
    db.commit()
    return {"message": "Milestone completed"}


# ============ Approval Workflow Endpoints ============

from app.models.contract import TenderApproval, ApprovalStatus as ModelApprovalStatus, ApprovalType as ModelApprovalType
from app.schemas.contract import ApprovalCreate, ApprovalAction, ApprovalResponse

@router.post("/approval", response_model=ApprovalResponse)
async def request_approval(
    data: ApprovalCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_tender_officer)
):
    """Request approval for tender (Budget/Technical/Legal/Final)"""
    tender = db.query(Tender).filter(Tender.id == data.tender_id).first()
    if not tender:
        raise HTTPException(status_code=404, detail="Tender not found")
    
    approval = TenderApproval(
        tender_id=data.tender_id,
        approval_type=data.approval_type,
        budget_head=data.budget_head,
        cost_center=data.cost_center,
        estimated_amount=data.estimated_amount,
        remarks=data.remarks
    )
    db.add(approval)
    db.commit()
    db.refresh(approval)
    return approval


@router.get("/approval/tender/{tender_id}", response_model=List[ApprovalResponse])
async def get_tender_approvals(
    tender_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get all approvals for a tender"""
    return db.query(TenderApproval).filter(TenderApproval.tender_id == tender_id).all()


@router.get("/approval/pending", response_model=List[ApprovalResponse])
async def get_pending_approvals(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get all pending approvals"""
    if current_user.role not in [UserRole.ADMIN, UserRole.TENDER_OFFICER]:
        raise HTTPException(status_code=403, detail="Not authorized")
    
    return db.query(TenderApproval).filter(
        TenderApproval.status == ModelApprovalStatus.PENDING
    ).all()


@router.put("/approval/{approval_id}", response_model=ApprovalResponse)
async def process_approval(
    approval_id: int,
    data: ApprovalAction,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Approve or reject an approval request"""
    if current_user.role not in [UserRole.ADMIN, UserRole.TENDER_OFFICER]:
        raise HTTPException(status_code=403, detail="Not authorized to approve")
    
    approval = db.query(TenderApproval).filter(TenderApproval.id == approval_id).first()
    if not approval:
        raise HTTPException(status_code=404, detail="Approval not found")
    
    approval.status = data.status
    approval.approver_id = current_user.id
    approval.approved_at = datetime.utcnow()
    approval.remarks = data.remarks
    
    db.commit()
    db.refresh(approval)
    return approval
