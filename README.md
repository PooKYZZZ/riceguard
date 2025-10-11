# RiceGuard

RiceGuard is Team 27's multi-platform solution for detecting rice leaf diseases from images. The monorepo bundles a FastAPI backend, a React web portal, and a React Native companion app that share a TensorFlow model and MongoDB Atlas datastore.

---

## Academic Context

| Track | Course | Section |
| --- | --- | --- |
| Web application | CPE025 - Software Design | CPE41S4 |
| Mobile application | CPE026 - Emerging Technologies 3 | CPE41S4 |

**Advisers:** Engr. Neal Barton James Matira (Software Design) and Engr. Robin Valenzuela (Emerging Technologies 3)

---

## Tech Stack

| Layer | Technologies |
| --- | --- |
| Backend | FastAPI, Starlette, Uvicorn, Pydantic, python-jose, passlib, pymongo |
| Frontend | React, React Router DOM, Axios, Tailwind CSS (optional) |
| Mobile | React Native (Expo), TensorFlow Lite |
| ML | TensorFlow/Keras, NumPy, Pillow |
| Infrastructure | MongoDB Atlas, JWT auth, local uploads storage |

---

## Repository Layout

```
riceguard/
|- backend/   # FastAPI API, auth, scan history, recommendations
|- frontend/  # React web interface for uploads and history
|- ml/        # Shared ML artifacts and preprocessing helpers
```

Highlights
- Backend: classification service, JWT-secured endpoints, MongoDB persistence, static upload hosting.
- Frontend: scan uploader, history dashboard, treatment recommendations.
- Mobile: offline TFLite inference with optional backend sync.

---

## Getting Started

### Backend API

```bash
cd backend
python -m venv .venv
.\\.venv\\Scripts\\Activate.ps1  # Windows PowerShell
pip install -r requirements.txt
```

Create `backend/.env` (keep out of Git):

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

Place the trained TensorFlow model at `backend/ml/model.h5` (ignored by Git) and run:

```bash
uvicorn main:app --reload --port 8000
```

Health check: `http://127.0.0.1:8000/health` | API docs: `http://127.0.0.1:8000/docs`

### Frontend Web App

```bash
cd frontend
npm install
```

Create `frontend/.env`:

```env
REACT_APP_API_URL=http://127.0.0.1:8000/api/v1
```

Start the dev server with `npm start` and open `http://localhost:3000`.

### Mobile App (Expo)

```bash
cd mobileapp
npm install
npx expo start
```

Bundle `ml/model.tflite` for on-device inference. Devices can authenticate with the backend to sync scan history.

---

## API Highlights

| Method | Endpoint | Description |
| --- | --- | --- |
| `POST` | `/api/v1/auth/register` | Create a user account |
| `POST` | `/api/v1/auth/login` | Returns `{ accessToken, expiresAt, user }` |
| `POST` | `/api/v1/scans` | Multipart upload (`file`, `notes`, `modelVersion`) -> classify and persist |
| `GET` | `/api/v1/scans` | Fetch scans for the authenticated user |
| `GET` | `/api/v1/recommendations/{diseaseKey}` | Retrieve treatment guidance |

Add `Authorization: Bearer <accessToken>` to protected requests.

---

## ML Workflow

- Train in TensorFlow/Keras; export `.h5` for the backend and `.tflite` for mobile.
- Keep preprocessing consistent between training and inference (`backend/ml_service.py`).
- Large binaries (`model.h5`, `.tflite`) are distributed externally and must remain untracked.

---

## Team 27 - CPE41S4

- **Mark Angelo Aquino** - Team Leader
- **Faron Jabez Nonan** - Frontend Developer
- **Froilan Gayao** - Backend Developer
- **Eugene Dela Cruz** - ML Engineer

> Academic project for CPE025 (Software Design) and CPE026 (Emerging Technologies 3).
