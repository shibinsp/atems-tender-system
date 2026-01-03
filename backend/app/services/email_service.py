"""
Email Service for ATEMS
Handles all email notifications for tender lifecycle events
"""

import asyncio
from typing import List, Optional, Dict, Any
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from datetime import datetime
import logging

# Try to import aiosmtplib, fall back gracefully if not available
try:
    import aiosmtplib
    SMTP_AVAILABLE = True
except ImportError:
    SMTP_AVAILABLE = False

from app.config import settings

logger = logging.getLogger(__name__)


class EmailConfig:
    """Email configuration - should be set via environment variables"""
    SMTP_HOST: str = "smtp.gmail.com"
    SMTP_PORT: int = 587
    SMTP_USER: str = ""  # Set via SMTP_USER env var
    SMTP_PASSWORD: str = ""  # Set via SMTP_PASSWORD env var
    FROM_EMAIL: str = "noreply@atems.gov.in"
    FROM_NAME: str = "ATEMS - Tender Management System"
    USE_TLS: bool = True


class EmailTemplate:
    """Email templates for various notifications"""

    @staticmethod
    def tender_published(tender_title: str, tender_id: str, deadline: str) -> Dict[str, str]:
        return {
            "subject": f"New Tender Published: {tender_title}",
            "body": f"""
            <html>
            <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
                <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
                    <div style="background-color: #1e3a5f; color: white; padding: 20px; text-align: center;">
                        <h1 style="margin: 0;">ATEMS</h1>
                        <p style="margin: 5px 0 0 0;">AI-Based Tender Evaluation & Management System</p>
                    </div>

                    <div style="padding: 20px; background-color: #f7fafc;">
                        <h2 style="color: #1e3a5f;">New Tender Published</h2>
                        <p>A new tender has been published that may interest you:</p>

                        <div style="background-color: white; padding: 15px; border-radius: 5px; margin: 15px 0;">
                            <h3 style="color: #1e3a5f; margin-top: 0;">{tender_title}</h3>
                            <p><strong>Tender ID:</strong> {tender_id}</p>
                            <p><strong>Submission Deadline:</strong> {deadline}</p>
                        </div>

                        <p>Please login to ATEMS to view full details and submit your bid.</p>

                        <a href="#" style="display: inline-block; background-color: #1e3a5f; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; margin-top: 10px;">View Tender</a>
                    </div>

                    <div style="padding: 15px; text-align: center; color: #666; font-size: 12px;">
                        <p>This is an automated message from ATEMS. Please do not reply to this email.</p>
                        <p>Government of India - Secure Portal</p>
                    </div>
                </div>
            </body>
            </html>
            """
        }

    @staticmethod
    def bid_submitted(bidder_name: str, tender_title: str, bid_number: str) -> Dict[str, str]:
        return {
            "subject": f"Bid Submission Confirmation - {bid_number}",
            "body": f"""
            <html>
            <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
                <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
                    <div style="background-color: #1e3a5f; color: white; padding: 20px; text-align: center;">
                        <h1 style="margin: 0;">ATEMS</h1>
                    </div>

                    <div style="padding: 20px; background-color: #f7fafc;">
                        <h2 style="color: #2e7d32;">✓ Bid Successfully Submitted</h2>
                        <p>Dear {bidder_name},</p>
                        <p>Your bid has been successfully submitted. Here are the details:</p>

                        <div style="background-color: white; padding: 15px; border-radius: 5px; margin: 15px 0;">
                            <p><strong>Bid Number:</strong> {bid_number}</p>
                            <p><strong>Tender:</strong> {tender_title}</p>
                            <p><strong>Submitted On:</strong> {datetime.now().strftime('%Y-%m-%d %H:%M:%S')} UTC</p>
                        </div>

                        <p>Please keep this confirmation for your records.</p>
                    </div>

                    <div style="padding: 15px; text-align: center; color: #666; font-size: 12px;">
                        <p>This is an automated message from ATEMS.</p>
                    </div>
                </div>
            </body>
            </html>
            """
        }

    @staticmethod
    def deadline_reminder(tender_title: str, tender_id: str, deadline: str, hours_remaining: int) -> Dict[str, str]:
        return {
            "subject": f"⏰ Deadline Reminder: {tender_title}",
            "body": f"""
            <html>
            <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
                <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
                    <div style="background-color: #d69e2e; color: white; padding: 20px; text-align: center;">
                        <h1 style="margin: 0;">⏰ Deadline Reminder</h1>
                    </div>

                    <div style="padding: 20px; background-color: #f7fafc;">
                        <h2 style="color: #c53030;">Only {hours_remaining} Hours Remaining!</h2>
                        <p>The submission deadline for the following tender is approaching:</p>

                        <div style="background-color: white; padding: 15px; border-radius: 5px; margin: 15px 0; border-left: 4px solid #c53030;">
                            <h3 style="color: #1e3a5f; margin-top: 0;">{tender_title}</h3>
                            <p><strong>Tender ID:</strong> {tender_id}</p>
                            <p><strong>Deadline:</strong> {deadline}</p>
                        </div>

                        <p>Please ensure your bid is submitted before the deadline.</p>
                    </div>
                </div>
            </body>
            </html>
            """
        }

    @staticmethod
    def evaluation_complete(bidder_name: str, tender_title: str, status: str, rank: Optional[int] = None) -> Dict[str, str]:
        status_color = "#2e7d32" if status == "Awarded" else "#1e3a5f"
        rank_text = f"<p><strong>Your Rank:</strong> {rank}</p>" if rank else ""

        return {
            "subject": f"Evaluation Results - {tender_title}",
            "body": f"""
            <html>
            <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
                <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
                    <div style="background-color: #1e3a5f; color: white; padding: 20px; text-align: center;">
                        <h1 style="margin: 0;">ATEMS</h1>
                    </div>

                    <div style="padding: 20px; background-color: #f7fafc;">
                        <h2 style="color: {status_color};">Evaluation Results Published</h2>
                        <p>Dear {bidder_name},</p>
                        <p>The evaluation for the following tender has been completed:</p>

                        <div style="background-color: white; padding: 15px; border-radius: 5px; margin: 15px 0;">
                            <h3 style="color: #1e3a5f; margin-top: 0;">{tender_title}</h3>
                            <p><strong>Your Status:</strong> <span style="color: {status_color};">{status}</span></p>
                            {rank_text}
                        </div>

                        <p>Login to ATEMS to view detailed evaluation results.</p>
                    </div>
                </div>
            </body>
            </html>
            """
        }

    @staticmethod
    def winner_declared(bidder_name: str, tender_title: str, tender_id: str) -> Dict[str, str]:
        return {
            "subject": f"🎉 Congratulations! You Won - {tender_title}",
            "body": f"""
            <html>
            <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
                <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
                    <div style="background-color: #2e7d32; color: white; padding: 20px; text-align: center;">
                        <h1 style="margin: 0;">🎉 Congratulations!</h1>
                    </div>

                    <div style="padding: 20px; background-color: #f7fafc;">
                        <h2 style="color: #2e7d32;">You Have Been Awarded the Contract!</h2>
                        <p>Dear {bidder_name},</p>
                        <p>We are pleased to inform you that your bid has been selected as the winning bid for:</p>

                        <div style="background-color: white; padding: 15px; border-radius: 5px; margin: 15px 0; border-left: 4px solid #2e7d32;">
                            <h3 style="color: #1e3a5f; margin-top: 0;">{tender_title}</h3>
                            <p><strong>Tender ID:</strong> {tender_id}</p>
                        </div>

                        <p>Please login to ATEMS to view the Letter of Intent and next steps.</p>

                        <a href="#" style="display: inline-block; background-color: #2e7d32; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; margin-top: 10px;">View Details</a>
                    </div>
                </div>
            </body>
            </html>
            """
        }

    @staticmethod
    def rfi_response(bidder_name: str, tender_title: str, question: str, response: str) -> Dict[str, str]:
        return {
            "subject": f"RFI Response - {tender_title}",
            "body": f"""
            <html>
            <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
                <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
                    <div style="background-color: #1e3a5f; color: white; padding: 20px; text-align: center;">
                        <h1 style="margin: 0;">ATEMS</h1>
                    </div>

                    <div style="padding: 20px; background-color: #f7fafc;">
                        <h2 style="color: #1e3a5f;">Response to Your Query</h2>
                        <p>Dear {bidder_name},</p>
                        <p>Your query regarding the tender "{tender_title}" has been answered:</p>

                        <div style="background-color: white; padding: 15px; border-radius: 5px; margin: 15px 0;">
                            <p><strong>Your Question:</strong></p>
                            <p style="background-color: #f0f0f0; padding: 10px; border-radius: 3px;">{question}</p>

                            <p><strong>Response:</strong></p>
                            <p style="background-color: #e8f5e9; padding: 10px; border-radius: 3px;">{response}</p>
                        </div>

                        <p>Login to ATEMS to view all RFI responses.</p>
                    </div>
                </div>
            </body>
            </html>
            """
        }


class EmailService:
    """Email service for sending notifications"""

    def __init__(self):
        self.config = EmailConfig()
        self._check_configuration()

    def _check_configuration(self):
        """Check if email is properly configured"""
        import os
        self.config.SMTP_USER = os.getenv("SMTP_USER", "")
        self.config.SMTP_PASSWORD = os.getenv("SMTP_PASSWORD", "")
        self.is_configured = bool(self.config.SMTP_USER and self.config.SMTP_PASSWORD)

        if not self.is_configured:
            logger.warning("Email service not configured. Set SMTP_USER and SMTP_PASSWORD environment variables.")

    async def send_email(
        self,
        to_emails: List[str],
        subject: str,
        html_body: str,
        text_body: Optional[str] = None
    ) -> bool:
        """
        Send an email to one or more recipients

        Args:
            to_emails: List of recipient email addresses
            subject: Email subject
            html_body: HTML content of the email
            text_body: Plain text fallback (optional)

        Returns:
            True if email was sent successfully, False otherwise
        """
        if not SMTP_AVAILABLE:
            logger.error("aiosmtplib not installed. Email sending disabled.")
            return False

        if not self.is_configured:
            logger.warning("Email not configured. Skipping email send.")
            return False

        try:
            # Create message
            message = MIMEMultipart("alternative")
            message["Subject"] = subject
            message["From"] = f"{self.config.FROM_NAME} <{self.config.FROM_EMAIL}>"
            message["To"] = ", ".join(to_emails)

            # Add plain text part
            if text_body:
                text_part = MIMEText(text_body, "plain")
                message.attach(text_part)

            # Add HTML part
            html_part = MIMEText(html_body, "html")
            message.attach(html_part)

            # Send email
            await aiosmtplib.send(
                message,
                hostname=self.config.SMTP_HOST,
                port=self.config.SMTP_PORT,
                username=self.config.SMTP_USER,
                password=self.config.SMTP_PASSWORD,
                use_tls=self.config.USE_TLS
            )

            logger.info(f"Email sent successfully to {to_emails}")
            return True

        except Exception as e:
            logger.error(f"Failed to send email: {str(e)}")
            return False

    async def send_tender_published_notification(
        self,
        to_emails: List[str],
        tender_title: str,
        tender_id: str,
        deadline: str
    ) -> bool:
        """Send notification when a tender is published"""
        template = EmailTemplate.tender_published(tender_title, tender_id, deadline)
        return await self.send_email(to_emails, template["subject"], template["body"])

    async def send_bid_submitted_notification(
        self,
        to_email: str,
        bidder_name: str,
        tender_title: str,
        bid_number: str
    ) -> bool:
        """Send bid submission confirmation"""
        template = EmailTemplate.bid_submitted(bidder_name, tender_title, bid_number)
        return await self.send_email([to_email], template["subject"], template["body"])

    async def send_deadline_reminder(
        self,
        to_emails: List[str],
        tender_title: str,
        tender_id: str,
        deadline: str,
        hours_remaining: int
    ) -> bool:
        """Send deadline reminder notification"""
        template = EmailTemplate.deadline_reminder(tender_title, tender_id, deadline, hours_remaining)
        return await self.send_email(to_emails, template["subject"], template["body"])

    async def send_evaluation_complete_notification(
        self,
        to_email: str,
        bidder_name: str,
        tender_title: str,
        status: str,
        rank: Optional[int] = None
    ) -> bool:
        """Send evaluation completion notification"""
        template = EmailTemplate.evaluation_complete(bidder_name, tender_title, status, rank)
        return await self.send_email([to_email], template["subject"], template["body"])

    async def send_winner_notification(
        self,
        to_email: str,
        bidder_name: str,
        tender_title: str,
        tender_id: str
    ) -> bool:
        """Send winner declaration notification"""
        template = EmailTemplate.winner_declared(bidder_name, tender_title, tender_id)
        return await self.send_email([to_email], template["subject"], template["body"])

    async def send_rfi_response_notification(
        self,
        to_email: str,
        bidder_name: str,
        tender_title: str,
        question: str,
        response: str
    ) -> bool:
        """Send RFI response notification"""
        template = EmailTemplate.rfi_response(bidder_name, tender_title, question, response)
        return await self.send_email([to_email], template["subject"], template["body"])


# Singleton instance
email_service = EmailService()
