from typing import Optional, Dict, List
from datetime import datetime
import uuid
from sqlalchemy.orm import Session


class UserService:
    def __init__(self, db: Session):
        self.db = db

    def create_user(self, anonymous_id: Optional[str] = None) -> User:
        if not anonymous_id:
            anonymous_id = f"anon_{uuid.uuid4().hex[:16]}"
        
        user = User(
            anonymous_id=anonymous_id,
            created_at=datetime.utcnow(),
            last_active_at=datetime.utcnow(),
            preferences={},
            risk_level="low"
        )
        
        self.db.add(user)
        self.db.commit()
        self.db.refresh(user)
        return user

    def get_user_by_anonymous_id(self, anonymous_id: str) -> Optional[User]:
        return self.db.query(User).filter(User.anonymous_id == anonymous_id).first()

    def update_user_activity(self, user_id: str) -> User:
        user = self.db.query(User).filter(User.id == user_id).first()
        if user:
            user.last_active_at = datetime.utcnow()
            self.db.commit()
            self.db.refresh(user)
        return user

    def update_user_preferences(self, user_id: str, preferences: Dict) -> User:
        user = self.db.query(User).filter(User.id == user_id).first()
        if user:
            user.preferences = {**user.preferences, **preferences}
            self.db.commit()
            self.db.refresh(user)
        return user

    def update_user_risk_level(self, user_id: str, risk_level: str) -> User:
        user = self.db.query(User).filter(User.id == user_id).first()
        if user:
            user.risk_level = risk_level
            self.db.commit()
            self.db.refresh(user)
        return user

    def get_user_assessments(self, user_id: str) -> List[Assessment]:
        return self.db.query(Assessment).filter(Assessment.user_id == user_id).all()

    def get_user_alerts(self, user_id: str) -> List[Alert]:
        return self.db.query(Alert).filter(Alert.user_id == user_id).all()

    def delete_user_data(self, user_id: str) -> bool:
        try:
            self.db.query(Alert).filter(Alert.user_id == user_id).delete()
            self.db.query(Assessment).filter(Assessment.user_id == user_id).delete()
            self.db.query(ChatSession).filter(ChatSession.user_id == user_id).delete()
            self.db.query(User).filter(User.id == user_id).delete()
            self.db.commit()
            return True
        except Exception:
            self.db.rollback()
            return False

    def get_user_statistics(self, user_id: str) -> Dict:
        total_sessions = self.db.query(ChatSession).filter(ChatSession.user_id == user_id).count()
        total_assessments = self.db.query(Assessment).filter(Assessment.user_id == user_id).count()
        total_alerts = self.db.query(Alert).filter(Alert.user_id == user_id).count()
        
        return {
            "total_sessions": total_sessions,
            "total_assessments": total_assessments,
            "total_alerts": total_alerts
        }