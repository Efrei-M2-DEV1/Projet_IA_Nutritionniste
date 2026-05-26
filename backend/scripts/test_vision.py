"""Script simple pour tester la détection d'aliments localement.

Usage:
  python scripts/test_vision.py path/to/image.jpg
"""
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT))

from app.services.vision import detect_foods, get_vision_mode


def main():
    if len(sys.argv) < 2:
        print("Usage: python scripts/test_vision.py IMAGE_PATH")
        return
    p = Path(sys.argv[1])
    if not p.exists():
        print(f"File not found: {p}")
        return
    b = p.read_bytes()
    results = detect_foods(b, top_k=5)
    print(f"Vision mode: {get_vision_mode()}")
    print("Detections:")
    for r in results:
        print(f" - {r['name']}: {r['confidence']:.3f}")


if __name__ == '__main__':
    main()
