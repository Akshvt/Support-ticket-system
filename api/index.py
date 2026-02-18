import os
import sys
from pathlib import Path

# Add backend directory to Python path so Django can find its modules
backend_dir = str(Path(__file__).resolve().parent.parent / 'backend')
if backend_dir not in sys.path:
    sys.path.insert(0, backend_dir)

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')

from django.core.wsgi import get_wsgi_application
app = application = get_wsgi_application()
