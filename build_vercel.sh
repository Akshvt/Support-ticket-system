#!/bin/bash
set -e

# Install Python dependencies
pip install -r requirements.txt

# Run Django migrations
cd backend
python manage.py migrate --noinput
python manage.py collectstatic --noinput
cd ..

# Build frontend
cd frontend
npm install
npm run build
