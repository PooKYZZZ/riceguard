# 🌾 RiceGuard

**RiceGuard** is an integrated software system designed to detect and classify rice leaf diseases using image processing and machine learning.  
It consists of both a **Web Application** and a **Mobile Application**, developed under two related courses to serve different use cases:  
- The **Web Application** focuses on cloud-based data access, management, and user interface design (for **Software Design – CPE025**).  
- The **Mobile Application** focuses on on-site, offline-ready disease detection and usability in the field (for **Mobile Development / Capstone**).

Together, they aim to assist farmers and agricultural experts in early disease detection and proper treatment planning.

---

## 📂 Project Structure
```
riceguard/
├── backend/     → FastAPI + MongoDB server (handles authentication, scans, and recommendations)
├── frontend/    → Web interface (React / JavaScript)
└── ml/          → Machine Learning model (TensorFlow / TensorFlow Lite)
```

---

## 🧩 Tech Stack
| Layer | Tools / Frameworks |
|-------|--------------------|
| **Frontend (Web)** | React, JavaScript, Figma (UI Design) |
| **Frontend (Mobile)** | React Native (Expo), JavaScript |
| **Backend** | FastAPI (Python), MongoDB |
| **Machine Learning** | TensorFlow / TensorFlow Lite |
| **Authentication** | JWT (JSON Web Token) |
| **Storage** | MongoDB (Cloud), SQLite (Local Offline History) |

---

## 🌐 Web Application (Software Design)
The web app provides a centralized platform for farmers and agricultural staff to analyze rice leaf images online.

### ✳️ Features
- Upload and analyze rice leaf images through the web interface  
- Automatic classification (e.g., *Brown Spot*, *Bacterial Blight*, *Healthy*)  
- Confidence score and visual diagnostic results  
- Display of treatment recommendations  
- User authentication (login/register)  
- History log of previous analyses  

### 🧰 Setup
1. Navigate to the backend folder  
   `cd backend`  
   Install dependencies:  
   `pip install -r requirements.txt`  
   Run server:  
   `uvicorn main:app --reload`

2. Navigate to the frontend folder  
   `cd frontend`  
   Install dependencies:  
   `npm install`  
   Start web app:  
   `npm start`

Access via **http://localhost:3000**  
API runs on **http://localhost:8000**

---

## 📱 Mobile Application (Capstone / Mobile Development)
The mobile app provides **offline functionality**, allowing farmers to capture and analyze rice leaf images directly in the field — even without an internet connection.

### ✳️ Features
- Camera-based image capture and preview  
- On-device disease detection using a TensorFlow Lite model  
- Instant diagnosis and confidence score display  
- Recommended treatments and actions  
- History storage using local SQLite  
- Synchronization with cloud when internet becomes available  

### 🧰 Setup
1. Navigate to the mobile app folder  
   `cd frontend` (if shared) or `cd mobile` (if separated)  
2. Install dependencies  
   `npm install`  
3. Run with Expo  
   `npx expo start`  
4. Scan the QR code to open on your Android device

---

## 🧠 Machine Learning Model
The ML model is trained using TensorFlow and converted to TensorFlow Lite for mobile use.  
It classifies rice leaves into categories:
- **Healthy**
- **Brown Spot**
- **Bacterial Blight**

Model files (`.h5`, `.tflite`) are located in the `ml/` directory and integrated into both the backend (for web inference) and mobile app (for offline inference).

---

## 👥 Team 27 – CpE41S4
- **Mark Angelo Aquino** — Team Leader  
- **Faron Jabez Nonan** — Frontend Developer  
- **Froilan Gayao** — Backend Developer  
- **Eugene Dela Cruz** — Machine Learning Engineer  

---

## 🧾 License
Developed for **Software Design (CPE025)** under **Engr. Neal Barton James Matira**  
and extended for **Mobile Application Development / Capstone Project**.  
For educational use only.
