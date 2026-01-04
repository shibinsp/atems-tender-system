from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List, Optional
from datetime import datetime
from pydantic import BaseModel

from app.core.dependencies import get_db, get_current_user
from app.models.user import User, UserRole

router = APIRouter(prefix="/communications", tags=["Communications & Collaboration"])


class MessageCreate(BaseModel):
    recipient_id: int
    subject: str
    content: str
    tender_id: Optional[int] = None
    parent_id: Optional[int] = None


class TaskCreate(BaseModel):
    title: str
    description: Optional[str] = None
    assigned_to: int
    tender_id: Optional[int] = None
    contract_id: Optional[int] = None
    priority: str = "medium"
    due_date: Optional[datetime] = None


class PreBidMeetingCreate(BaseModel):
    tender_id: int
    title: str
    description: Optional[str] = None
    meeting_date: datetime
    meeting_link: Optional[str] = None
    venue: Optional[str] = None
    is_online: bool = True


# ============ Messaging ============

@router.get("/messages")
async def get_messages(
    folder: str = "inbox",  # inbox, sent
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get user messages"""
    from app.models.notifications import Message
    
    if folder == "inbox":
        messages = db.query(Message).filter(
            Message.recipient_id == current_user.id
        ).order_by(Message.created_at.desc()).all()
    else:
        messages = db.query(Message).filter(
            Message.sender_id == current_user.id
        ).order_by(Message.created_at.desc()).all()
    
    return [
        {
            "id": m.id,
            "subject": m.subject,
            "content": m.content[:100] + "..." if len(m.content) > 100 else m.content,
            "sender": m.sender.full_name if m.sender else None,
            "recipient": m.recipient.full_name if m.recipient else None,
            "is_read": m.is_read,
            "tender_id": m.tender_id,
            "created_at": m.created_at
        }
        for m in messages
    ]


@router.post("/messages")
async def send_message(
    data: MessageCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Send a message"""
    from app.models.notifications import Message
    
    message = Message(
        sender_id=current_user.id,
        recipient_id=data.recipient_id,
        subject=data.subject,
        content=data.content,
        tender_id=data.tender_id,
        parent_id=data.parent_id
    )
    db.add(message)
    db.commit()
    
    return {"message": "Message sent", "id": message.id}


@router.get("/messages/{message_id}")
async def get_message(
    message_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get message details"""
    from app.models.notifications import Message
    
    message = db.query(Message).filter(Message.id == message_id).first()
    if not message:
        raise HTTPException(status_code=404, detail="Message not found")
    
    if message.recipient_id != current_user.id and message.sender_id != current_user.id:
        raise HTTPException(status_code=403, detail="Access denied")
    
    # Mark as read
    if message.recipient_id == current_user.id and not message.is_read:
        message.is_read = True
        message.read_at = datetime.utcnow()
        db.commit()
    
    return {
        "id": message.id,
        "subject": message.subject,
        "content": message.content,
        "sender": {"id": message.sender.id, "name": message.sender.full_name} if message.sender else None,
        "recipient": {"id": message.recipient.id, "name": message.recipient.full_name} if message.recipient else None,
        "tender_id": message.tender_id,
        "is_read": message.is_read,
        "created_at": message.created_at
    }


@router.get("/messages/unread-count")
async def get_unread_count(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get unread message count"""
    from app.models.notifications import Message
    
    count = db.query(Message).filter(
        Message.recipient_id == current_user.id,
        Message.is_read == False
    ).count()
    
    return {"unread_count": count}


# ============ Tasks ============

@router.get("/tasks")
async def get_tasks(
    status: Optional[str] = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get assigned tasks"""
    from app.models.notifications import Task
    
    query = db.query(Task).filter(Task.assigned_to == current_user.id)
    
    if status:
        query = query.filter(Task.status == status)
    
    tasks = query.order_by(Task.due_date.asc()).all()
    
    return [
        {
            "id": t.id,
            "title": t.title,
            "description": t.description,
            "priority": t.priority,
            "status": t.status,
            "due_date": t.due_date,
            "assigned_by": t.assigner.full_name if t.assigner else None,
            "tender_id": t.tender_id,
            "created_at": t.created_at
        }
        for t in tasks
    ]


@router.post("/tasks")
async def create_task(
    data: TaskCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Create a task"""
    from app.models.notifications import Task
    
    task = Task(
        title=data.title,
        description=data.description,
        assigned_to=data.assigned_to,
        assigned_by=current_user.id,
        tender_id=data.tender_id,
        contract_id=data.contract_id,
        priority=data.priority,
        due_date=data.due_date
    )
    db.add(task)
    db.commit()
    
    return {"message": "Task created", "id": task.id}


@router.put("/tasks/{task_id}/status")
async def update_task_status(
    task_id: int,
    status: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Update task status"""
    from app.models.notifications import Task
    
    task = db.query(Task).filter(Task.id == task_id).first()
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")
    
    task.status = status
    if status == "completed":
        task.completed_at = datetime.utcnow()
    
    db.commit()
    
    return {"message": "Task updated"}


# ============ Pre-Bid Meetings ============

@router.get("/prebid-meetings")
async def get_prebid_meetings(
    tender_id: Optional[int] = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get pre-bid meetings"""
    from app.models.notifications import PreBidMeeting
    
    query = db.query(PreBidMeeting)
    if tender_id:
        query = query.filter(PreBidMeeting.tender_id == tender_id)
    
    meetings = query.order_by(PreBidMeeting.meeting_date.desc()).all()
    
    return [
        {
            "id": m.id,
            "tender_id": m.tender_id,
            "title": m.title,
            "description": m.description,
            "meeting_date": m.meeting_date,
            "meeting_link": m.meeting_link,
            "venue": m.venue,
            "is_online": m.is_online
        }
        for m in meetings
    ]


@router.post("/prebid-meetings")
async def create_prebid_meeting(
    data: PreBidMeetingCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Schedule pre-bid meeting"""
    from app.models.notifications import PreBidMeeting
    
    meeting = PreBidMeeting(
        tender_id=data.tender_id,
        title=data.title,
        description=data.description,
        meeting_date=data.meeting_date,
        meeting_link=data.meeting_link,
        venue=data.venue,
        is_online=data.is_online,
        created_by=current_user.id
    )
    db.add(meeting)
    db.commit()
    
    return {"message": "Meeting scheduled", "id": meeting.id}


# ============ Notifications ============

@router.get("/notifications")
async def get_notifications(
    unread_only: bool = False,
    limit: int = 20,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get user notifications"""
    from app.models.audit import Notification
    
    query = db.query(Notification).filter(Notification.user_id == current_user.id)
    
    if unread_only:
        query = query.filter(Notification.is_read == False)
    
    notifications = query.order_by(Notification.created_at.desc()).limit(limit).all()
    
    return [
        {
            "id": n.id,
            "title": n.title,
            "message": n.message,
            "type": n.type,
            "link": n.link,
            "is_read": n.is_read,
            "created_at": n.created_at
        }
        for n in notifications
    ]


@router.put("/notifications/{notification_id}/read")
async def mark_notification_read(
    notification_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Mark notification as read"""
    from app.models.audit import Notification
    
    notification = db.query(Notification).filter(
        Notification.id == notification_id,
        Notification.user_id == current_user.id
    ).first()
    
    if notification:
        notification.is_read = True
        db.commit()
    
    return {"message": "Marked as read"}


@router.put("/notifications/read-all")
async def mark_all_read(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Mark all notifications as read"""
    from app.models.audit import Notification
    
    db.query(Notification).filter(
        Notification.user_id == current_user.id,
        Notification.is_read == False
    ).update({"is_read": True})
    db.commit()
    
    return {"message": "All marked as read"}
