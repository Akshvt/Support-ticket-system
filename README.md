# TicketFlow — Support Ticket System

A full-stack support ticket management system built with Django and React. Designed for teams to submit, track, and manage customer support tickets efficiently. Features intelligent auto-classification that suggests ticket categories and priorities based on the description.

## Live Demo

[support-ticket-system-nu.vercel.app](https://support-ticket-system-nu.vercel.app)

## Features

- **Ticket Submission** — Clean form to create tickets with title, description, category, and priority
- **Smart Classification** — Integrates with OpenAI to auto-suggest category and priority from the ticket description
- **Ticket Management** — Filter, search, and update ticket statuses in real time
- **Analytics Dashboard** — Visual breakdown of tickets by priority and category using interactive charts
- **Dark / Light Mode** — Full theme support with smooth transitions
- **Responsive Design** — Works across desktop, tablet, and mobile

## Tech Stack

| Layer | Technology |
|-------|-----------|
| **Frontend** | React 18, Vite, Framer Motion, Recharts |
| **Backend** | Django 4.2, Django REST Framework |
| **Database** | PostgreSQL |
| **Deployment** | Vercel (serverless) |
| **Styling** | Custom CSS design system (glassmorphism, micro-animations) |

## Project Structure

```
support-ticket-system/
├── api/                        # Vercel serverless entry point
│   └── index.py
├── backend/                    # Django backend
│   ├── config/                 # Settings, URLs, WSGI
│   ├── tickets/                # Core app (models, views, serializers)
│   │   ├── models.py           # Ticket model with category/priority/status
│   │   ├── views.py            # REST API endpoints
│   │   ├── serializers.py      # Request/response serialization
│   │   ├── llm_service.py      # OpenAI classification integration
│   │   └── urls.py             # API routing
│   ├── Dockerfile
│   └── requirements.txt
├── frontend/                   # React (Vite) frontend
│   ├── src/
│   │   ├── components/         # UI components
│   │   │   ├── Navbar.jsx
│   │   │   ├── Hero.jsx
│   │   │   ├── TicketForm.jsx
│   │   │   ├── TicketList.jsx
│   │   │   ├── StatsDashboard.jsx
│   │   │   └── Toast.jsx
│   │   ├── api/tickets.js      # API client (axios)
│   │   ├── App.jsx             # Root component with tab navigation
│   │   └── index.css           # Full design system
│   ├── Dockerfile
│   └── package.json
├── docker-compose.yml          # Local development with Docker
├── vercel.json                 # Vercel deployment config
└── build_vercel.sh             # Build + migration script
```

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/api/tickets/` | Create a new ticket |
| `GET` | `/api/tickets/` | List tickets (supports `?category=`, `?priority=`, `?status=`, `?search=`) |
| `PATCH` | `/api/tickets/<id>/` | Update a ticket (change status, category, etc.) |
| `GET` | `/api/tickets/stats/` | Aggregated statistics (DB-level) |
| `POST` | `/api/tickets/classify/` | Get category/priority suggestions from description |

## Getting Started

### Run Locally with Docker

```bash
git clone https://github.com/Akshvt/Support-ticket-system.git
cd support-ticket-system
cp .env.example .env
docker-compose up --build
```

- Frontend: `http://localhost:3000`
- Backend API: `http://localhost:8000/api/`

### Run Without Docker

**Backend:**
```bash
cd backend
pip install -r requirements.txt
python manage.py migrate
python manage.py runserver
```

**Frontend:**
```bash
cd frontend
npm install
npm run dev
```

## Classification System

The app integrates with OpenAI's API to classify incoming tickets:

1. User writes a ticket description
2. On blur, the frontend calls `/api/tickets/classify/`
3. The backend sends the description to OpenAI with a structured prompt
4. Category and priority dropdowns are pre-filled with the suggestions
5. User can accept or override before submitting

The classification prompt defines clear categories (billing, technical, account, general) and priority levels (low, medium, high, critical) with specific criteria for each. It uses low temperature (0.1) for consistent results.

> Works without an API key — classification is skipped silently and users select manually.

## Design Decisions

- **Database-level aggregation** — Stats endpoint uses Django ORM `annotate()` and `values()` for all calculations, no Python-level loops
- **Graceful degradation** — The entire app works without the OpenAI API. Classification is a progressive enhancement
- **Debounced search** — 400ms debounce on the search input prevents excessive API calls
- **Optimistic UI** — Status changes reflect immediately in the UI before the API response
- **Tab-based navigation** — Single-page app with animated transitions between views using Framer Motion

## Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `DATABASE_URL` | Yes | PostgreSQL connection string |
| `DJANGO_SECRET_KEY` | Yes | Django secret key |
| `DEBUG` | No | Set to `False` in production |
| `ALLOWED_HOSTS` | No | Comma-separated list of allowed hosts |
| `LLM_API_KEY` | No | OpenAI API key for classification |
| `LLM_MODEL` | No | Model name (defaults to `gpt-3.5-turbo`) |

## Author

**Akshat**

## License

This project is open source and available under the [MIT License](LICENSE).
