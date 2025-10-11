# 🌾 RiceGuard

RiceGuard is a **web + mobile** system that detects and classifies rice leaf diseases from images using **FastAPI**, **MongoDB**, and **TensorFlow**.
It supports two parallel tracks:

* **Web App (CPE025 – Software Design):** cloud inference, management UI.
* **Mobile App (Capstone / Mobile Dev):** offline, on-device inference (TFLite).

---

## 📦 Monorepo Layout

```
riceguard/
├─ backend/        # FastAPI API (auth, scans, recommendations, uploads)
├─ frontend/       # React web app
└─ ml/             # ML assets (model.h5 / model.tflite, helpers)
```

---

## 🧩 Tech Stack

| Layer          | Tools                        |
| -------------- | ---------------------------- |
| Frontend (Web) | React, JavaScript            |
| Mobile         | React Native (Expo), TFLite  |
| Backend        | FastAPI, Starlette, Pydantic |
| Database       | MongoDB Atlas                |
| Auth           | JWT                          |
| ML             | TensorFlow / TensorFlow Lite |

---

## ⚙️ Prerequisites

* **Python** 3.10–3.11
* **Node** 18+ / **npm** 9+
* **MongoDB Atlas** connection string (SRV)
* (Optional) **Git** + VS Code

---

## 🚀 Quick Start

### 1) Backend (API)

```bash
cd backend

# (recommended) create a venv
python -m venv .venv
# Windows PowerShell
.\.venv\Scripts\Activate.ps1
# macOS/Linux
# source .venv/bin/activate

pip install -r requirements.txt
```

Create `backend/.env`:

```env
MONGO_URI=mongodb+srv://<user>:<pass>@<cluster>.mongodb.net/riceguard_db
DB_NAME=riceguard_db

JWT_SECRET=CHANGE_ME_SUPER_SECRET
JWT_ALGORITHM=HS256
TOKEN_EXPIRE_HOURS=6

UPLOAD_DIR=uploads
MAX_UPLOAD_MB=8

# React dev servers
ALLOWED_ORIGINS=http://localhost:3000,http://127.0.0.1:3000,http://localhost:5173,http://127.0.0.1:5173
```

Place the ML model:

```
backend/
  ml/
    model.h5         # not committed
    service.py       # ML loader + predict()
```

Run the API:

```bash
uvicorn main:app --reload --port 8000
```

* Health: `http://127.0.0.1:8000/health`
* Docs: `http://127.0.0.1:8000/docs`
* Uploads served at: `/uploads/...`

---

### 2) Frontend (Web)

```bash
cd frontend
npm install
```

Create `frontend/.env`:

```env
REACT_APP_API_URL=http://127.0.0.1:8000/api/v1
```

Run:

```bash
npm start
```

* Web App: `http://localhost:3000`
* API Base: `http://127.0.0.1:8000/api/v1`

---

## 🔌 Core API (minimal)

* `POST /api/v1/auth/register` – create user
* `POST /api/v1/auth/login` – returns `{ accessToken, user }`
* `GET  /api/v1/auth/me` – (optional) validate token
* `POST /api/v1/scans` – **multipart** upload (`file`, `notes`, `modelVersion`) → predicts & stores scan
* `GET  /api/v1/scans` – list user’s scans (Bearer token)
* `GET  /api/v1/recommendations/{diseaseKey}` – steps for `brown_spot | blast | blight | healthy`

> **Auth:** Send `Authorization: Bearer <accessToken>` for protected routes.

---

## 📱 Mobile (Outline)

```bash
# if mobile is a separate app
cd mobile
npm install
npx expo start
```

* Uses **TFLite** model (`ml/model.tflite`) for offline inference.
* Stores history locally (e.g., SQLite); can sync to backend.

---

## 🧠 ML Notes

* Training in TensorFlow → export **`model.h5`** (backend inference) and **`.tflite`** (mobile).
* Do **not** commit large models. Share via Drive and place under `backend/ml/`.

---

## 🔐 Security & Dev Tips

* Never commit `.env`, tokens, or `ml/model.h5`.
* In Atlas, add teammates under **Project Access**, whitelist IPs under **Network Access**, and create DB users per teammate.
* For dev, you may temporarily allow `0.0.0.0/0` (not for production).

---

## 👥 Team 27 – CpE41S4

* **Mark Angelo Aquino** — Team Leader
* **Faron Jabez Nonan** — Frontend Developer
* **Froilan Gayao** — Backend Developer
* **Eugene Dela Cruz** — ML Engineer

**Adviser:** Engr. Neal Barton James Matira
*For educational use (CPE025: Software Design; Capstone/Mobile Dev).*
