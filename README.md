# ATEMS - AI Tender Evaluation & Management System

A comprehensive, enterprise-grade government tender management system with AI-powered bid evaluation, complete lifecycle management, and advanced analytics.

![Version](https://img.shields.io/badge/version-2.0.1-blue)
![License](https://img.shields.io/badge/license-MIT-green)
![Python](https://img.shields.io/badge/python-3.11+-blue)
![React](https://img.shields.io/badge/react-19-blue)

## 🚀 Features

### Core Tender Management
- **Complete Tender Lifecycle** - Draft → Publish → Evaluate → Award → Contract → Closure
- **Multi-Stage Tenders** - Single, Two-Stage, Three-Stage tender support
- **Tender Types** - Open, Limited, Single Source, EOI
- **Document Management** - Upload, download, version control
- **Eligibility & Evaluation Criteria** - Configurable weighted scoring

### 🤖 AI-Powered Features
- **Eligibility Evaluation** - AI checks bid compliance
- **Technical Scoring** - Automated bid scoring
- **Risk Analysis** - Identify potential risks
- **RFP Generation** - AI-assisted document creation
- **Comparative Analysis** - Side-by-side bid comparison
- **Document Extraction** - Extract data from uploaded documents
- **Vendor Rating** - AI-powered vendor assessment

### 📋 Contract & Post-Award
- **Letter of Intent (LoI)** - Generate and track LoI
- **Letter of Acceptance (LoA)** - Formal acceptance workflow
- **Purchase Orders** - PO generation and tracking
- **Invoice Management** - Submit, approve, track payments
- **Delivery & GRN** - Goods receipt tracking
- **Milestone Payments** - Progress-based payments
- **Bank Guarantee** - BG tracking, expiry alerts, release

### 📊 Analytics & Reporting
- **Executive Dashboard** - KPIs, trends, insights
- **Tender Calendar** - Visual timeline of all events
- **Savings Analysis** - Track procurement savings
- **Vendor Participation** - Bidder analytics, win rates
- **Category Spend** - Department-wise analysis
- **Cycle Time Analysis** - Process efficiency metrics
- **Custom Reports** - PDF, Excel, CSV exports

### 🔐 Security & Compliance
- **Two-Factor Authentication** - TOTP-based 2FA
- **Role-Based Access Control** - 5 user roles
- **Session Management** - View/terminate sessions
- **IP Whitelisting** - Restrict access by IP
- **Audit Trail** - Complete action logging
- **Digital Signatures** - e-Sign support (model ready)
- **Approval Workflow** - Multi-level approvals

### 🏢 Vendor Portal
- **Self-Registration** - Online vendor registration
- **Empanelment** - Category-wise empanelment
- **Performance Tracking** - Ratings and reviews
- **Blacklist Management** - Vendor debarment

### 💬 Collaboration
- **In-App Messaging** - Secure communication
- **Task Assignment** - Assign tasks with deadlines
- **Pre-Bid Meetings** - Schedule online/offline meetings
- **Notifications** - Email, SMS, in-app alerts
- **Corrigendum** - Publish tender amendments

### 🔗 Integrations
- **Webhooks** - Real-time event notifications
- **API Keys** - Secure API access
- **GeM Integration** - Publish to Government e-Marketplace
- **CPPP Integration** - Central Public Procurement Portal

## 🛠 Tech Stack

### Backend
| Technology | Purpose |
|------------|---------|
| FastAPI | Modern Python web framework |
| PostgreSQL | Production database |
| SQLAlchemy | ORM |
| JWT | Authentication |
| Mistral AI | AI-powered features |
| Pydantic | Data validation |

### Frontend
| Technology | Purpose |
|------------|---------|
| React 19 | UI framework |
| TypeScript | Type safety |
| Vite | Build tool |
| TailwindCSS | Styling |
| Zustand | State management |
| React Query | Server state |

### Infrastructure
| Technology | Purpose |
|------------|---------|
| Docker | Containerization |
| Docker Compose | Orchestration |
| Nginx | Frontend server |

## 📦 Quick Start

### Using Docker (Recommended)

```bash
# Clone the repository
git clone https://github.com/your-repo/atems-tender-system.git
cd atems-tender-system

# Set environment variables
export MISTRAL_API_KEY=your_mistral_api_key

# Start all services
docker compose up -d --build

# Access the application
# Frontend: http://localhost:3838
# Backend API: http://localhost:3399
# API Docs: http://localhost:3399/docs
```

### Manual Setup

#### Backend
```bash
cd backend
python -m venv venv
source venv/bin/activate
pip install -r requirements.txt

# Set environment variables
export DATABASE_URL=postgresql://user:pass@localhost/atems
export SECRET_KEY=your-secret-key
export MISTRAL_API_KEY=your-mistral-key

uvicorn app.main:app --reload --port 3399
```

#### Frontend
```bash
cd frontend
npm install
npm run dev
```

## 👥 User Roles

| Role | Permissions |
|------|-------------|
| **Admin** | Full system access, user management, settings |
| **Tender Officer** | Create/manage tenders, evaluation, contracts |
| **Evaluator** | Evaluate bids, scoring, committee participation |
| **Bidder** | View tenders, submit bids, track status |
| **Viewer** | Read-only access to published tenders |

## 📁 Project Structure

```
atems-tender-system/
├── backend/
│   ├── app/
│   │   ├── api/v1/endpoints/    # API routes
│   │   │   ├── auth.py          # Authentication
│   │   │   ├── tenders.py       # Tender management
│   │   │   ├── bids.py          # Bid submission
│   │   │   ├── evaluation.py    # Bid evaluation
│   │   │   ├── contracts.py     # Post-award management
│   │   │   ├── analytics.py     # Analytics & reports
│   │   │   ├── vendors.py       # Vendor portal
│   │   │   ├── security.py      # 2FA & security
│   │   │   ├── communications.py # Messaging & tasks
│   │   │   ├── integrations.py  # Webhooks & APIs
│   │   │   └── ai.py            # AI features
│   │   ├── models/              # Database models
│   │   ├── schemas/             # Pydantic schemas
│   │   ├── services/            # Business logic
│   │   └── main.py              # FastAPI app
│   ├── requirements.txt
│   └── Dockerfile
├── frontend/
│   ├── src/
│   │   ├── components/          # Reusable UI
│   │   ├── pages/               # Page components
│   │   │   ├── analytics/       # Analytics dashboard
│   │   │   ├── calendar/        # Tender calendar
│   │   │   ├── contracts/       # Contract management
│   │   │   ├── evaluation/      # Bid evaluation
│   │   │   └── settings/        # Security settings
│   │   ├── services/            # API services
│   │   └── store/               # State management
│   ├── package.json
│   └── Dockerfile
└── docker-compose.yml
```

## 🔌 API Endpoints

### Authentication
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/v1/auth/login` | User login |
| POST | `/api/v1/auth/register` | User registration |
| POST | `/api/v1/auth/refresh` | Refresh token |
| POST | `/api/v1/auth/change-password` | Change password |

### Tenders
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/v1/tenders` | List tenders |
| POST | `/api/v1/tenders` | Create tender |
| GET | `/api/v1/tenders/{id}` | Get tender details |
| PUT | `/api/v1/tenders/{id}` | Update tender |
| POST | `/api/v1/tenders/{id}/publish` | Publish tender |

### Contracts
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/v1/contracts/loi` | Issue Letter of Intent |
| POST | `/api/v1/contracts/{id}/loa` | Issue Letter of Acceptance |
| POST | `/api/v1/contracts/po` | Create Purchase Order |
| POST | `/api/v1/contracts/invoice` | Submit Invoice |
| POST | `/api/v1/contracts/corrigendum` | Publish Corrigendum |

### Analytics
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/v1/analytics/executive-dashboard` | KPIs & metrics |
| GET | `/api/v1/analytics/calendar-events` | Calendar data |
| GET | `/api/v1/analytics/savings-report` | Savings analysis |
| GET | `/api/v1/analytics/vendor-participation` | Vendor stats |

### AI Features
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/v1/ai/eligibility` | Check bid eligibility |
| POST | `/api/v1/ai/technical-score` | Score technical bid |
| POST | `/api/v1/ai/risk-analysis` | Analyze risks |
| POST | `/api/v1/ai/vendor-rating` | Rate vendor |

## ⚙️ Environment Variables

### Backend
```env
# Database
DATABASE_URL=postgresql://user:password@localhost:5432/atems

# Security
SECRET_KEY=your-super-secret-key-min-32-chars

# AI
MISTRAL_API_KEY=your-mistral-api-key

# Email (optional)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email
SMTP_PASSWORD=your-password
```

### Frontend
```env
VITE_API_BASE_URL=http://localhost:3399/api/v1
```

## 🧪 Default Test Users

| Email | Password | Role |
|-------|----------|------|
| admin@atems.gov | Admin@123 | Admin |
| officer@atems.gov | Officer@123 | Tender Officer |
| evaluator@atems.gov | Evaluator@123 | Evaluator |
| bidder@atems.gov | Bidder@123 | Bidder |

## 📈 Roadmap

- [ ] Mobile App (React Native)
- [ ] Offline bid preparation
- [ ] WhatsApp notifications
- [ ] Blockchain audit trail
- [ ] Advanced fraud detection
- [ ] Multi-language support

## 🤝 Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open Pull Request

## 📄 License

This project is licensed under the MIT License.

## 🆘 Support

For issues and feature requests, please use GitHub Issues.

---

**Built with ❤️ for transparent and efficient public procurement**
