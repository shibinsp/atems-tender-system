# AI-Based Tender Evaluation & Management System (ATEMS)
## Complete Development Guide for Claude Code

---

## 🎯 Project Overview

Build a government-grade Tender Management System with AI-powered evaluation capabilities. This system will handle the complete tender lifecycle from RFP generation to bid evaluation using L1/L2/T1 criteria.

---

## 🚀 Quick Start Instructions for Claude Code

```bash
# Execute these commands to set up the project

# 1. Create project structure
mkdir -p tender-system/{frontend,backend}
cd tender-system

# 2. Initialize Frontend (React + Vite + TypeScript)
cd frontend
npm create vite@latest . -- --template react-ts
npm install

# 3. Install Frontend Dependencies
npm install @tanstack/react-query axios react-router-dom zustand react-hook-form @hookform/resolvers zod
npm install lucide-react recharts date-fns react-pdf @react-pdf/renderer
npm install tailwindcss postcss autoprefixer
npm install @radix-ui/react-dialog @radix-ui/react-dropdown-menu @radix-ui/react-toast @radix-ui/react-tabs
npm install class-variance-authority clsx tailwind-merge

# 4. Initialize Tailwind CSS
npx tailwindcss init -p

# 5. Initialize Backend (FastAPI)
cd ../backend
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# 6. Install Backend Dependencies
pip install fastapi uvicorn sqlalchemy pydantic python-jose passlib bcrypt python-multipart
pip install pypdf2 pdfplumber aiofiles python-dotenv alembic
pip install openai httpx
```

---

## 📁 Complete Project Structure

```
tender-system/
├── frontend/
│   ├── public/
│   │   └── govt-emblem.png
│   ├── src/
│   │   ├── components/
│   │   │   ├── ui/                    # Reusable UI components
│   │   │   │   ├── Button.tsx
│   │   │   │   ├── Input.tsx
│   │   │   │   ├── Select.tsx
│   │   │   │   ├── Modal.tsx
│   │   │   │   ├── DataTable.tsx
│   │   │   │   ├── StatusBadge.tsx
│   │   │   │   ├── FileUpload.tsx
│   │   │   │   ├── Toast.tsx
│   │   │   │   ├── Card.tsx
│   │   │   │   ├── Tabs.tsx
│   │   │   │   └── Loading.tsx
│   │   │   ├── layout/
│   │   │   │   ├── Header.tsx
│   │   │   │   ├── Sidebar.tsx
│   │   │   │   ├── Footer.tsx
│   │   │   │   ├── Layout.tsx
│   │   │   │   └── Breadcrumb.tsx
│   │   │   ├── dashboard/
│   │   │   │   ├── StatsCard.tsx
│   │   │   │   ├── TenderChart.tsx
│   │   │   │   ├── ActivityFeed.tsx
│   │   │   │   └── DeadlineWidget.tsx
│   │   │   ├── tender/
│   │   │   │   ├── TenderForm.tsx
│   │   │   │   ├── TenderCard.tsx
│   │   │   │   ├── TenderList.tsx
│   │   │   │   ├── EligibilityForm.tsx
│   │   │   │   └── DocumentManager.tsx
│   │   │   ├── bid/
│   │   │   │   ├── BidForm.tsx
│   │   │   │   ├── BidDocuments.tsx
│   │   │   │   ├── BankGuaranteeForm.tsx
│   │   │   │   └── BidStatusTracker.tsx
│   │   │   ├── evaluation/
│   │   │   │   ├── EvaluationPanel.tsx
│   │   │   │   ├── ScoreCard.tsx
│   │   │   │   ├── ComparativeTable.tsx
│   │   │   │   ├── AIEvaluation.tsx
│   │   │   │   └── RankingDisplay.tsx
│   │   │   ├── rfp/
│   │   │   │   ├── RFPBuilder.tsx
│   │   │   │   ├── TemplateEditor.tsx
│   │   │   │   ├── ClauseLibrary.tsx
│   │   │   │   └── RFPPreview.tsx
│   │   │   └── rfi/
│   │   │       ├── RFIForm.tsx
│   │   │       ├── RFIList.tsx
│   │   │       └── RFIResponse.tsx
│   │   ├── pages/
│   │   │   ├── auth/
│   │   │   │   ├── Login.tsx
│   │   │   │   ├── Register.tsx
│   │   │   │   └── ForgotPassword.tsx
│   │   │   ├── Dashboard.tsx
│   │   │   ├── tenders/
│   │   │   │   ├── TenderListPage.tsx
│   │   │   │   ├── TenderCreatePage.tsx
│   │   │   │   ├── TenderEditPage.tsx
│   │   │   │   └── TenderDetailsPage.tsx
│   │   │   ├── bids/
│   │   │   │   ├── MyBidsPage.tsx
│   │   │   │   ├── BidSubmissionPage.tsx
│   │   │   │   └── BidDetailsPage.tsx
│   │   │   ├── evaluation/
│   │   │   │   ├── EvaluationListPage.tsx
│   │   │   │   ├── EvaluationPage.tsx
│   │   │   │   └── ComparativeStatementPage.tsx
│   │   │   ├── rfp/
│   │   │   │   ├── RFPTemplatesPage.tsx
│   │   │   │   └── RFPGeneratePage.tsx
│   │   │   ├── rfi/
│   │   │   │   └── RFIPage.tsx
│   │   │   ├── reports/
│   │   │   │   └── ReportsPage.tsx
│   │   │   └── admin/
│   │   │       ├── UsersPage.tsx
│   │   │       ├── DepartmentsPage.tsx
│   │   │       ├── SettingsPage.tsx
│   │   │       └── AuditLogsPage.tsx
│   │   ├── hooks/
│   │   │   ├── useAuth.ts
│   │   │   ├── useTenders.ts
│   │   │   ├── useBids.ts
│   │   │   ├── useEvaluation.ts
│   │   │   └── useNotifications.ts
│   │   ├── services/
│   │   │   ├── api.ts
│   │   │   ├── authService.ts
│   │   │   ├── tenderService.ts
│   │   │   ├── bidService.ts
│   │   │   └── evaluationService.ts
│   │   ├── store/
│   │   │   ├── authStore.ts
│   │   │   ├── tenderStore.ts
│   │   │   └── uiStore.ts
│   │   ├── types/
│   │   │   └── index.ts
│   │   ├── utils/
│   │   │   ├── formatters.ts
│   │   │   ├── validators.ts
│   │   │   └── constants.ts
│   │   ├── App.tsx
│   │   ├── main.tsx
│   │   └── index.css
│   ├── tailwind.config.js
│   ├── package.json
│   └── vite.config.ts
│
├── backend/
│   ├── app/
│   │   ├── __init__.py
│   │   ├── main.py
│   │   ├── config.py
│   │   ├── database.py
│   │   ├── api/
│   │   │   ├── __init__.py
│   │   │   └── v1/
│   │   │       ├── __init__.py
│   │   │       ├── router.py
│   │   │       └── endpoints/
│   │   │           ├── __init__.py
│   │   │           ├── auth.py
│   │   │           ├── tenders.py
│   │   │           ├── bids.py
│   │   │           ├── evaluation.py
│   │   │           ├── rfp.py
│   │   │           ├── rfi.py
│   │   │           ├── reports.py
│   │   │           └── admin.py
│   │   ├── core/
│   │   │   ├── __init__.py
│   │   │   ├── security.py
│   │   │   └── dependencies.py
│   │   ├── models/
│   │   │   ├── __init__.py
│   │   │   ├── user.py
│   │   │   ├── tender.py
│   │   │   ├── bid.py
│   │   │   ├── evaluation.py
│   │   │   └── rfi.py
│   │   ├── schemas/
│   │   │   ├── __init__.py
│   │   │   ├── user.py
│   │   │   ├── tender.py
│   │   │   ├── bid.py
│   │   │   └── evaluation.py
│   │   ├── services/
│   │   │   ├── __init__.py
│   │   │   ├── auth_service.py
│   │   │   ├── tender_service.py
│   │   │   ├── bid_service.py
│   │   │   ├── evaluation_service.py
│   │   │   ├── ai_service.py
│   │   │   ├── pdf_service.py
│   │   │   └── notification_service.py
│   │   └── utils/
│   │       ├── __init__.py
│   │       ├── helpers.py
│   │       └── file_handler.py
│   ├── uploads/
│   │   ├── tenders/
│   │   ├── bids/
│   │   └── documents/
│   ├── templates/
│   │   └── rfp/
│   ├── requirements.txt
│   └── .env
│
└── README.md
```

---

## 🎨 UI Design Specifications

### Color Palette (Government Professional Theme)
```css
:root {
  /* Primary Colors */
  --primary: #1e3a5f;           /* Dark Navy Blue - Headers, Sidebar */
  --primary-light: #2c5282;      /* Lighter Navy - Hover states */
  --primary-dark: #1a365d;       /* Darker Navy - Active states */
  
  /* Accent Colors */
  --secondary: #c53030;          /* Government Red - Important actions */
  --accent: #d69e2e;             /* Gold - Highlights, warnings */
  
  /* Background Colors */
  --bg-primary: #f7fafc;         /* Light Gray - Page background */
  --bg-white: #ffffff;           /* White - Cards, content areas */
  --bg-dark: #1e3a5f;            /* Dark - Sidebar background */
  
  /* Text Colors */
  --text-primary: #1a202c;       /* Near Black - Primary text */
  --text-secondary: #4a5568;     /* Gray - Secondary text */
  --text-light: #718096;         /* Light Gray - Placeholder, hints */
  --text-white: #ffffff;         /* White - On dark backgrounds */
  
  /* Status Colors */
  --success: #38a169;            /* Green - Success, active */
  --warning: #d69e2e;            /* Gold - Warning, pending */
  --error: #c53030;              /* Red - Error, rejected */
  --info: #3182ce;               /* Blue - Information */
  
  /* Border Colors */
  --border: #e2e8f0;             /* Light Gray - Borders */
  --border-dark: #cbd5e0;        /* Darker Gray - Hover borders */
}
```

### Tailwind Config
```javascript
// tailwind.config.js
module.exports = {
  content: ["./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#1e3a5f',
          light: '#2c5282',
          dark: '#1a365d',
        },
        secondary: '#c53030',
        accent: '#d69e2e',
        govt: {
          navy: '#1e3a5f',
          red: '#c53030',
          gold: '#d69e2e',
        }
      },
      fontFamily: {
        sans: ['Inter', 'Roboto', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        'govt': '0 1px 3px rgba(0, 0, 0, 0.1), 0 1px 2px rgba(0, 0, 0, 0.06)',
        'govt-lg': '0 4px 6px rgba(0, 0, 0, 0.07), 0 2px 4px rgba(0, 0, 0, 0.06)',
      }
    },
  },
  plugins: [],
}
```

---

## 📝 Key Component Implementations

### 1. Layout Header Component
```tsx
// src/components/layout/Header.tsx
import React from 'react';
import { Bell, User, LogOut, ChevronDown } from 'lucide-react';

const Header: React.FC = () => {
  return (
    <header className="fixed top-0 left-0 right-0 h-16 bg-white border-b border-gray-200 shadow-govt z-50">
      <div className="flex items-center justify-between h-full px-6">
        {/* Logo & Title */}
        <div className="flex items-center space-x-4">
          <img src="/govt-emblem.png" alt="Government Emblem" className="h-10 w-10" />
          <div>
            <h1 className="text-lg font-semibold text-primary">
              AI Tender Evaluation System
            </h1>
            <p className="text-xs text-gray-500">Government of India</p>
          </div>
        </div>
        
        {/* Right Section */}
        <div className="flex items-center space-x-4">
          {/* Notifications */}
          <button className="relative p-2 text-gray-600 hover:bg-gray-100 rounded-lg">
            <Bell className="w-5 h-5" />
            <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
          </button>
          
          {/* User Menu */}
          <div className="flex items-center space-x-2 cursor-pointer hover:bg-gray-100 rounded-lg px-3 py-2">
            <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center">
              <User className="w-4 h-4 text-white" />
            </div>
            <span className="text-sm font-medium text-gray-700">Admin User</span>
            <ChevronDown className="w-4 h-4 text-gray-500" />
          </div>
        </div>
      </div>
    </header>
  );
};
```

### 2. Sidebar Navigation
```tsx
// src/components/layout/Sidebar.tsx
import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard, FileText, Send, ClipboardCheck,
  FileSearch, BarChart3, Users, Settings, HelpCircle
} from 'lucide-react';

const menuItems = [
  { icon: LayoutDashboard, label: 'Dashboard', path: '/dashboard' },
  { icon: FileText, label: 'Tender Management', path: '/tenders' },
  { icon: Send, label: 'Bid Management', path: '/bids' },
  { icon: ClipboardCheck, label: 'Evaluation', path: '/evaluation' },
  { icon: FileSearch, label: 'RFP Generator', path: '/rfp' },
  { icon: BarChart3, label: 'Reports', path: '/reports' },
  { icon: Users, label: 'User Management', path: '/admin/users' },
  { icon: Settings, label: 'Settings', path: '/admin/settings' },
];

const Sidebar: React.FC = () => {
  return (
    <aside className="fixed left-0 top-16 h-[calc(100vh-4rem)] w-64 bg-primary text-white shadow-lg">
      <nav className="py-4">
        {menuItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) =>
              `flex items-center px-6 py-3 text-sm font-medium transition-colors
              ${isActive 
                ? 'bg-white/10 border-r-4 border-accent text-white' 
                : 'text-gray-300 hover:bg-white/5 hover:text-white'
              }`
            }
          >
            <item.icon className="w-5 h-5 mr-3" />
            {item.label}
          </NavLink>
        ))}
      </nav>
    </aside>
  );
};
```

### 3. Dashboard Stats Card
```tsx
// src/components/dashboard/StatsCard.tsx
import React from 'react';
import { LucideIcon } from 'lucide-react';

interface StatsCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  trend?: { value: number; isPositive: boolean };
  color: 'blue' | 'green' | 'yellow' | 'red';
}

const colorClasses = {
  blue: 'bg-blue-50 text-blue-600 border-blue-200',
  green: 'bg-green-50 text-green-600 border-green-200',
  yellow: 'bg-yellow-50 text-yellow-600 border-yellow-200',
  red: 'bg-red-50 text-red-600 border-red-200',
};

const StatsCard: React.FC<StatsCardProps> = ({ title, value, icon: Icon, trend, color }) => {
  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-govt hover:shadow-govt-lg transition-shadow">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-500 uppercase tracking-wide">{title}</p>
          <p className="mt-2 text-3xl font-bold text-gray-900">{value}</p>
          {trend && (
            <p className={`mt-1 text-sm ${trend.isPositive ? 'text-green-600' : 'text-red-600'}`}>
              {trend.isPositive ? '↑' : '↓'} {Math.abs(trend.value)}% from last month
            </p>
          )}
        </div>
        <div className={`p-4 rounded-lg border ${colorClasses[color]}`}>
          <Icon className="w-8 h-8" />
        </div>
      </div>
    </div>
  );
};
```

---

## 🔐 Backend Implementation

### 1. Main FastAPI Application
```python
# backend/app/main.py
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.api.v1.router import api_router
from app.database import engine, Base

# Create database tables
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="AI Tender Evaluation System",
    description="Government Tender Management with AI-powered Evaluation",
    version="1.0.0",
)

# CORS Configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(api_router, prefix="/api/v1")

@app.get("/health")
def health_check():
    return {"status": "healthy", "service": "ATEMS API"}
```

### 2. Database Models
```python
# backend/app/models/tender.py
from sqlalchemy import Column, Integer, String, Text, DateTime, Numeric, Boolean, ForeignKey, Enum
from sqlalchemy.orm import relationship
from datetime import datetime
import enum
from app.database import Base

class TenderStatus(str, enum.Enum):
    DRAFT = "Draft"
    PUBLISHED = "Published"
    UNDER_EVALUATION = "Under Evaluation"
    EVALUATED = "Evaluated"
    AWARDED = "Awarded"
    CANCELLED = "Cancelled"
    CLOSED = "Closed"

class TenderType(str, enum.Enum):
    OPEN = "Open Tender"
    LIMITED = "Limited Tender"
    SINGLE_SOURCE = "Single Source"
    TWO_STAGE = "Two-Stage"

class Tender(Base):
    __tablename__ = "tenders"
    
    id = Column(Integer, primary_key=True, index=True)
    tender_id = Column(String(50), unique=True, index=True, nullable=False)
    reference_number = Column(String(100))
    title = Column(String(500), nullable=False)
    description = Column(Text)
    category_id = Column(Integer, ForeignKey("categories.id"))
    department_id = Column(Integer, ForeignKey("departments.id"))
    tender_type = Column(Enum(TenderType), default=TenderType.OPEN)
    estimated_value = Column(Numeric(18, 2))
    currency = Column(String(10), default="INR")
    emd_amount = Column(Numeric(18, 2))
    bid_validity_days = Column(Integer, default=90)
    status = Column(Enum(TenderStatus), default=TenderStatus.DRAFT)
    
    # Timeline
    publishing_date = Column(DateTime)
    submission_start = Column(DateTime)
    submission_deadline = Column(DateTime)
    technical_opening_date = Column(DateTime)
    financial_opening_date = Column(DateTime)
    
    # Metadata
    created_by = Column(Integer, ForeignKey("users.id"))
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    documents = relationship("TenderDocument", back_populates="tender")
    eligibility_criteria = relationship("TenderEligibility", back_populates="tender")
    bids = relationship("Bid", back_populates="tender")
    evaluation_criteria = relationship("EvaluationCriteria", back_populates="tender")
```

### 3. AI Evaluation Service
```python
# backend/app/services/ai_service.py
import openai
from typing import Dict, List, Any
import json

class AIEvaluationService:
    def __init__(self, api_key: str):
        self.client = openai.OpenAI(api_key=api_key)
    
    async def evaluate_eligibility(
        self, 
        bid_data: Dict[str, Any], 
        eligibility_criteria: List[Dict]
    ) -> Dict[str, Any]:
        """AI-powered eligibility verification"""
        
        prompt = f"""
        Evaluate the following bid against eligibility criteria:
        
        BID DATA:
        {json.dumps(bid_data, indent=2)}
        
        ELIGIBILITY CRITERIA:
        {json.dumps(eligibility_criteria, indent=2)}
        
        Analyze each criterion and respond with:
        1. Whether each criterion is met (PASS/FAIL)
        2. Confidence score (0-100)
        3. Remarks/Evidence
        
        Return as JSON format.
        """
        
        response = self.client.chat.completions.create(
            model="gpt-4",
            messages=[{"role": "user", "content": prompt}],
            response_format={"type": "json_object"}
        )
        
        return json.loads(response.choices[0].message.content)
    
    async def score_technical_proposal(
        self,
        proposal_text: str,
        scoring_criteria: List[Dict]
    ) -> Dict[str, Any]:
        """AI-powered technical scoring"""
        
        prompt = f"""
        Score the following technical proposal against criteria:
        
        PROPOSAL:
        {proposal_text[:5000]}  # Limit text length
        
        SCORING CRITERIA:
        {json.dumps(scoring_criteria, indent=2)}
        
        For each criterion, provide:
        1. Score (out of max_score)
        2. Justification
        3. Strengths
        4. Weaknesses
        
        Return as JSON format.
        """
        
        response = self.client.chat.completions.create(
            model="gpt-4",
            messages=[{"role": "user", "content": prompt}],
            response_format={"type": "json_object"}
        )
        
        return json.loads(response.choices[0].message.content)
    
    async def calculate_l1_ranking(self, bids: List[Dict]) -> List[Dict]:
        """Calculate L1/L2/L3 ranking based on price"""
        
        qualified_bids = [b for b in bids if b.get('is_qualified', True)]
        
        sorted_bids = sorted(
            qualified_bids, 
            key=lambda x: float(x.get('financial_amount', float('inf')))
        )
        
        for rank, bid in enumerate(sorted_bids, 1):
            bid['rank'] = rank
            bid['ranking_label'] = f"L{rank}"
        
        return sorted_bids
    
    async def generate_comparative_statement(
        self, 
        tender: Dict, 
        evaluated_bids: List[Dict]
    ) -> Dict[str, Any]:
        """Generate comprehensive comparative statement"""
        
        return {
            "tender_info": {
                "tender_id": tender['tender_id'],
                "title": tender['title'],
                "estimated_value": tender['estimated_value']
            },
            "evaluation_summary": {
                "total_bids": len(evaluated_bids),
                "qualified_bids": len([b for b in evaluated_bids if b.get('is_qualified')]),
                "disqualified_bids": len([b for b in evaluated_bids if not b.get('is_qualified')])
            },
            "bid_comparison": evaluated_bids,
            "recommendation": {
                "winner": evaluated_bids[0] if evaluated_bids else None,
                "rationale": "Lowest qualified bidder (L1)"
            }
        }
```

---

## 📋 Evaluation Types Implementation

### L1 (Lowest Price) Evaluation
```python
# backend/app/services/evaluation_service.py

class EvaluationService:
    
    async def l1_evaluation(self, tender_id: int, db: Session) -> Dict:
        """
        L1 Evaluation: Lowest Price Based
        - All technically qualified bidders are considered
        - Lowest quoted price wins
        """
        # Get all qualified bids
        qualified_bids = db.query(Bid).filter(
            Bid.tender_id == tender_id,
            Bid.is_qualified == True
        ).all()
        
        if not qualified_bids:
            return {"error": "No qualified bids found"}
        
        # Sort by financial amount (ascending)
        sorted_bids = sorted(qualified_bids, key=lambda x: x.financial_amount)
        
        # Assign rankings
        rankings = []
        for rank, bid in enumerate(sorted_bids, 1):
            bid.rank = rank
            rankings.append({
                "rank": rank,
                "label": f"L{rank}",
                "bidder_name": bid.bidder.company_name,
                "amount": float(bid.financial_amount),
                "status": "Winner" if rank == 1 else "Runner Up"
            })
        
        db.commit()
        
        return {
            "evaluation_type": "L1",
            "total_qualified": len(sorted_bids),
            "l1_bidder": rankings[0],
            "rankings": rankings
        }
    
    async def t1_evaluation(self, tender_id: int, db: Session) -> Dict:
        """
        T1 Evaluation: Highest Technical Score
        - Based on weighted technical parameters
        """
        # Get all submitted bids with their technical scores
        bids_with_scores = db.query(Bid).filter(
            Bid.tender_id == tender_id,
            Bid.status == BidStatus.SUBMITTED
        ).all()
        
        # Calculate weighted technical score for each bid
        for bid in bids_with_scores:
            evaluations = db.query(Evaluation).filter(
                Evaluation.bid_id == bid.id
            ).all()
            
            total_score = sum(e.score * e.criteria.weight for e in evaluations)
            bid.technical_score = total_score
        
        # Sort by technical score (descending)
        sorted_bids = sorted(bids_with_scores, key=lambda x: x.technical_score, reverse=True)
        
        rankings = []
        for rank, bid in enumerate(sorted_bids, 1):
            rankings.append({
                "rank": rank,
                "label": f"T{rank}",
                "bidder_name": bid.bidder.company_name,
                "technical_score": float(bid.technical_score),
                "status": "Highest Technical" if rank == 1 else ""
            })
        
        return {
            "evaluation_type": "T1",
            "rankings": rankings
        }
    
    async def qcbs_evaluation(
        self, 
        tender_id: int, 
        technical_weight: float = 0.7,
        financial_weight: float = 0.3,
        db: Session = None
    ) -> Dict:
        """
        QCBS: Quality and Cost Based Selection
        Combined Score = (Tech Score × Tech Weight) + (Fin Score × Fin Weight)
        """
        bids = db.query(Bid).filter(
            Bid.tender_id == tender_id,
            Bid.is_qualified == True
        ).all()
        
        # Normalize financial scores (lowest price gets highest score)
        min_amount = min(b.financial_amount for b in bids)
        for bid in bids:
            bid.financial_score = (min_amount / bid.financial_amount) * 100
        
        # Calculate combined scores
        for bid in bids:
            bid.combined_score = (
                (bid.technical_score * technical_weight) +
                (bid.financial_score * financial_weight)
            )
        
        # Sort by combined score
        sorted_bids = sorted(bids, key=lambda x: x.combined_score, reverse=True)
        
        rankings = []
        for rank, bid in enumerate(sorted_bids, 1):
            bid.rank = rank
            rankings.append({
                "rank": rank,
                "bidder_name": bid.bidder.company_name,
                "technical_score": float(bid.technical_score),
                "financial_score": float(bid.financial_score),
                "combined_score": float(bid.combined_score),
                "status": "Recommended" if rank == 1 else ""
            })
        
        db.commit()
        
        return {
            "evaluation_type": "QCBS",
            "weights": {"technical": technical_weight, "financial": financial_weight},
            "rankings": rankings
        }
```

---

## 📄 Document Upload Rules

### Frontend File Upload Component
```tsx
// src/components/ui/FileUpload.tsx
import React, { useCallback, useState } from 'react';
import { Upload, X, FileText, AlertCircle } from 'lucide-react';

interface FileUploadProps {
  onUpload: (files: File[]) => void;
  accept?: string;
  maxSizeMB?: number;
  multiple?: boolean;
  label: string;
  required?: boolean;
}

const FileUpload: React.FC<FileUploadProps> = ({
  onUpload,
  accept = ".pdf",
  maxSizeMB = 25,
  multiple = false,
  label,
  required = false,
}) => {
  const [files, setFiles] = useState<File[]>([]);
  const [error, setError] = useState<string>('');
  
  const validateFile = (file: File): string | null => {
    // Check file type
    if (!file.name.toLowerCase().endsWith('.pdf')) {
      return 'Only PDF files are allowed';
    }
    
    // Check file size
    const sizeMB = file.size / (1024 * 1024);
    if (sizeMB > maxSizeMB) {
      return `File size must be less than ${maxSizeMB}MB`;
    }
    
    return null;
  };
  
  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    const droppedFiles = Array.from(e.dataTransfer.files);
    
    for (const file of droppedFiles) {
      const error = validateFile(file);
      if (error) {
        setError(error);
        return;
      }
    }
    
    setError('');
    setFiles(prev => [...prev, ...droppedFiles]);
    onUpload(droppedFiles);
  }, [maxSizeMB, onUpload]);
  
  return (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-gray-700">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      
      <div
        onDrop={handleDrop}
        onDragOver={(e) => e.preventDefault()}
        className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center 
                   hover:border-primary transition-colors cursor-pointer"
      >
        <Upload className="w-10 h-10 mx-auto text-gray-400 mb-2" />
        <p className="text-sm text-gray-600">
          Drag & drop PDF files here, or <span className="text-primary font-medium">browse</span>
        </p>
        <p className="text-xs text-gray-400 mt-1">
          PDF only, max {maxSizeMB}MB per file
        </p>
      </div>
      
      {error && (
        <div className="flex items-center text-red-600 text-sm">
          <AlertCircle className="w-4 h-4 mr-1" />
          {error}
        </div>
      )}
      
      {files.length > 0 && (
        <div className="space-y-2">
          {files.map((file, idx) => (
            <div key={idx} className="flex items-center justify-between bg-gray-50 p-3 rounded-lg">
              <div className="flex items-center">
                <FileText className="w-5 h-5 text-primary mr-2" />
                <span className="text-sm text-gray-700">{file.name}</span>
                <span className="text-xs text-gray-400 ml-2">
                  ({(file.size / (1024 * 1024)).toFixed(2)} MB)
                </span>
              </div>
              <button
                onClick={() => setFiles(files.filter((_, i) => i !== idx))}
                className="text-gray-400 hover:text-red-500"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
```

---

## 🔄 API Endpoints Summary

```yaml
Authentication:
  - POST /api/v1/auth/register - Register new user
  - POST /api/v1/auth/login - User login
  - POST /api/v1/auth/logout - User logout
  - GET /api/v1/auth/profile - Get user profile

Tenders:
  - GET /api/v1/tenders - List all tenders (with filters)
  - POST /api/v1/tenders - Create new tender
  - GET /api/v1/tenders/{id} - Get tender details
  - PUT /api/v1/tenders/{id} - Update tender
  - DELETE /api/v1/tenders/{id} - Delete tender
  - POST /api/v1/tenders/{id}/publish - Publish tender
  - POST /api/v1/tenders/{id}/documents - Upload documents
  - GET /api/v1/tenders/{id}/eligibility - Get eligibility criteria
  - POST /api/v1/tenders/{id}/eligibility - Set eligibility criteria

Bids:
  - GET /api/v1/tenders/{tender_id}/bids - List bids for tender
  - POST /api/v1/tenders/{tender_id}/bids - Submit bid
  - GET /api/v1/bids/{id} - Get bid details
  - PUT /api/v1/bids/{id} - Update bid
  - POST /api/v1/bids/{id}/submit - Final submission
  - POST /api/v1/bids/{id}/withdraw - Withdraw bid
  - POST /api/v1/bids/{id}/documents - Upload bid documents
  - POST /api/v1/bids/{id}/bank-guarantee - Upload bank guarantee

Evaluation:
  - GET /api/v1/tenders/{id}/evaluation - Get evaluation status
  - POST /api/v1/tenders/{id}/evaluation/start - Start evaluation
  - POST /api/v1/bids/{bid_id}/evaluate - Submit evaluation scores
  - POST /api/v1/tenders/{id}/evaluation/ai-evaluate - Run AI evaluation
  - GET /api/v1/tenders/{id}/comparative-statement - Get comparative statement
  - POST /api/v1/tenders/{id}/declare-winner - Declare winner

RFP:
  - GET /api/v1/rfp/templates - List RFP templates
  - POST /api/v1/rfp/templates - Create template
  - POST /api/v1/rfp/generate/{tender_id} - Generate RFP document
  - GET /api/v1/rfp/clauses - Get clause library

RFI:
  - GET /api/v1/tenders/{tender_id}/rfis - List RFIs
  - POST /api/v1/tenders/{tender_id}/rfis - Submit RFI
  - PUT /api/v1/rfis/{id}/respond - Respond to RFI

Reports:
  - GET /api/v1/reports/tender-status - Tender status report
  - GET /api/v1/reports/evaluation-summary - Evaluation summary
  - GET /api/v1/reports/comparative-statement/{tender_id} - Comparative statement

Admin:
  - GET /api/v1/admin/users - List users
  - POST /api/v1/admin/users - Create user
  - GET /api/v1/admin/departments - List departments
  - GET /api/v1/admin/audit-logs - View audit logs
```

---

## ✅ Development Checklist

### Phase 1: Foundation
- [ ] Project structure setup
- [ ] Database configuration (SQLite + SQLAlchemy)
- [ ] User authentication (JWT)
- [ ] Basic layout (Header, Sidebar, Footer)
- [ ] Protected routes
- [ ] Toast notifications

### Phase 2: Tender Management
- [ ] Tender CRUD operations
- [ ] Tender form with validation
- [ ] Document upload
- [ ] Eligibility criteria setup
- [ ] Tender publishing workflow
- [ ] Dashboard with stats

### Phase 3: Bidding System
- [ ] Bidder registration
- [ ] Bid submission form
- [ ] Multi-envelope support
- [ ] Bank guarantee upload
- [ ] RFI submission
- [ ] Bid status tracking

### Phase 4: Evaluation
- [ ] Evaluation criteria setup
- [ ] Manual scoring interface
- [ ] L1/L2/T1 calculation
- [ ] QCBS evaluation
- [ ] Comparative statement
- [ ] Result declaration

### Phase 5: AI Features
- [ ] AI eligibility verification
- [ ] Automated document extraction
- [ ] AI-powered scoring
- [ ] RFP generation
- [ ] Smart recommendations

### Phase 6: Reports & Polish
- [ ] Comprehensive reports
- [ ] PDF export
- [ ] Audit logs
- [ ] Email notifications
- [ ] Final UI polish

---

## 🚀 Run Commands

```bash
# Start Backend
cd backend
source venv/bin/activate
uvicorn app.main:app --reload --port 8000

# Start Frontend
cd frontend
npm run dev

# Access URLs
# Frontend: http://localhost:5173
# Backend API: http://localhost:8000
# API Docs: http://localhost:8000/docs
```

---

This comprehensive guide provides everything needed to build the AI-Based Tender Evaluation System. Follow the phases sequentially and refer to the component implementations for detailed code structures.
