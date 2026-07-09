from fastapi import FastAPI, APIRouter
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
import os
import logging
from pathlib import Path
from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime, timezone
import aiosmtplib
from email.message import EmailMessage

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

app = FastAPI()
api_router = APIRouter(prefix="/api")

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)


# --- Models ---
class CalculatorInfo(BaseModel):
    room_type: str
    area: float
    repair_type: str
    addons: List[str] = []
    estimated_price: float


class LeadCreate(BaseModel):
    name: str
    phone: str
    comment: Optional[str] = None
    calculator: Optional[CalculatorInfo] = None


class LeadResponse(BaseModel):
    name: str
    phone: str
    comment: Optional[str] = None
    calculator: Optional[CalculatorInfo] = None
    email_sent: bool = False
    email_error: Optional[str] = None
    created_at: datetime


# --- SMTP helper ---
async def send_lead_email(name: str, phone: str, comment: Optional[str], calculator: Optional[CalculatorInfo]) -> tuple[bool, Optional[str]]:
    smtp_host = os.environ.get("SMTP_HOST", "")
    smtp_port = os.environ.get("SMTP_PORT", "")
    smtp_user = os.environ.get("SMTP_USER", "")
    smtp_password = os.environ.get("SMTP_PASSWORD", "")
    recipient_email = os.environ.get("RECIPIENT_EMAIL", "lax-jakal@yandex.ru")

    if not smtp_host or not smtp_user or not smtp_password:
        logger.warning("SMTP is not configured — running in NO-EMAIL mode. Lead is logged instead of being emailed.")
        return False, "SMTP not configured (no-email mode)"

    message = EmailMessage()
    message["From"] = smtp_user
    message["To"] = recipient_email
    message["Subject"] = f"Новая заявка с сайта ФОРМАТ от {name}"

    body = "Новая заявка с сайта компании ФОРМАТ (Ремонт под ключ, Иркутск)\n\n"
    body += f"Имя: {name}\n"
    body += f"Телефон: {phone}\n"
    if comment:
        body += f"Комментарий: {comment}\n"

    if calculator:
        body += "\n=== ДАННЫЕ КАЛЬКУЛЯТОРА ===\n"
        body += f"Тип помещения: {calculator.room_type}\n"
        body += f"Площадь: {calculator.area} кв. м.\n"
        body += f"Тип ремонта: {calculator.repair_type}\n"
        if calculator.addons:
            body += f"Дополнительные работы: {', '.join(calculator.addons)}\n"
        body += f"Предварительный расчет стоимости: {calculator.estimated_price:,.0f} ₽\n"

    message.set_content(body)

    try:
        port = int(smtp_port) if smtp_port else 465
        use_tls = (port == 465)

        await aiosmtplib.send(
            message,
            hostname=smtp_host,
            port=port,
            username=smtp_user,
            password=smtp_password,
            use_tls=use_tls,
            start_tls=not use_tls and (port == 587)
        )
        logger.info(f"Email successfully sent to {recipient_email}")
        return True, None
    except Exception as e:
        err_msg = str(e)
        logger.error(f"SMTP error sending email: {err_msg}")
        return False, err_msg


# --- API Routes ---
@api_router.get("/")
async def root():
    return {"message": "ФОРМАТ API Active"}


@api_router.post("/leads", response_model=LeadResponse)
async def create_lead(input_lead: LeadCreate):
    # Attempt to send email (gracefully skipped if SMTP is not configured)
    email_sent, email_err = await send_lead_email(
        name=input_lead.name,
        phone=input_lead.phone,
        comment=input_lead.comment,
        calculator=input_lead.calculator
    )

    # Always log the lead so it is never lost (especially in no-email mode)
    logger.info(
        "=== НОВАЯ ЗАЯВКА === Имя: %s | Телефон: %s | Комментарий: %s | Email отправлен: %s",
        input_lead.name, input_lead.phone, input_lead.comment or "-", email_sent
    )

    return LeadResponse(
        name=input_lead.name,
        phone=input_lead.phone,
        comment=input_lead.comment,
        calculator=input_lead.calculator,
        email_sent=email_sent,
        email_error=email_err,
        created_at=datetime.now(timezone.utc)
    )


# Include Router
app.include_router(api_router)

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)
