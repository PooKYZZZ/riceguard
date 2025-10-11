# 🌾 RiceGuard

RiceGuard is a monorepo for Team&nbsp;27’s multi-platform solution that detects rice leaf diseases from images. The project combines a React web app, a React Native mobile app, and a FastAPI backend that serves a TensorFlow model, all backed by MongoDB Atlas.

---

## 📚 Academic Context

| Track | Course | Section |
|-------|--------|---------|
| Web application | CPE025 – Software Design | CPE41S4 |
| Mobile application | CPE026 – Emerging Technologies 3 | CPE41S4 |

**Advisers:** Engr. Neal Barton James Matira (Software Design), Engr. Robin Valenzuela (Emerging Technologies 3)

---

## 📁 Repository Structure

```
riceguard/
├─ backend/        # FastAPI API (auth, scans, recommendations, uploads)
├─ frontend/       # React web application
└─ ml/             # Shared ML artifacts (model.h5 / model.tflite, preprocessing helpers)
```

### Backend Highlights
- FastAPI + Starlette + Uvicorn
- JWT authentication (python-jose + passlib)
- MongoDB Atlas using pymongo
- Image uploads persisted locally (configurable `UPLOAD_DIR`)
- TensorFlow inference via `ml/model.h5`

### Frontend Highlights
- React + react-router DOM
- Fetches API through `frontend/src/api.js`
- Handles scan upload, history browsing, and recommendations

### Mobile Highlights (React Native / Expo)
- Uses TensorFlow Lite (`ml/model.tflite`) for on-device inference
- Provides offline predictions, optional sync with backend

---

## 🚀 Quick Start

### 1. Backend API

```bash
cd backend
python -m venv .venv
.\.venv\Scripts\Activate.ps1  # PowerShell
# source .venv/bin/activate     # macOS/Linux
pip install -r requirements.txt
```

Create `backend/.env` (never commit this file):

```env
MONGO_URI=mongodb+srv://<user>:<pass>@<cluster>.mongodb.net/riceguard_db
DB_NAME=riceguard_db

JWT_SECRET=CHANGE_ME_SUPER_SECRET
JWT_ALGORITHM=HS256
TOKEN_EXPIRE_HOURS=6

UPLOAD_DIR=uploads
MAX_UPLOAD_MB=8

ALLOWED_ORIGINS=http://localhost:3000,http://127.0.0.1:3000,http://localhost:5173,http://127.0.0.1:5173
```

Place the trained model at `backend/ml/model.h5` (ignore in Git).

Run the server:

```bash
uvicorn main:app --reload --port 8000
```

* Health check: <http://127.0.0.1:8000/health>
* OpenAPI docs: <http://127.0.0.1:8000/docs>
* Uploaded images served from `/uploads/...`

### 2. Frontend Web App

```bash
cd frontend
npm install
```

Create `frontend/.env`:

```env
REACT_APP_API_URL=http://127.0.0.1:8000/api/v1
```

Start the dev server:

```bash
npm start
```

* App runs on <http://localhost:3000>
* Uses the backend hosted at `http://127.0.0.1:8000/api/v1`

### 3. Mobile App (React Native / Expo)

```bash
cd mobileapp
npm install
npx expo start
```

Configure the app to load `ml/model.tflite` for offline inference. The mobile client can authenticate with the backend for syncing history.

---

## 🔌 Core API Overview

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/api/v1/auth/register` | Create user account |
| `POST` | `/api/v1/auth/login` | Obtain `{ accessToken, expiresAt, user }` |
| `POST` | `/api/v1/scans` | Multipart upload (`file`, `notes`, `modelVersion`) → classify + persist |
| `GET`  | `/api/v1/scans` | List scans for the authenticated user |
| `GET`  | `/api/v1/recommendations/{diseaseKey}` | Retrieve treatment steps |

Include `Authorization: Bearer <accessToken>` for protected routes.

---

## 🧠 ML Notes

- Training occurs in TensorFlow; export both `.h5` (backend) and `.tflite` (mobile).
- Keep preprocessing consistent between training and inference (`ml_service.py`).
- Large models are distributed externally—never commit them.

---

## 🔐 Security & Collaboration Tips

- `.env`, models, and private keys must stay out of version control.
- Use MongoDB Atlas project access and IP whitelisting for teammates.
- For development, temporary `0.0.0.0/0` access may be used but remove it afterward.
- Keep personal branches for experimental features; merge via PR.

---

## 👥 Team 27 – CPE41S4

- **Mark Angelo Aquino** — Team Leader
- **Faron Jabez Nonan** — Frontend Developer
- **Froilan Gayao** — Backend Developer
- **Eugene Dela Cruz** — ML Engineer

**Advisers:** Engr. Neal Barton James Matira (Software Design), Engr. Robin Valenzuela (Emerging Technologies 3)

> For academic use in CPE025 (Software Design) and CPE026 (Emerging Technologies 3).
