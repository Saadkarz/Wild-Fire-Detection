"""
Email Notification Service for wildfire alerts.
Uses SMTP (Gmail) to send email notifications when fires are detected.
"""

import os
import smtplib
import base64
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from email.mime.image import MIMEImage
from datetime import datetime
from dotenv import load_dotenv

load_dotenv()


class EmailService:
    """Service for sending wildfire alert emails via SMTP."""
    
    def __init__(self):
        """Initialize email configuration from environment."""
        self.smtp_email = os.getenv("SMTP_EMAIL")
        self.smtp_password = os.getenv("SMTP_PASSWORD")
        self.smtp_server = os.getenv("SMTP_SERVER", "smtp.gmail.com")
        self.smtp_port = int(os.getenv("SMTP_PORT", "587"))
        self.alert_recipients = os.getenv("ALERT_RECIPIENTS", "").split(",")
        
        self.initialized = bool(self.smtp_email and self.smtp_password)
        
        if self.initialized:
            print(f"✅ Email service initialized: {self.smtp_email}")
        else:
            print("⚠️ Email credentials not found in .env")
    
    def is_available(self) -> bool:
        """Check if email service is configured."""
        return self.initialized
    
    def create_alert_html(
        self,
        zone_name: str,
        coordinates: tuple,
        confidence: float,
        prediction: str,
        detection_time: str,
        image_base64: str = None
    ) -> str:
        """
        Create HTML content for wildfire alert email.
        
        Args:
            zone_name: Name of the detected zone
            coordinates: (lat, lon) of detection
            confidence: Model confidence (0-1)
            prediction: Prediction class (Fire, Smoke, No Fire)
            detection_time: ISO timestamp of detection
            image_base64: Optional base64 encoded image
            
        Returns:
            HTML string for email body
        """
        confidence_percent = round(confidence * 100, 1)
        
        # Color based on severity
        if prediction.lower() == "fire":
            alert_color = "#dc2626"  # Red
            alert_icon = "🔥"
        elif prediction.lower() == "smoke":
            alert_color = "#f59e0b"  # Orange
            alert_icon = "💨"
        else:
            alert_color = "#22c55e"  # Green
            alert_icon = "✅"
        
        google_maps_link = f"https://www.google.com/maps?q={coordinates[0]},{coordinates[1]}"
        
        html = f"""
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="UTF-8">
            <style>
                body {{ font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background: #1a1a2e; color: #ffffff; margin: 0; padding: 20px; }}
                .container {{ max-width: 600px; margin: 0 auto; background: #16213e; border-radius: 16px; overflow: hidden; box-shadow: 0 10px 40px rgba(0,0,0,0.5); }}
                .header {{ background: linear-gradient(135deg, {alert_color}, #1a1a2e); padding: 30px; text-align: center; }}
                .header h1 {{ margin: 0; font-size: 28px; }}
                .content {{ padding: 30px; }}
                .stat-grid {{ display: grid; grid-template-columns: 1fr 1fr; gap: 15px; margin: 20px 0; }}
                .stat-box {{ background: #0f3460; padding: 15px; border-radius: 10px; border-left: 4px solid {alert_color}; }}
                .stat-label {{ color: #888; font-size: 12px; text-transform: uppercase; margin-bottom: 5px; }}
                .stat-value {{ font-size: 18px; font-weight: bold; color: {alert_color}; }}
                .image-container {{ margin: 20px 0; text-align: center; }}
                .image-container img {{ max-width: 100%; border-radius: 10px; border: 2px solid #0f3460; }}
                .button {{ display: inline-block; background: {alert_color}; color: white; padding: 12px 30px; border-radius: 8px; text-decoration: none; font-weight: bold; margin: 10px 5px; }}
                .footer {{ background: #0f3460; padding: 20px; text-align: center; font-size: 12px; color: #888; }}
            </style>
        </head>
        <body>
            <div class="container">
                <div class="header">
                    <h1>{alert_icon} WILDFIRE ALERT {alert_icon}</h1>
                    <p style="margin: 10px 0 0 0; opacity: 0.9;">{prediction.upper()} DETECTED - {zone_name}</p>
                </div>
                <div class="content">
                    <div class="stat-grid">
                        <div class="stat-box">
                            <div class="stat-label">Detection</div>
                            <div class="stat-value">{prediction}</div>
                        </div>
                        <div class="stat-box">
                            <div class="stat-label">Confidence</div>
                            <div class="stat-value">{confidence_percent}%</div>
                        </div>
                        <div class="stat-box">
                            <div class="stat-label">Zone</div>
                            <div class="stat-value">{zone_name}</div>
                        </div>
                        <div class="stat-box">
                            <div class="stat-label">Coordinates</div>
                            <div class="stat-value">{coordinates[0]:.4f}, {coordinates[1]:.4f}</div>
                        </div>
                    </div>
                    
                    <p><strong>Detection Time:</strong> {detection_time}</p>
                    
                    {"<div class='image-container'><p><strong>Satellite Image:</strong></p><img src='cid:satellite_image' alt='Satellite view'/></div>" if image_base64 else ""}
                    
                    <div style="text-align: center; margin-top: 20px;">
                        <a href="{google_maps_link}" class="button">📍 View on Google Maps</a>
                    </div>
                </div>
                <div class="footer">
                    <p>WildfireGuard AI - Satellite Monitoring System</p>
                    <p>This is an automated alert. Please verify before taking action.</p>
                </div>
            </div>
        </body>
        </html>
        """
        
        return html
    
    def send_alert(
        self,
        zone_name: str,
        coordinates: tuple,
        confidence: float,
        prediction: str,
        image_base64: str = None,
        recipients: list = None
    ) -> dict:
        """
        Send wildfire alert email.
        
        Args:
            zone_name: Name of the detected zone
            coordinates: (lat, lon) of detection
            confidence: Model confidence (0-1)
            prediction: Prediction class
            image_base64: Optional base64 encoded satellite image
            recipients: Optional list of email recipients
            
        Returns:
            dict with success status and message
        """
        if not self.is_available():
            return {"success": False, "error": "Email service not configured"}
        
        to_emails = recipients or self.alert_recipients
        to_emails = [e.strip() for e in to_emails if e.strip()]
        
        if not to_emails:
            return {"success": False, "error": "No recipients configured"}
        
        try:
            detection_time = datetime.now().strftime("%Y-%m-%d %H:%M:%S UTC")
            
            # Create message
            msg = MIMEMultipart('related')
            msg['Subject'] = f"🔥 WILDFIRE ALERT: {prediction} detected in {zone_name}"
            msg['From'] = self.smtp_email
            msg['To'] = ", ".join(to_emails)
            
            # HTML body
            html_content = self.create_alert_html(
                zone_name=zone_name,
                coordinates=coordinates,
                confidence=confidence,
                prediction=prediction,
                detection_time=detection_time,
                image_base64=image_base64
            )
            
            html_part = MIMEText(html_content, 'html')
            msg.attach(html_part)
            
            # Attach image if provided
            if image_base64:
                try:
                    image_data = base64.b64decode(image_base64)
                    img = MIMEImage(image_data)
                    img.add_header('Content-ID', '<satellite_image>')
                    img.add_header('Content-Disposition', 'inline', filename='satellite.png')
                    msg.attach(img)
                except Exception as img_error:
                    print(f"Could not attach image: {img_error}")
            
            # Send email
            with smtplib.SMTP(self.smtp_server, self.smtp_port) as server:
                server.starttls()
                server.login(self.smtp_email, self.smtp_password)
                server.send_message(msg)
            
            return {
                "success": True,
                "message": f"Alert sent to {len(to_emails)} recipient(s)",
                "recipients": to_emails
            }
            
        except smtplib.SMTPAuthenticationError:
            return {"success": False, "error": "SMTP authentication failed. Check credentials."}
        except Exception as e:
            return {"success": False, "error": str(e)}
    
    def send_test_email(self, recipient: str = None) -> dict:
        """
        Send a test email to verify configuration.
        
        Args:
            recipient: Optional specific recipient, defaults to first configured
            
        Returns:
            dict with success status
        """
        if not self.is_available():
            return {"success": False, "error": "Email service not configured"}
        
        test_recipient = recipient or (self.alert_recipients[0] if self.alert_recipients else None)
        
        if not test_recipient:
            return {"success": False, "error": "No test recipient available"}
        
        return self.send_alert(
            zone_name="Test Zone",
            coordinates=(32.0, -6.0),
            confidence=0.95,
            prediction="Test Alert",
            recipients=[test_recipient]
        )


# Singleton instance
email_service = EmailService()
