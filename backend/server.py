from fastapi import FastAPI, APIRouter, HTTPException
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
from pathlib import Path
from pydantic import BaseModel, Field, ConfigDict, BeforeValidator
from typing import List, Optional, Annotated
import uuid
from datetime import datetime, timezone
import aiosmtplib
from email.message import EmailMessage
from bson import ObjectId

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# MongoDB connection
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

app = FastAPI()
api_router = APIRouter(prefix="/api")

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

# --- MongoDB adherence ---
# PyObjectId annotated type to coerce ObjectId -> str
PyObjectId = Annotated[str, BeforeValidator(str)]

class BaseDocument(BaseModel):
    id: Optional[PyObjectId] = Field(alias="_id", default=None)
    
    model_config = ConfigDict(
        populate_by_name=True,
        arbitrary_types_allowed=True
    )
    
    def to_mongo(self) -> dict:
        data = self.model_dump(by_alias=True)
        if "id" in data and data["id"] is None:
            data.pop("id")
        if "_id" in data and data["_id"] is None:
            data.pop("_id")
        return data

    @classmethod
    def from_mongo(cls, data: dict) -> "BaseDocument":
        if not data:
            return None
        return cls(**data)

# Lead Models
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

class LeadDocument(BaseDocument):
    name: str
    phone: str
    comment: Optional[str] = None
    calculator: Optional[CalculatorInfo] = None
    email_sent: bool = False
    email_error: Optional[str] = None
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

# Status models (for backward compatibility)
class StatusCheck(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    client_name: str
    timestamp: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class StatusCheckCreate(BaseModel):
    client_name: str


# --- Helper Function for SMTP ---
async def send_lead_email(name: str, phone: str, comment: Optional[str], calculator: Optional[CalculatorInfo]) -> tuple[bool, Optional[str]]:
    smtp_host = os.environ.get("SMTP_HOST", "")
    smtp_port = os.environ.get("SMTP_PORT", "")
    smtp_user = os.environ.get("SMTP_USER", "")
    smtp_password = os.environ.get("SMTP_PASSWORD", "")
    recipient_email = os.environ.get("RECIPIENT_EMAIL", "lax-jakal@yandex.ru")

    if not smtp_host or not smtp_user or not smtp_password:
        logger.warning("SMTP settings are incomplete. Skipping actual email sending, falling back to db log.")
        return False, "SMTP settings not configured in .env"

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

@api_router.post("/leads", response_model=LeadDocument)
async def create_lead(input_lead: LeadCreate):
    # Attempt to send email
    email_sent, email_err = await send_lead_email(
        name=input_lead.name,
        phone=input_lead.phone,
        comment=input_lead.comment,
        calculator=input_lead.calculator
    )
    
    # Construct model
    lead_doc = LeadDocument(
        name=input_lead.name,
        phone=input_lead.phone,
        comment=input_lead.comment,
        calculator=input_lead.calculator,
        email_sent=email_sent,
        email_error=email_err
    )
    
    # Save to MongoDB (optional — the lead is still accepted if the DB is unavailable)
    try:
        mongo_dict = lead_doc.to_mongo()
        result = await db.leads.insert_one(mongo_dict)
        lead_doc.id = str(result.inserted_id)
    except Exception as e:
        logger.warning(f"Could not save lead to MongoDB (running without DB?): {e}")

    return lead_doc

@api_router.get("/leads", response_model=List[LeadDocument])
async def get_leads():
    cursor = db.leads.find()
    leads = []
    async for doc in cursor:
        leads.append(LeadDocument.from_mongo(doc))
    return leads


# --- Backward Compatible Routes for Status ---

@api_router.post("/status", response_model=StatusCheck)
async def create_status_check(input_check: StatusCheckCreate):
    status_dict = input_check.model_dump()
    status_obj = StatusCheck(**status_dict)
    
    doc = status_obj.model_dump()
    doc['timestamp'] = doc['timestamp'].isoformat()
    
    await db.status_checks.insert_one(doc)
    return status_obj

@api_router.get("/status", response_model=List[StatusCheck])
async def get_status_checks():
    status_checks = await db.status_checks.find({}, {"_id": 0}).to_list(1000)
    
    for check in status_checks:
        if isinstance(check['timestamp'], str):
            check['timestamp'] = datetime.fromisoformat(check['timestamp'])
    
    return [StatusCheck(**check) for check in status_checks]


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

@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()
