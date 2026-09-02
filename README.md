# PANNA.AI — Personalized AI Reading & Authoring Platform

PANNA.AI turns books and course chapters into interactive learning experiences. Alongside book creation, publishing, discovery, and reader tools, the hackathon edition includes an **AI Learning Lab** that works directly in the browser:

- Frequency-weighted extractive chapter summaries
- Key-concept discovery
- Chapter-grounded question answering with confidence and evidence
- Automatically generated knowledge checks with explanations
- Reading difficulty, word count, and estimated study time
- Privacy-first, on-device processing with no API key required

> Transparency: PANNA.AI began as a book authoring/publishing foundation. The AI Learning Lab and education-focused experience are the new challenge contribution.

A startup-grade, professional web application built with **FastAPI** (Python) and **React + Vite** (JavaScript/Tailwind CSS).

---

## 🌐 Local Hosting Links

| Service | Local URL | Description |
| :--- | :--- | :--- |
| **Frontend Web App** | [http://127.0.0.1:5173](http://127.0.0.1:5173) | Main UI (Landing, Author Dashboard, Writing Studio, Reader Mode, Maps, Admin) |
| **Backend REST API** | [http://127.0.0.1:8000](http://127.0.0.1:8000) | FastAPI application server |
| **Swagger Interactive Docs** | [http://127.0.0.1:8000/docs](http://127.0.0.1:8000/docs) | Interactive API testing playground |

---

## ⚡ Quick Start (Local Hosting)

### Option 1: One-Click Launch (Windows)
Double click `start.bat` or run in terminal:
```cmd
start.bat
```

### Option 2: Manual Start

#### 1. Start Backend API Server
```bash
cd backend
.\venv\Scripts\python.exe -m uvicorn app.main:app --host 127.0.0.1 --port 8000 --reload
```

#### 2. Start Frontend Dev Server
```bash
cd frontend
npm run dev -- --host 127.0.0.1 --port 5173
```

---

## 🔑 Administrator Access

Administrator credentials must be configured privately through environment variables. Never commit real passwords or production secrets to the repository.

## Production environment

PANNA's Vercel serverless API requires `MONGO_URI`, `JWT_SECRET`, `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, and `CLOUDINARY_API_SECRET`. Copy the names from `.env.example` into the PANNA.AI Vercel project's environment settings. Do not reuse a database password that has ever been committed publicly; rotate it in MongoDB Atlas first.

Public and authorization rules:

- Anyone can browse and read public free books without signing in.
- Paid-book access, purchases, author dashboards, and book creation require authentication.
- Only the author can edit or delete their own books and chapters.
- Uploaded assets are stored in a per-user Cloudinary folder.

---

## 🧪 Running Automated Tests

### Backend Pytest Suite
```bash
cd backend
.\venv\Scripts\pytest -v
```

### Frontend Production Build Test
```bash
cd frontend
npm run build
```
