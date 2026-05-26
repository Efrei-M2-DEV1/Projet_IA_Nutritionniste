import io
import pytest
from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)


def make_fake_image() -> bytes:
    """Crée un fichier JPEG minimal valide (1x1 px)."""
    import struct, zlib
    # Minimal JPEG bytes
    return (
        b"\xff\xd8\xff\xe0\x00\x10JFIF\x00\x01\x01\x00\x00\x01\x00\x01\x00\x00"
        b"\xff\xdb\x00C\x00\x08\x06\x06\x07\x06\x05\x08\x07\x07\x07\t\t"
        b"\x08\n\x0c\x14\r\x0c\x0b\x0b\x0c\x19\x12\x13\x0f\x14\x1d\x1a"
        b"\x1f\x1e\x1d\x1a\x1c\x1c $.' \",#\x1c\x1c(7),01444\x1f'9=82<.342\x1e"
        b"\xff\xc0\x00\x0b\x08\x00\x01\x00\x01\x01\x01\x11\x00"
        b"\xff\xc4\x00\x1f\x00\x00\x01\x05\x01\x01\x01\x01\x01\x01\x00\x00"
        b"\x00\x00\x00\x00\x00\x00\x01\x02\x03\x04\x05\x06\x07\x08\t\n\x0b"
        b"\xff\xda\x00\x08\x01\x01\x00\x00?\x00\xf5\x0a\xff\xd9"
    )


def test_health():
    resp = client.get("/health")
    assert resp.status_code == 200
    assert resp.json()["status"] == "ok"


def test_analyze_success():
    img = make_fake_image()
    resp = client.post(
        "/api/analyze",
        files={"image": ("repas.jpg", io.BytesIO(img), "image/jpeg")},
        data={"healthProfile": "{}"},
    )
    assert resp.status_code == 200
    body = resp.json()
    assert body["success"] is True
    assert isinstance(body["foods"], list)
    assert len(body["foods"]) > 0
    assert "calories_kcal" in body["nutrition"]
    assert isinstance(body["advice"], str)
    assert isinstance(body["warnings"], list)


def test_analyze_missing_image():
    resp = client.post("/api/analyze", data={"healthProfile": "{}"})
    assert resp.status_code == 422  # FastAPI validation error


def test_analyze_wrong_mime():
    resp = client.post(
        "/api/analyze",
        files={"image": ("doc.pdf", io.BytesIO(b"%PDF-1.4"), "application/pdf")},
        data={"healthProfile": "{}"},
    )
    assert resp.status_code == 400


def test_analyze_with_profile():
    img = make_fake_image()
    profile = '{"allergens": ["gluten"], "diabetes": false}'
    resp = client.post(
        "/api/analyze",
        files={"image": ("repas.jpg", io.BytesIO(img), "image/jpeg")},
        data={"healthProfile": profile},
    )
    assert resp.status_code == 200
    assert resp.json()["success"] is True
