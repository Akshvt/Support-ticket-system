# TicketFlow — Support Ticket System

A full-stack support ticket management system built with Node.js and React. Designed for teams to submit, track, and manage customer support tickets efficiently. Features intelligent auto-classification that suggests ticket categories and priorities based on the description.

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
| **Backend** | Node.js, Express.js |
| **Database** | PostgreSQL (node-postgres) |
| **LLM** | OpenAI GPT-3.5-turbo |
| **Deployment** | Vercel (serverless) |

## Project Structure

```
support-ticket-system/
├── backend/                        # Node.js Express backend (MVC)
│   ├── app.js                      # Express app setup + middleware chain
│   ├── config/
│   │   └── db.js                   # PostgreSQL connection pool
│   ├── models/
│   │   └── Ticket.js               # SQL queries (findAll, create, update, stats)
│   ├── controllers/
│   │   └── ticketController.js     # Request handlers with validation
│   ├── routes/
│   │   └── ticketRoutes.js         # Express router definitions
│   ├── middlewares/
│   │   ├── errorHandler.js         # Global error handler
│   │   └── validate.js             # Input validation middleware
│   ├── services/
│   │   └── llmService.js           # OpenAI classification integration
│   └── package.json
├── frontend/                       # React (Vite) frontend
│   ├── src/
│   │   ├── components/
│   │   │   ├── Navbar.jsx
│   │   │   ├── Hero.jsx
│   │   │   ├── TicketForm.jsx
│   │   │   ├── TicketList.jsx
│   │   │   ├── StatsDashboard.jsx
│   │   │   └── Toast.jsx
│   │   ├── api/tickets.js          # API client (axios)
│   │   ├── App.jsx                 # Root component with tab navigation
│   │   └── index.css               # Full design system
│   └── package.json
├── api/                            # Vercel serverless entry points
│   ├── index.js                    # Express app wrapper
│   └── classify.js                 # Standalone AI classify function
├── vercel.json                     # Vercel build + routing config
└── README.md
```

## Setup Instructions

### Prerequisites

- Node.js 18+ installed
- PostgreSQL database (local or cloud)
- (Optional) OpenAI API key for classification feature

### Quick Start

```bash
git clone https://github.com/Akshvt/Support-ticket-system.git
cd support-ticket-system
```

Create a `.env` file in the project root:
```env
DATABASE_URL=postgresql://user:password@localhost:5432/support_tickets
LLM_API_KEY=your-openai-api-key-here
LLM_MODEL=gpt-3.5-turbo
```

> The app works fully without an OpenAI key — users just select category and priority manually.

**Backend:**
```bash
cd backend
npm install
npm run dev
```

**Frontend:**
```bash
cd frontend
npm install
npm run dev
```

The app will be available at:
- **Frontend:** http://localhost:3000
- **Backend API:** http://localhost:8000/api/

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/api/tickets/` | Create a new ticket |
| `GET` | `/api/tickets/` | List tickets (supports `?category=`, `?priority=`, `?status=`, `?search=`) |
| `GET` | `/api/tickets/:id/` | Get a single ticket |
| `PATCH` | `/api/tickets/:id/` | Update a ticket (change status, category, etc.) |
| `GET` | `/api/tickets/stats/` | Aggregated statistics (DB-level) |
| `POST` | `/api/tickets/classify/` | Get AI-suggested category and priority from description |

## LLM Integration: OpenAI GPT-3.5-turbo

### How it works

1. User writes a ticket description in the form
2. On blur (clicking away from the description field), the frontend calls `POST /api/tickets/classify/`
3. The backend sends the description to OpenAI with a classification prompt (`backend/services/llmService.js`)
4. The prompt defines each category with examples and each priority level with criteria
5. Uses `temperature=0.1` for consistent, deterministic results
6. Response is validated — must contain valid category and priority values
7. Category and priority dropdowns are pre-filled with the AI suggestion
8. User can accept or override before submitting

### Why GPT-3.5-turbo

- **Speed** — ~300-500ms latency, feels instant for form auto-fill
- **Cost** — ~$0.001 per classification, affordable at scale
- **Accuracy** — Well-constrained task (4 categories × 4 priorities) doesn't need GPT-4 reasoning
- **Reliable JSON** — Consistently produces valid structured output with a clear prompt

### Error Handling

- **No API key configured** — Classification skipped silently, user selects manually
- **API unreachable / timeout** — Returns null suggestions with a friendly message
- **Invalid response** — Logged and treated as unavailable
- **Rate limits** — Handled gracefully, ticket submission still works

The entire app works without an API key. Classification is a progressive enhancement, not a dependency.

## Design Decisions

1. **Database-level aggregation** — Stats endpoint computes all calculations in PostgreSQL using `GROUP BY` queries. No application-level loops or post-processing.

2. **Graceful LLM degradation** — The entire app works without an API key. Classification is a progressive enhancement.

3. **Standalone classify function** — The AI classification endpoint runs as a separate Vercel serverless function with no database dependency — fast cold start, no DB connection overhead.

4. **MVC architecture** — Clean separation: routes define paths, controllers handle requests, models wrap SQL, services handle external integrations.

5. **Debounced search** — 400ms debounce on search input prevents excessive API calls.

6. **Optimistic UI updates** — Status changes update the UI immediately before the API response. Reverted with error toast on failure.

7. **Custom CSS design system** — Complete design system with CSS custom properties covering dark/light themes, glassmorphism, micro-animations, and responsive breakpoints. No CSS framework dependency.

## Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `DATABASE_URL` | Yes | PostgreSQL connection string |
| `LLM_API_KEY` | No | OpenAI API key for auto-classification |
| `LLM_MODEL` | No | Model name (default: `gpt-3.5-turbo`) |

## Deployment (Vercel)

The project is configured for Vercel deployment with two serverless functions:

- **`api/index.js`** — Express app handling all CRUD and stats endpoints
- **`api/classify.js`** — Standalone lightweight function for AI classification

Set `DATABASE_URL`, `LLM_API_KEY`, and `LLM_MODEL` in your Vercel project's Environment Variables settings.

## Author

**Akshat**

## License

This project is open source and available under the [MIT License](LICENSE).
