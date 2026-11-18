import sys
from pathlib import Path

# Add Backend directory to sys.path so app imports work seamlessly
backend_dir = Path(__file__).resolve().parent.parent / "Backend"
if str(backend_dir) not in sys.path:
    sys.path.insert(0, str(backend_dir))

from app.main import app
