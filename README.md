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
| **LLM** | OpenAI GPT-3.5-turbo |
| **Infrastructure** | Docker + Docker Compose |
| **Deployment** | Vercel (serverless) |

## Setup Instructions

### Prerequisites

- Docker and Docker Compose installed
- (Optional) OpenAI API key for classification feature

### Quick Start with Docker

```bash
git clone https://github.com/Akshvt/Support-ticket-system.git
cd support-ticket-system
docker-compose up --build
```

> **Optional:** To enable AI classification, create a `.env` file in the project root before running Docker:
> ```
> LLM_API_KEY=your-openai-api-key-here
> LLM_MODEL=gpt-3.5-turbo
> ```
> The app works fully without it — users just select category and priority manually.

The app will be available at:
- **Frontend:** http://localhost:3000
- **Backend API:** http://localhost:8000/api/

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

## LLM Choice: OpenAI GPT-3.5-turbo

### What it does

When a user types a ticket description, the system sends it to OpenAI's API to automatically suggest a category (billing, technical, account, general) and priority level (low, medium, high, critical). The suggestions pre-fill the form dropdowns, and the user can accept or override them before submitting.

### Why GPT-3.5-turbo

I chose GPT-3.5-turbo for this project for several reasons:

1. **Speed** — Classification needs to feel instant. GPT-3.5-turbo has significantly lower latency (~300-500ms) compared to GPT-4, which matters since the classification triggers on input blur and users are waiting to submit the form.

2. **Cost efficiency** — At ~$0.001 per classification request, it's extremely affordable for a ticket system that could handle hundreds of requests daily. GPT-4 would cost 10-20x more with minimal benefit for a structured classification task.

3. **Sufficient accuracy** — The task is well-constrained: classify text into one of 4 categories and 4 priority levels. This doesn't require the advanced reasoning of GPT-4. A clear system prompt with category definitions and examples is enough for GPT-3.5-turbo to classify accurately.

4. **Reliable JSON output** — The prompt requests JSON-only output, and GPT-3.5-turbo reliably produces valid JSON for simple structured responses. The backend validates the response against known categories and priorities, so any edge cases are caught.

5. **Broad API compatibility** — OpenAI's API is the most widely supported and documented. The `openai` Python SDK makes integration straightforward with proper error handling.

### How it works

1. User writes a ticket description in the form
2. On blur (clicking away from the description field), the frontend calls `POST /api/tickets/classify/`
3. The backend sends the description to OpenAI with a classification prompt (`backend/tickets/llm_service.py`)
4. The prompt defines each category with examples and each priority level with criteria
5. Uses `temperature=0.1` for consistent, deterministic results
6. Response is validated — must contain valid category and priority values
7. Category and priority dropdowns are pre-filled with the AI suggestion
8. User can accept or override before submitting

### Error Handling

- **No API key configured** — Classification is skipped silently, user selects manually
- **API unreachable / timeout** — Returns null suggestions with a friendly message
- **Invalid response** — Logged and treated as unavailable
- **Rate limits** — Handled gracefully, ticket submission still works

The entire app works without an API key. Classification is a progressive enhancement, not a dependency.

## Project Structure

```
support-ticket-system/
├── backend/                    # Django backend
│   ├── config/                 # Settings, URLs, WSGI
│   ├── tickets/                # Core app
│   │   ├── models.py           # Ticket model with category/priority/status
│   │   ├── views.py            # REST API endpoints
│   │   ├── serializers.py      # Request/response serialization
│   │   ├── llm_service.py      # OpenAI classification integration
│   │   ├── admin.py            # Django admin registration
│   │   └── urls.py             # API routing
│   ├── Dockerfile
│   ├── entrypoint.sh           # Migrations + gunicorn startup
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
│   │   └── index.css           # Full design system (~1000 lines)
│   ├── Dockerfile
│   ├── nginx.conf              # Reverse proxy config
│   └── package.json
├── docker-compose.yml          # Full stack: DB + backend + frontend
├── .env.example                # Environment variable template
└── README.md
```

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/api/tickets/` | Create a new ticket |
| `GET` | `/api/tickets/` | List tickets (supports `?category=`, `?priority=`, `?status=`, `?search=`) |
| `PATCH` | `/api/tickets/<id>/` | Update a ticket (change status, category, etc.) |
| `GET` | `/api/tickets/stats/` | Aggregated statistics (DB-level) |
| `POST` | `/api/tickets/classify/` | Get category/priority suggestions from description |

## Design Decisions

1. **Database-level aggregation** — The stats endpoint uses Django ORM `annotate()` and `values()` for all calculations. No Python-level loops or post-processing — everything is computed in PostgreSQL.

2. **Graceful LLM degradation** — The entire app works without an API key. Classification is a progressive enhancement. If the API is down, unreachable, or returns invalid data, the form still works — users just select category and priority manually.

3. **Debounced search** — 400ms debounce on the search input prevents excessive API calls while the user types.

4. **Optimistic UI updates** — When a user changes a ticket's status, the UI updates immediately before the API response comes back. If the API call fails, the change is reverted with an error toast.

5. **Tab-based SPA navigation** — Rather than a router, the app uses tab-based navigation with Framer Motion's `AnimatePresence` for smooth transitions between the Submit, Tickets, and Dashboard views.

6. **Custom CSS design system** — Built a complete design system with CSS custom properties (~1000 lines) covering dark/light themes, glassmorphism cards, micro-animations, and responsive breakpoints. No CSS framework dependency.

7. **Docker Compose for local dev** — Single `docker-compose up` spins up PostgreSQL, Django backend, and React frontend with nginx reverse proxy. The frontend nginx config proxies `/api/` requests to the backend.

## Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `DATABASE_URL` | Yes (prod) | PostgreSQL connection string |
| `DJANGO_SECRET_KEY` | Yes (prod) | Django secret key |
| `DEBUG` | No | Set to `False` in production (default: `True`) |
| `ALLOWED_HOSTS` | No | Comma-separated allowed hosts (default: `*`) |
| `LLM_API_KEY` | No | OpenAI API key for auto-classification |
| `LLM_MODEL` | No | Model name (default: `gpt-3.5-turbo`) |

## Author

**Akshat**

## License

This project is open source and available under the [MIT License](LICENSE).
