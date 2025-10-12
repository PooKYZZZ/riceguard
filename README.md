# RiceGuard

RiceGuard is Team 27's multi-platform project for detecting rice leaf diseases. The FastAPI backend, React web portal, and Expo mobile companion reuse a shared TensorFlow model and MongoDB Atlas persistence.

## Overview
- Backend handles classification, JWT auth, upload storage, and scan history.
- Web app uploads scans and surfaces treatment recommendations.
- Mobile app runs on-device TFLite with optional backend sync.
- Academic capstone for CPE025 (Software Design) and CPE026 (Emerging Technologies 3). Advisers: Engr. Neal Barton James Matira and Engr. Robin Valenzuela.

## Stack & Layout

| Layer | Technologies |
| --- | --- |
| Backend | FastAPI, Uvicorn, Pydantic, python-jose, passlib, pymongo |
| Frontend | React, React Router DOM, Axios, Tailwind CSS (optional) |
| Mobile | React Native (Expo), TensorFlow Lite |
| ML | TensorFlow/Keras, NumPy, Pillow |
| Infrastructure | MongoDB Atlas, JWT auth, local uploads storage |

```
riceguard/
|- backend/   # FastAPI API, auth, scan history, recommendations
|- frontend/  # React web interface for uploads and history
|- ml/        # Shared ML artifacts and preprocessing helpers
```

## Quickstart

### Backend API

```bash
cd backend
python -m venv .venv
. .\.venv\Scripts\Activate.ps1  # Windows PowerShell
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
ALLOWED_ORIGINS=http://localhost:3000,http://127.0.0.1:3000,http://localhost:5173,http://127.0.0.1:5173
```

Place the trained TensorFlow model at `backend/ml/model.h5`, then run:

```bash
uvicorn main:app --host 0.0.0.0 --port 8000 --reload
```

Health check: `http://127.0.0.1:8000/health`  
Docs: `http://127.0.0.1:8000/docs`

### Frontend Web

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

The mobile app uses Expo (React Native). You can run it on a **real device** (recommended) or an emulator/simulator.

#### 1) Install deps

```bash
cd mobileapp/riceguard
npm install
```

#### 2) Point the app to your backend

> Use the **PC's LAN IP** (where FastAPI runs), not your phone's IP.

* Start the backend bound to all interfaces:

  ```bash
  # from backend/
  uvicorn main:app --host 0.0.0.0 --port 8000 --reload
  ```

* On your phone's browser, verify it reaches the backend:

  ```
  http://<PC_IP>:8000/health
  ```

  You should see JSON.

* In the terminal where you'll start Expo, set the API base URL (for dev):

  ```bash
  # PowerShell (Windows)
  $env:EXPO_PUBLIC_API_BASE_URL="http://<PC_IP>:8000/api/v1"

  # bash/zsh (macOS/Linux)
  export EXPO_PUBLIC_API_BASE_URL="http://<PC_IP>:8000/api/v1"
  ```

> For the **Android emulator**, use `http://10.0.2.2:8000/api/v1`.
> For the **iOS simulator**, use `http://127.0.0.1:8000/api/v1`.

#### 3) Start Metro (Expo dev server)

**Real device over LAN (recommended):**

```bash
# Force Metro to advertise the correct IP and clear cache
# Windows PowerShell:
$env:REACT_NATIVE_PACKAGER_HOSTNAME="<PC_IP>"
npx expo start --lan --clear

# macOS/Linux:
REACT_NATIVE_PACKAGER_HOSTNAME="<PC_IP>" npx expo start --lan --clear
```

Scan the QR with **Expo Go** on your phone. The banner should show:

```
exp://<PC_IP>:8081
```

**If LAN is flaky:** use a tunnel (slower but zero config)

```bash
npx expo start --tunnel --clear
```

#### 4) Permissions (image picker)

The first time you scan, the app will request photo library permissions. Accept the prompt.

#### 5) CORS (only if you test with the web preview)

If you also open the Expo **Web** tab in a browser, add those origins to `backend/.env`:

```
ALLOWED_ORIGINS=http://localhost:8081,http://127.0.0.1:8081,http://<PC_IP>:8081
```

Restart the backend.

#### 6) Common Windows notes

* Allow these ports in **Windows Firewall**: **8000** (backend), **8081** (Metro), **19000/19001/19002** (Expo).
* Disable VPNs or virtual adapters that might hijack routing (Hyper-V/VirtualBox/VMware) or use `--tunnel`.

#### 7) Run it

* Open **Expo Go** on your phone and scan the QR.
* Create an account on the **Sign Up** modal -> Log in -> Go to **Scan** -> pick an image.

#### Troubleshooting quick checks

* **Phone can't reach backend**

  * Make sure backend runs with `--host 0.0.0.0`.
  * Phone browser to `http://<PC_IP>:8000/health` should load.
  * Open Firewall for TCP 8000 (Private network).

* **Expo Go shows "Failed to download remote update"**

  * Metro must advertise the **PC IP** (`REACT_NATIVE_PACKAGER_HOSTNAME=<PC_IP>`).
  * Try `npx expo start --lan --clear` or `--tunnel`.
  * Open Firewall for 8081/19000/19001/19002.

* **Web (browser) can't log in (OPTIONS 400)**

  * CORS allowlist missing. Add the exact origin (scheme+host+port) to `ALLOWED_ORIGINS` and restart.

#### Scripts cheat-sheet (Windows PowerShell)

```powershell
# Backend
cd backend
python -m venv .venv
. .\.venv\Scripts\Activate.ps1
uvicorn main:app --host 0.0.0.0 --port 8000 --reload

# Mobile (in a new terminal)
cd mobileapp\riceguard
$env:EXPO_PUBLIC_API_BASE_URL="http://<PC_IP>:8000/api/v1"
$env:REACT_NATIVE_PACKAGER_HOSTNAME="<PC_IP>"
npx expo start --lan --clear
```

Replace `<PC_IP>` with your actual PC IPv4 (e.g., `192.168.31.150`).

## API Cheatsheet

| Method | Endpoint | Description |
| --- | --- | --- |
| `POST` | `/api/v1/auth/register` | Create a user account |
| `POST` | `/api/v1/auth/login` | Returns `{ accessToken, expiresAt, user }` |
| `POST` | `/api/v1/scans` | Upload a scan (`file`, `notes`, `modelVersion`) and classify |
| `GET` | `/api/v1/scans` | Fetch scans for the authenticated user |
| `GET` | `/api/v1/recommendations/{diseaseKey}` | Retrieve treatment guidance |

Use `Authorization: Bearer <accessToken>` for protected endpoints.

## ML Assets

- Train models in TensorFlow/Keras, export `.h5` for the backend and `.tflite` for mobile.
- Keep preprocessing consistent (`backend/ml_service.py`).
- Large binaries (`model.h5`, `.tflite`) remain untracked; distribute separately.

## Team 27

- **Mark Angelo Aquino** - Team Lead
- **Faron Jabez Nonan** - Frontend
- **Froilan Gayao** - Backend
- **Eugene Dela Cruz** - ML
