# 🌾 RiceGuard

RiceGuard is a mobile-based system that detects and classifies rice leaf diseases using image processing and machine learning.  
It helps farmers identify issues early and provides treatment recommendations to improve crop health.

---

## 📂 Project Structure
```
riceguard/
├── backend/     → FastAPI + MongoDB server (handles auth, scans, and recommendations)
├── frontend/    → React Native app (mobile interface for farmers)
└── ml/          → Machine Learning model (TensorFlow / TensorFlow Lite)
```

---

## 🧩 Tech Stack
| Layer | Tools / Frameworks |
|-------|--------------------|
| Frontend | React Native (Expo), JavaScript |
| Backend | FastAPI (Python), MongoDB |
| ML | TensorFlow / TensorFlow Lite |
| Auth | JWT (JSON Web Token) |
| Storage | Local SQLite (mobile), Cloud MongoDB |

---

## 🚀 Setup Instructions

### Backend
1. Navigate to the backend folder  
   `cd backend`
2. Install dependencies  
   `pip install -r requirements.txt`
3. Create a `.env` file (see `.env.example` for reference)
4. Run the server  
   `uvicorn main:app --reload`
5. The API will be available at **http://localhost:8000**

### Frontend
1. Navigate to the frontend folder  
   `cd frontend`
2. Install dependencies  
   `npm install`
3. Run the app  
   `npx expo start`
4. Scan the QR code to open on your mobile device

### Machine Learning
- The `ml/` folder contains training scripts and TensorFlow Lite models used for disease classification.  
- Model files are loaded by the mobile app for offline use.

---

## 👥 Team 27 – CpE41S4
- **Mark Angelo Aquino** — Team Leader  
- **Faron Jabez Nonan** — Frontend Developer  
- **Froilan Gayao** — Backend Developer  
- **Eugene Dela Cruz** — ML Engineer  

---

## 🧾 License
This project is developed for **Software Design (CPE025)** under **Engr. Neal Barton James Matira**.  
For educational purposes only.
