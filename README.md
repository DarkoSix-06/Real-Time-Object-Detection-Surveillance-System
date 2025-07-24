# 🧠 Real-Time Object Detection System (YOLOv8 + React + FastAPI)

A real-time object detection system that captures video from your browser webcam, processes frames with YOLOv8 on a FastAPI backend, and displays detection boxes (with confidence) and a side panel of recognized objects.
---
<img width="1024" height="1024" alt="ChatGPT Image Jul 24, 2025, 08_52_32 AM" src="https://github.com/user-attachments/assets/782d3a06-6912-4080-ae2a-4fca585a6444" />

## 📸 Live Demo Screenshot
![Screenshot_23-7-2025_20480_localhost](https://github.com/user-attachments/assets/482f7a97-e1c4-480b-8b3a-27fb2bad5067)

## 🚀 Features

- 🎥 Live webcam stream using browser
- 🧠 YOLOv8 object detection via Python backend
- ✅ Bounding boxes with label + confidence %
- 🖼️ Detected objects appear in a live side panel
- 🧪 No database, no uploads — just pure real-time detection

---

## 🧰 Tech Stack

| Layer      | Tech                         |
|------------|------------------------------|
| Frontend   | React (Vite), HTML5 Video    |
| Backend    | FastAPI, OpenCV, YOLOv8      |
| AI Model   | YOLOv8 (`yolov8n.pt` or `yolov8s.pt`) |
| Language   | Python, JavaScript           |

---

## 📂 Project Structure
real-time-object-detection/
├── backend/
│ ├── main.py # FastAPI server
│ └── requirements.txt # Python dependencies
├── frontend/
│ ├── src/
│ │ └── App.jsx # React main component
│ └── package.json # npm config
├── screenshot.png # UI screenshot
└── README.md # This file
---
-------
📜 License
MIT License — feel free to use, modify, and build awesome stuff.

👨‍💻 Author
Darko Six
Crafted with Python 🐍 and React ⚛️

---
## ⚙️ Setup Instructions

### 1️⃣ Backend: FastAPI + YOLOv8

```bash
cd backend
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt
uvicorn main:app --reload

2️⃣ Frontend: React (Vite)
cd frontend
npm install
npm run dev

