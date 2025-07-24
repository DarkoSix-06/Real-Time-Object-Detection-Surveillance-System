from fastapi import FastAPI, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
from ultralytics import YOLO
import cv2
import numpy as np
import base64

app = FastAPI()
model = YOLO("yolov8s.pt")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.post("/detect")
async def detect(file: UploadFile = File(...)):
    contents = await file.read()
    np_arr = np.frombuffer(contents, np.uint8)
    image = cv2.imdecode(np_arr, cv2.IMREAD_COLOR)

    results = model.predict(image, verbose=False)[0]

    detections = []
    for box in results.boxes:
        x1, y1, x2, y2 = map(int, box.xyxy[0])
        label = model.names[int(box.cls[0])]
        confidence = float(box.conf[0])
        if confidence < 0.3:
            continue

        cropped = image[y1:y2, x1:x2]
        _, buffer = cv2.imencode(".jpg", cropped)
        cropped_base64 = base64.b64encode(buffer).decode("utf-8")

        detections.append({
            "label": label,
            "confidence": round(confidence * 100, 2),
            "box": [x1, y1, x2, y2],
            "cropped_img": cropped_base64,
        })

    return {"detections": detections}
