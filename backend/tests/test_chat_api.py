import pytest
from fastapi.testclient import TestClient
from app.main import app


@pytest.mark.chat
@pytest.mark.integration
class TestChatAPI:
    @pytest.fixture
    def client(self):
        return TestClient(app)

    def test_root_endpoint(self, client):
        response = client.get("/")

        assert response.status_code == 200
        data = response.json()
        assert "message" in data
        assert "version" in data

    def test_health_check(self, client):
        response = client.get("/health")

        assert response.status_code == 200
        data = response.json()
        assert data["status"] == "healthy"

    def test_create_chat_session(self, client):
        response = client.post("/api/v1/chat/sessions")

        assert response.status_code == 200
        data = response.json()
        assert "session_id" in data

    def test_send_message(self, client):
        session_response = client.post("/api/v1/chat/sessions")
        session_id = session_response.json()["session_id"]

        message_response = client.post(
            f"/api/v1/chat/sessions/{session_id}/messages",
            json={"message": "我今天很开心"},
        )

        assert message_response.status_code == 200
        data = message_response.json()
        assert "response" in data

    def test_get_chat_history(self, client):
        session_response = client.post("/api/v1/chat/sessions")
        session_id = session_response.json()["session_id"]

        client.post(
            f"/api/v1/chat/sessions/{session_id}/messages",
            json={"message": "测试消息"},
        )

        history_response = client.get(f"/api/v1/chat/sessions/{session_id}/history")

        assert history_response.status_code == 200
        data = history_response.json()
        assert "messages" in data
        assert len(data["messages"]) > 0

    def test_send_empty_message(self, client):
        session_response = client.post("/api/v1/chat/sessions")
        session_id = session_response.json()["session_id"]

        message_response = client.post(
            f"/api/v1/chat/sessions/{session_id}/messages",
            json={"message": ""},
        )

        assert message_response.status_code == 422

    def test_invalid_session_id(self, client):
        response = client.get("/api/v1/chat/sessions/invalid_id/history")

        assert response.status_code == 404

    def test_multi_turn_conversation(self, client):
        session_response = client.post("/api/v1/chat/sessions")
        session_id = session_response.json()["session_id"]

        messages = [
            "我今天工作压力很大",
            "主要是项目deadline临近",
            "我感到很焦虑",
        ]

        for message in messages:
            response = client.post(
                f"/api/v1/chat/sessions/{session_id}/messages",
                json={"message": message},
            )
            assert response.status_code == 200

        history_response = client.get(f"/api/v1/chat/sessions/{session_id}/history")
        data = history_response.json()
        assert len(data["messages"]) >= len(messages) * 2

    def test_response_time(self, client):
        import time

        session_response = client.post("/api/v1/chat/sessions")
        session_id = session_response.json()["session_id"]

        start_time = time.time()
        response = client.post(
            f"/api/v1/chat/sessions/{session_id}/messages",
            json={"message": "你好"},
        )
        end_time = time.time()

        assert response.status_code == 200
        assert (end_time - start_time) < 3.0
