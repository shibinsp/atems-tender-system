import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from datetime import datetime, timedelta
from typing import Optional, List, Dict
import hashlib
import pyotp
import secrets
from app.config import settings


class NotificationService:
    """Email and SMS notification service"""
    
    @staticmethod
    async def send_email(to: str, subject: str, body: str, html: bool = True) -> bool:
        """Send email notification"""
        try:
            msg = MIMEMultipart('alternative')
            msg['Subject'] = subject
            msg['From'] = settings.SMTP_FROM or "noreply@atems.gov"
            msg['To'] = to
            
            if html:
                msg.attach(MIMEText(body, 'html'))
            else:
                msg.attach(MIMEText(body, 'plain'))
            
            # For demo, just log
            print(f"📧 Email to {to}: {subject}")
            return True
        except Exception as e:
            print(f"Email error: {e}")
            return False
    
    @staticmethod
    def get_email_template(template_name: str, data: Dict) -> str:
        """Get email template with data"""
        templates = {
            'tender_published': f"""
                <h2>New Tender Published</h2>
                <p>A new tender has been published that may interest you.</p>
                <p><strong>Tender ID:</strong> {data.get('tender_id')}</p>
                <p><strong>Title:</strong> {data.get('title')}</p>
                <p><strong>Deadline:</strong> {data.get('deadline')}</p>
                <p><a href="{data.get('link')}">View Tender</a></p>
            """,
            'deadline_reminder': f"""
                <h2>⏰ Deadline Reminder</h2>
                <p>The submission deadline for the following tender is approaching:</p>
                <p><strong>Tender:</strong> {data.get('title')}</p>
                <p><strong>Deadline:</strong> {data.get('deadline')}</p>
                <p>Only <strong>{data.get('days_left')} days</strong> remaining!</p>
            """,
            'bid_received': f"""
                <h2>New Bid Received</h2>
                <p>A new bid has been submitted for your tender.</p>
                <p><strong>Tender:</strong> {data.get('tender_title')}</p>
                <p><strong>Bidder:</strong> {data.get('bidder_name')}</p>
                <p><strong>Submitted:</strong> {data.get('submitted_at')}</p>
            """,
            'award_notification': f"""
                <h2>🎉 Contract Awarded</h2>
                <p>Congratulations! Your bid has been selected.</p>
                <p><strong>Tender:</strong> {data.get('tender_title')}</p>
                <p><strong>Contract Value:</strong> ₹{data.get('contract_value')}</p>
                <p>Please check your dashboard for next steps.</p>
            """,
            'otp': f"""
                <h2>Your OTP Code</h2>
                <p>Your one-time password is: <strong>{data.get('otp')}</strong></p>
                <p>This code expires in 10 minutes.</p>
                <p>If you didn't request this, please ignore.</p>
            """
        }
        return templates.get(template_name, data.get('message', ''))


class TwoFactorService:
    """Two-factor authentication service"""
    
    @staticmethod
    def generate_secret() -> str:
        """Generate TOTP secret"""
        return pyotp.random_base32()
    
    @staticmethod
    def get_totp_uri(secret: str, email: str) -> str:
        """Get TOTP URI for QR code"""
        totp = pyotp.TOTP(secret)
        return totp.provisioning_uri(name=email, issuer_name="ATEMS")
    
    @staticmethod
    def verify_totp(secret: str, code: str) -> bool:
        """Verify TOTP code"""
        totp = pyotp.TOTP(secret)
        return totp.verify(code)
    
    @staticmethod
    def generate_backup_codes(count: int = 10) -> List[str]:
        """Generate backup codes"""
        return [secrets.token_hex(4).upper() for _ in range(count)]
    
    @staticmethod
    def generate_otp() -> str:
        """Generate 6-digit OTP"""
        return str(secrets.randbelow(900000) + 100000)


class AuditService:
    """Blockchain-ready audit trail service"""
    
    @staticmethod
    def compute_hash(data: Dict, previous_hash: str = "") -> str:
        """Compute SHA-256 hash for audit entry"""
        content = f"{previous_hash}{data}"
        return hashlib.sha256(content.encode()).hexdigest()
    
    @staticmethod
    def create_audit_entry(
        action: str,
        entity_type: str,
        entity_id: int,
        user_id: int,
        old_values: Dict = None,
        new_values: Dict = None,
        previous_hash: str = ""
    ) -> Dict:
        """Create audit entry with hash"""
        entry = {
            'action': action,
            'entity_type': entity_type,
            'entity_id': entity_id,
            'user_id': user_id,
            'old_values': old_values,
            'new_values': new_values,
            'timestamp': datetime.utcnow().isoformat(),
            'previous_hash': previous_hash
        }
        entry['current_hash'] = AuditService.compute_hash(entry, previous_hash)
        return entry


class AnalyticsService:
    """Analytics computation service"""
    
    @staticmethod
    def calculate_savings(estimated: float, awarded: float) -> Dict:
        """Calculate savings metrics"""
        savings = estimated - awarded
        percentage = (savings / estimated * 100) if estimated > 0 else 0
        return {
            'estimated_value': estimated,
            'awarded_value': awarded,
            'savings_amount': savings,
            'savings_percentage': round(percentage, 2)
        }
    
    @staticmethod
    def calculate_cycle_time(dates: Dict) -> Dict:
        """Calculate tender cycle times"""
        def hours_between(start, end):
            if start and end:
                return int((end - start).total_seconds() / 3600)
            return None
        
        return {
            'draft_to_publish': hours_between(dates.get('created'), dates.get('published')),
            'publish_to_deadline': hours_between(dates.get('published'), dates.get('deadline')),
            'deadline_to_evaluation': hours_between(dates.get('deadline'), dates.get('evaluation_start')),
            'evaluation_to_award': hours_between(dates.get('evaluation_start'), dates.get('awarded'))
        }
    
    @staticmethod
    def calculate_competition_metrics(bids: List[Dict]) -> Dict:
        """Calculate competition metrics"""
        if not bids:
            return {}
        
        amounts = [b['amount'] for b in bids if b.get('amount')]
        if not amounts:
            return {}
        
        return {
            'total_bids': len(bids),
            'lowest_bid': min(amounts),
            'highest_bid': max(amounts),
            'average_bid': sum(amounts) / len(amounts),
            'price_spread': ((max(amounts) - min(amounts)) / min(amounts) * 100) if min(amounts) > 0 else 0
        }
