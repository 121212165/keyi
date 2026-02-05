from fastapi import FastAPI, HTTPException, Depends
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
from typing import List, Optional
from datetime import datetime
from app.config import settings
from app.services.chat_service import ChatService
from app.services.emotion_service import EmotionRecognitionEngine
from app.services.assessment_service import AssessmentService
from app.services.suggestion_service import SuggestionService
from app.services.alert_service import AlertService
from app.schemas import ScaleType, EmotionType, EmotionIntensity, AlertLevel

app = FastAPI(
    title="AI Psychologist API",
    description="AI-powered mental health support system",
    version="1.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

chat_service = ChatService()
emotion_engine = EmotionRecognitionEngine()
assessment_service = AssessmentService()
suggestion_service = SuggestionService()
alert_service = AlertService()


class MessageRequest(BaseModel):
    message: str = Field(..., min_length=1, max_length=2000)


class AssessmentRequest(BaseModel):
    scale_type: ScaleType
    answers: List[int]


class EmotionRequest(BaseModel):
    text: str = Field(..., min_length=1, max_length=2000)


class SuggestionRequest(BaseModel):
    emotion: EmotionType
    intensity: EmotionIntensity


@app.get("/")
async def root():
    return {"message": "AI Psychologist API", "version": "1.0.0"}


@app.get("/health")
async def health_check():
    return {"status": "healthy"}


@app.post("/api/v1/chat/sessions")
async def create_chat_session():
    user_id = "anonymous_user"
    session_id = await chat_service.create_session(user_id)
    return {"session_id": session_id}


@app.post("/api/v1/chat/sessions/{session_id}/messages")
async def send_message(session_id: str, request: MessageRequest):
    user_id = "anonymous_user"
    try:
        result = await chat_service.send_message(session_id, user_id, request.message)
        return result
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))


@app.get("/api/v1/chat/sessions/{session_id}/history")
async def get_chat_history(session_id: str):
    try:
        messages = await chat_service.get_history(session_id)
        return {"messages": messages}
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))


@app.post("/api/v1/emotion/analyze")
async def analyze_emotion(request: EmotionRequest):
    result = await emotion_engine.analyze(request.text)
    return result.dict()


@app.get("/api/v1/assessments/scales/{scale_type}")
async def get_assessment_scale(scale_type: ScaleType):
    scale = assessment_service.get_scale(scale_type)
    if not scale:
        raise HTTPException(status_code=404, detail="Scale not found")
    return scale


@app.post("/api/v1/assessments/submissions")
async def submit_assessment(request: AssessmentRequest):
    user_id = "anonymous_user"
    result = await assessment_service.submit_assessment(
        user_id, request.scale_type, request.answers
    )
    return result.dict()


@app.post("/api/v1/suggestions/generate")
async def generate_suggestions(request: SuggestionRequest):
    suggestions = await suggestion_service.generate_suggestions(
        request.emotion, request.intensity
    )
    return {"suggestions": [s.dict() for s in suggestions]}


@app.get("/api/v1/alerts/resources")
async def get_alert_resources(alert_type: AlertLevel):
    resources = alert_service.get_resources(alert_type)
    return {"resources": resources}


@app.post("/api/v1/alerts/trigger")
async def trigger_alert(request: MessageRequest):
    user_id = "anonymous_user"
    alert_level = await alert_service.check_risk(user_id, request.message)
    if alert_level != AlertLevel.LEVEL_3:
        alert = await alert_service.trigger_alert(
            user_id, alert_level, request.message
        )
        return alert.dict()
    return {"level": "level_3", "message": "No alert triggered"}