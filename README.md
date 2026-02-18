# Support Ticket System

A full-stack support ticket management system with AI-powered auto-classification.

## Tech Stack

| Layer | Technology |
|-------|-----------|
| **Backend** | Django 4.2 + Django REST Framework |
| **Database** | PostgreSQL 15 |
| **Frontend** | React 18 (Vite) + Framer Motion + Recharts |
| **LLM** | OpenAI API (GPT-3.5-turbo) |
| **Infrastructure** | Docker + Docker Compose |

## Quick Start

### 1. Clone and configure

```bash
git clone <your-repo>
cd support-ticket-system
cp .env.example .env
```

### 2. Add your API key

Edit `.env` and add your OpenAI API key:

```
LLM_API_KEY=sk-your-openai-api-key-here
LLM_MODEL=gpt-3.5-turbo
```

> **Note:** The app works without an API key — ticket submission still functions, but auto-classification will be skipped. You can always select category and priority manually.

### 3. Run with Docker

```bash
docker-compose up --build
```

The app will be available at:
- **Frontend:** http://localhost:3000
- **Backend API:** http://localhost:8000/api/

## Architecture

```
support-ticket-system/
├── backend/                    # Django + DRF
│   ├── config/                 # Django settings, URLs, WSGI
│   ├── tickets/                # Main app
│   │   ├── models.py           # Ticket model with DB constraints
│   │   ├── views.py            # REST API views
│   │   ├── serializers.py      # DRF serializers
│   │   ├── llm_service.py      # LLM classification logic
│   │   └── urls.py             # URL routing
│   ├── Dockerfile
│   ├── entrypoint.sh           # Migrations + gunicorn startup
│   └── requirements.txt
├── frontend/                   # React (Vite)
│   ├── src/
│   │   ├── components/         # React components
│   │   │   ├── Navbar.jsx
│   │   │   ├── Hero.jsx
│   │   │   ├── TicketForm.jsx
│   │   │   ├── TicketList.jsx
│   │   │   ├── StatsDashboard.jsx
│   │   │   └── Toast.jsx
│   │   ├── api/tickets.js      # API client
│   │   ├── App.jsx
│   │   └── index.css           # Design system
│   ├── Dockerfile
│   ├── nginx.conf              # Nginx reverse proxy
│   └── package.json
├── docker-compose.yml
├── .env.example
└── README.md
```

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/tickets/` | Create a new ticket (returns 201) |
| GET | `/api/tickets/` | List all tickets (supports `?category=`, `?priority=`, `?status=`, `?search=`) |
| PATCH | `/api/tickets/<id>/` | Update a ticket (e.g., change status) |
| GET | `/api/tickets/stats/` | Aggregated statistics (DB-level) |
| POST | `/api/tickets/classify/` | LLM-powered classification |

## LLM Integration

### Why OpenAI (GPT-3.5-turbo)?

- **Reliability**: Most widely used and tested API
- **Speed**: GPT-3.5-turbo is fast for classification tasks
- **Cost**: Very low cost per request (~$0.001 per classification)
- **JSON mode**: Reliable structured output

### How it works

1. User types a ticket description
2. On blur (or manual trigger), the frontend calls `/api/tickets/classify/`
3. The backend sends the description to OpenAI with a classification prompt
4. The response is validated (must be valid category + priority)
5. Category and priority dropdowns are pre-filled with suggestions
6. User can accept or override before submitting

### Error Handling

- **No API key configured**: Classification skipped silently, user selects manually
- **API unreachable**: Returns null suggestions with a user-friendly message
- **Invalid response**: Logged and treated as unavailable
- **Rate limits**: Handled gracefully, ticket submission still works

### Prompt Design

The classification prompt is in `backend/tickets/llm_service.py`. It:
- Defines clear categories with examples
- Defines priority levels with criteria
- Requests JSON-only output
- Uses low temperature (0.1) for consistent results

## Design Decisions

1. **Database-level aggregation**: Stats endpoint uses Django ORM `annotate()` and `values()` for all calculations — no Python loops
2. **Graceful LLM degradation**: The entire form works without LLM. Classification is a progressive enhancement
3. **Debounced search**: 400ms debounce on search input prevents excessive API calls
4. **Optimistic UI**: Status changes update locally immediately, then sync with backend
5. **Tab-based navigation**: Single-page app with smooth animated transitions between views

## Development

### Backend only
```bash
cd backend
pip install -r requirements.txt
python manage.py migrate
python manage.py runserver
```

### Frontend only
```bash
cd frontend
npm install
npm run dev
```
