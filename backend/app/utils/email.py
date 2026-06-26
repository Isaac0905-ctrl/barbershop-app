import aiosmtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from dotenv import load_dotenv
import os

load_dotenv(dotenv_path=os.path.expanduser("~/barbershop-app/.env"))

async def send_email(to: str, subject: str, body: str):
    smtp_host = os.getenv("SMTP_HOST")
    smtp_port = int(os.getenv("SMTP_PORT", 587))
    smtp_user = os.getenv("SMTP_USER")
    smtp_pass = os.getenv("SMTP_PASSWORD")

    print(f"Enviando email a {to} via {smtp_host}:{smtp_port} como {smtp_user}")

    message = MIMEMultipart("alternative")
    message["From"] = smtp_user
    message["To"] = to
    message["Subject"] = subject
    message.attach(MIMEText(body, "html"))

    await aiosmtplib.send(
        message,
        hostname=smtp_host,
        port=smtp_port,
        username=smtp_user,
        password=smtp_pass,
        start_tls=True,
    )

async def send_new_appointment_email(barber_email: str, barber_name: str, client_name: str, service_name: str, scheduled_at: str):
    subject = f"Nueva cita agendada - {client_name}"
    body = f"""
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #f59e0b;">Nueva cita pendiente de confirmacion</h2>
        <p>Hola <strong>{barber_name}</strong>,</p>
        <p>Tienes una nueva cita agendada:</p>
        <div style="background: #1f2937; color: white; padding: 20px; border-radius: 12px; margin: 20px 0;">
            <p><strong>Cliente:</strong> {client_name}</p>
            <p><strong>Servicio:</strong> {service_name}</p>
            <p><strong>Fecha y hora:</strong> {scheduled_at}</p>
        </div>
        <a href="http://localhost:5173/dashboard"
           style="background: #f59e0b; color: #111; padding: 12px 24px; border-radius: 24px; text-decoration: none; font-weight: bold;">
            Ver dashboard
        </a>
        <p style="color: #6b7280; margin-top: 20px; font-size: 14px;">Barberia Clasica</p>
    </div>
    """
    await send_email(barber_email, subject, body)

async def send_confirmation_email(client_email: str, client_name: str, service_name: str, barber_name: str, scheduled_at: str):
    subject = "Tu cita ha sido confirmada"
    body = f"""
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #10b981;">Tu cita esta confirmada</h2>
        <p>Hola <strong>{client_name}</strong>,</p>
        <p>Tu cita ha sido confirmada:</p>
        <div style="background: #1f2937; color: white; padding: 20px; border-radius: 12px; margin: 20px 0;">
            <p><strong>Servicio:</strong> {service_name}</p>
            <p><strong>Barbero:</strong> {barber_name}</p>
            <p><strong>Fecha y hora:</strong> {scheduled_at}</p>
        </div>
        <p style="color: #6b7280; margin-top: 20px; font-size: 14px;">Barberia Clasica</p>
    </div>
    """
    await send_email(client_email, subject, body)

async def send_cancellation_email(client_email: str, client_name: str, service_name: str, barber_name: str, scheduled_at: str, reason: str):
    subject = "Tu cita ha sido cancelada"
    body = f"""
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #ef4444;">Tu cita ha sido cancelada</h2>
        <p>Hola <strong>{client_name}</strong>,</p>
        <p>Lamentamos informarte que tu cita ha sido cancelada:</p>
        <div style="background: #1f2937; color: white; padding: 20px; border-radius: 12px; margin: 20px 0;">
            <p><strong>Servicio:</strong> {service_name}</p>
            <p><strong>Barbero:</strong> {barber_name}</p>
            <p><strong>Fecha y hora:</strong> {scheduled_at}</p>
            <p><strong>Motivo:</strong> {reason}</p>
        </div>
        <a href="http://localhost:5173/booking"
           style="background: #f59e0b; color: #111; padding: 12px 24px; border-radius: 24px; text-decoration: none; font-weight: bold;">
            Volver a reservar
        </a>
        <p style="color: #6b7280; margin-top: 20px; font-size: 14px;">Barberia Clasica</p>
    </div>
    """
    await send_email(client_email, subject, body)
