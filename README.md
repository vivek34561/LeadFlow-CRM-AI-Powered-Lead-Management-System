# 🚀 LeadFlow CRM – AI-Powered Lead Management System

<p align="center">
  <img src="https://img.shields.io/badge/python-3.11+-blue.svg" />
  <img src="https://img.shields.io/badge/FastAPI-backend-green.svg" />
  <img src="https://img.shields.io/badge/Next.js-frontend-black.svg" />
  <img src="https://img.shields.io/badge/n8n-automation-orange.svg" />
  <img src="https://img.shields.io/badge/PostgreSQL-database-blue.svg" />
  <img src="https://img.shields.io/badge/AI-Lead%20Scoring-purple.svg" />
  <img src="https://img.shields.io/badge/license-MIT-blue.svg" />
</p>

<p align="center">
  <strong>An AI-powered CRM system for automated lead scoring, follow-ups, and conversion tracking with scalable workflow automation.</strong>
</p>

<p align="center">
  <a href="#key-features">Features</a> |
  <a href="#architecture">Architecture</a> |
  <a href="#tech-stack">Tech Stack</a> |
  <a href="#quick-start">Quick Start</a>
</p>

---
## 📸 Screenshots
![Dashboard](frontend/asserts/dashboard.jpg)
![n8n_workflow](frontend/asserts/n8n_workflow.jpg)

## Overview



**LeadFlow CRM** is a full-stack **AI-powered Lead Management System** designed to automate the complete lead lifecycle.

It focuses on:

* Intelligent lead prioritization using AI
* Automated email follow-ups with CRON workflows
* Real-time analytics dashboard
* Multi-user CRM system with role-based access

👉 Built as a **scalable SaaS architecture (n8n + FastAPI + Next.js)**

---

## Key Features

### 🧠 AI Lead Scoring

* Classifies leads into:

  * HOT 🔥
  * WARM 🌤️
  * COLD ❄️
* Based on:

  * Intent
  * Budget
  * Timeline
  * Interest

---

### 🔗 Multi-Source Lead Ingestion

* Webhook (website forms)
* Google Sheets / Forms
* Extendable to CSV/API inputs

---

### 📧 Automated Email System

* HOT → aggressive follow-ups
* WARM → nurturing emails
* COLD → awareness emails

---

### 🔁 CRON-Based Follow-Up System

Replaced inefficient WAIT nodes with:

```
CRON → Fetch Leads → Send Email → Update Followup Count
```

✅ Scalable
✅ Production-ready
✅ No stuck workflows

---

### 📊 Analytics Dashboard

* Total leads tracking
* HOT/WARM/COLD distribution
* Conversion metrics
* Status breakdown

---

### 🔐 Authentication & Role-Based Access

* Admin & User roles
* Multi-user system
* Lead ownership

---

### 🧾 Lead Management

* Create / Read / Update leads
* Status tracking:

```
NEW → CONTACTED → CONVERTED → CLOSED
```

---

### 💬 Slack Integration

* Alerts for HOT leads
* Includes lead summary + action suggestions

---

## Architecture

```
Lead Source (Form / Sheet)
        ↓
       n8n (Automation Engine)
        ↓
   Backend API (FastAPI)
        ↓
   PostgreSQL Database
        ↑
   Frontend Dashboard (Next.js)
```

---

## Workflow

```
1. Lead captured via webhook/form
2. Data normalized
3. AI scoring applied
4. Lead stored via backend API
5. Email automation triggered
6. CRON handles follow-ups
7. Dashboard displays analytics
```

---

## Tech Stack

| Layer      | Technology                   |
| ---------- | ---------------------------- |
| Language   | Python 3.11+, TypeScript     |
| Backend    | FastAPI, SQLAlchemy          |
| Frontend   | Next.js, React, Tailwind CSS |
| Automation | n8n (CRON workflows)         |
| Database   | PostgreSQL                   |
| AI         | LLM (Gemini / Groq / OpenAI) |
| Auth       | JWT Authentication           |
| Charts     | Recharts                     |

---

## Project Structure

```id="yd8c7k"
backend/
├── app.py
├── models.py
├── schemas.py
├── routes/
├── services/

frontend/
├── app/
├── components/
├── lib/

n8n/
├── ingestion workflow
├── email automation
├── cron workflow
```

---

## Quick Start

### Prerequisites

* Python 3.11+
* Node.js 18+
* PostgreSQL
* n8n (optional but recommended)

---

### Installation

```bash id="k3t7qj"
git clone <your-repo>
cd LeadFlow-CRM
```

---

### Backend Setup

```bash id="2c9lzx"
cd backend
pip install -r requirements.txt
uvicorn app:app --reload
```

---

### Frontend Setup

```bash id="6g7r0x"
cd frontend
npm install
npm run dev
```

---

### Environment Variables

```env id="u8c1xz"
DATABASE_URL=postgresql://user:password@localhost:5432/db
JWT_SECRET=your_secret_key
NEXT_PUBLIC_API_URL=http://localhost:8000/api/v1
```

---

## API Endpoints

### Leads

* `POST /leads` → Create lead
* `GET /leads` → Fetch leads
* `PATCH /leads/{id}` → Update lead

---

### Automation

* `GET /leads/pending-followups`

---

### Analytics

* `GET /analytics`

---

## Development Timeline

* Built FastAPI backend with clean architecture
* Designed PostgreSQL schema for lead tracking
* Integrated n8n workflows for automation
* Implemented CRON-based follow-up system
* Developed Next.js dashboard with analytics
* Added JWT authentication and role-based access

---

## Future Enhancements

* Pipeline (Kanban) view
* Activity timeline tracking
* AI-based lead recommendations
* Email performance analytics
* Lead assignment automation

---

## Author

**Vivek Gupta**
AI Engineer | Building real-world AI SaaS systems

---

## License

MIT License © 2026
