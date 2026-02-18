"""WSGI config for Support Ticket System."""
import os
import sys
from pathlib import Path
from django.core.wsgi import get_wsgi_application

# Add backend directory to Python path for Vercel serverless
backend_dir = str(Path(__file__).resolve().parent.parent)
if backend_dir not in sys.path:
    sys.path.insert(0, backend_dir)

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
application = get_wsgi_application()
