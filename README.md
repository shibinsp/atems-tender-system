# ATEMS - AI Tender Evaluation & Management System

A comprehensive government-grade tender management system with AI-powered bid evaluation capabilities.

![ATEMS Dashboard](https://img.shields.io/badge/version-1.0.0-blue) ![License](https://img.shields.io/badge/license-MIT-green)

## Features

- **User Management** - Role-based access control (Admin, Tender Officer, Evaluator, Bidder, Viewer)
- **Tender Management** - Create, publish, and manage tenders with full lifecycle support
- **Bid Submission** - Bidders can submit proposals with document uploads
- **AI-Powered Evaluation** - Automated bid analysis using Mistral AI
- **RFP Generator** - Build professional RFP documents with clause library
- **Reports & Analytics** - Dashboard with insights and exportable reports
- **Audit Trail** - Complete activity logging for compliance

## Tech Stack

### Backend
- **FastAPI** - Modern Python web framework
- **SQLAlchemy** - ORM for database operations
- **SQLite** - Database (easily switchable to PostgreSQL)
- **JWT** - Authentication with access/refresh tokens
- **Mistral AI** - AI-powered bid evaluation

### Frontend
- **React 19** - UI framework
- **TypeScript** - Type safety
- **Vite** - Build tool
- **TailwindCSS** - Styling
- **Zustand** - State management
- **React Query** - Server state management

## Quick Start

### Using Docker (Recommended)

```bash
# Clone the repository
git clone https://github.com/shibinsp/atems-tender-system.git
cd atems-tender-system

# Start with Docker Compose
docker-compose up --build -d

# Access the application
# Frontend: http://localhost:3838
# Backend API: http://localhost:3399
```

### Manual Setup

#### Backend
```bash
cd backend
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000
```

#### Frontend
```bash
cd frontend
npm install
npm run dev
```

## Default Credentials

After starting the application, register an admin user:

```bash
curl -X POST http://localhost:3838/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@atems.gov","password":"Admin123!","full_name":"System Admin","role":"Admin"}'
```

Or use the registration page at `/register`.

## Project Structure

```
tender-system/
├── backend/
│   ├── app/
│   │   ├── api/v1/endpoints/   # API routes
│   │   ├── core/               # Security, dependencies
│   │   ├── models/             # SQLAlchemy models
│   │   ├── schemas/            # Pydantic schemas
│   │   ├── services/           # Business logic
│   │   └── main.py             # FastAPI app
│   ├── requirements.txt
│   └── Dockerfile
├── frontend/
│   ├── src/
│   │   ├── components/         # Reusable UI components
│   │   ├── pages/              # Page components
│   │   ├── services/           # API services
│   │   ├── store/              # Zustand stores
│   │   └── App.tsx             # Main app
│   ├── package.json
│   └── Dockerfile
└── docker-compose.yml
```

## API Documentation

When running in development mode, access the API docs at:
- Swagger UI: http://localhost:3399/docs
- ReDoc: http://localhost:3399/redoc

## Environment Variables

### Backend (.env)
```env
SECRET_KEY=your-secret-key
DATABASE_URL=sqlite:///./atems.db
MISTRAL_API_KEY=your-mistral-api-key
DEBUG=True
```

### Frontend (.env.development)
```env
VITE_API_BASE_URL=http://localhost:3399/api/v1
```

## User Roles

| Role | Permissions |
|------|-------------|
| Admin | Full system access, user management |
| Tender Officer | Create/manage tenders, view bids |
| Evaluator | Evaluate and score bids |
| Bidder | Submit bids, view own submissions |
| Viewer | Read-only access to tenders |

## Screenshots

### Dashboard
Clean dashboard with stats, upcoming deadlines, and quick actions.

### Tender Management
Create and manage tenders with multi-step forms.

### RFP Generator
Build professional RFP documents with customizable sections and clause library.

### Evaluation Panel
AI-assisted bid evaluation with scoring and ranking.

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License.

## Support

For issues and feature requests, please use the [GitHub Issues](https://github.com/shibinsp/atems-tender-system/issues) page.
