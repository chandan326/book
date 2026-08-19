# AI Book Creation, Editing, Publishing, Reading & Author Management Platform

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

## 🔑 Initial Super Admin Credentials
- **Email**: `chandan.rai771714@gmail.com`
- **Password**: `Admin12345!`
- **Role**: `Super Admin`

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
