import cv2
import os
from ultralytics import YOLO
import requests
from dotenv import load_dotenv
import time
from threading import Thread
import numpy as np
import base64

load_dotenv()

MODEL_PATH = "best.pt"
BOT_TOKEN = os.getenv("BOT_TOKEN")
CHAT_ID = os.getenv("CHAT_ID")

class YoloService:
    # Detection parameters - optimized for fire/smoke detection
    CONF_THRESHOLD = 0.25      # Minimum confidence threshold (25%)
    IOU_THRESHOLD = 0.45       # IoU threshold for NMS
    IMG_SIZE = 640             # Standard YOLO input size
    MIN_BOX_AREA = 1000        # Minimum detection box area (pixels²)
    WEBCAM_WIDTH = 1280        # Webcam resolution width
    WEBCAM_HEIGHT = 720        # Webcam resolution height
    
    def __init__(self):
        self.model = None
        self.last_alert_time = 0
        self.alert_cooldown = 30  # seconds
        try:
            self.model = YOLO(MODEL_PATH)
            print(f"✅ YOLOv8 Model loaded from {MODEL_PATH}")
            print(f"   📊 Detection settings: conf={self.CONF_THRESHOLD}, iou={self.IOU_THRESHOLD}, imgsz={self.IMG_SIZE}")
        except Exception as e:
            print(f"⚠️ Error loading YOLO model: {e}")

    def enhance_frame(self, frame):
        """Enhance frame quality for better detection."""
        # Adjust contrast and brightness
        alpha = 1.2  # Contrast (1.0 = no change)
        beta = 10    # Brightness (0 = no change)
        enhanced = cv2.convertScaleAbs(frame, alpha=alpha, beta=beta)
        return enhanced

    def send_telegram_alert(self, message):
        if not BOT_TOKEN or not CHAT_ID:
            print("⚠️ Telegram credentials not set")
            return

        current_time = time.time()
        if current_time - self.last_alert_time < self.alert_cooldown:
            return

        def _send():
            url = f'https://api.telegram.org/bot{BOT_TOKEN}/sendMessage'
            payload = {
                'chat_id': CHAT_ID,
                'text': message
            }
            try:
                requests.post(url, data=payload)
                self.last_alert_time = current_time
                print("✅ Telegram alert sent")
            except Exception as e:
                print(f"❌ Telegram alert failed: {e}")

        Thread(target=_send).start()

    def generate_frames(self):
        # Open webcam with HD resolution
        cap = cv2.VideoCapture(0)
        if not cap.isOpened():
            print("❌ Could not open webcam")
            return
        
        # Set webcam resolution for better detection
        cap.set(cv2.CAP_PROP_FRAME_WIDTH, self.WEBCAM_WIDTH)
        cap.set(cv2.CAP_PROP_FRAME_HEIGHT, self.WEBCAM_HEIGHT)
        print(f"📷 Webcam opened at {self.WEBCAM_WIDTH}x{self.WEBCAM_HEIGHT}")

        # Override class names for consistency
        CUSTOM_NAMES = {0: 'Smoke', 1: 'Fire'}

        while True:
            success, frame = cap.read()
            if not success:
                break

            if self.model:
                # Enhance frame for better detection
                enhanced_frame = self.enhance_frame(frame)
                
                # Run inference with optimized parameters
                results = self.model(
                    enhanced_frame, 
                    conf=self.CONF_THRESHOLD,
                    iou=self.IOU_THRESHOLD,
                    imgsz=self.IMG_SIZE,
                    verbose=False
                )
                
                fire_detected = False
                smoke_detected = False
                detection_count = 0
                
                for result in results:
                    boxes = result.boxes
                    for box in boxes:
                        cls = int(box.cls[0])
                        x1, y1, x2, y2 = map(int, box.xyxy[0])
                        conf = float(box.conf[0])
                        
                        # Filter small detections (likely false positives)
                        box_area = (x2 - x1) * (y2 - y1)
                        if box_area < self.MIN_BOX_AREA:
                            continue
                        
                        # Use custom names for consistency
                        class_name = CUSTOM_NAMES.get(cls, self.model.names[cls])
                        detection_count += 1

                        # Color based on detection type
                        if 'Fire' in class_name or 'fire' in class_name:
                            color = (0, 0, 255)  # Red for fire
                            fire_detected = True
                        else:
                            color = (0, 165, 255)  # Orange for smoke
                            smoke_detected = True
                        
                        # Draw enhanced bounding box
                        cv2.rectangle(frame, (x1, y1), (x2, y2), color, 3)
                        
                        # Draw label with background
                        label = f"{class_name} {conf:.0%}"
                        (label_w, label_h), _ = cv2.getTextSize(label, cv2.FONT_HERSHEY_SIMPLEX, 0.6, 2)
                        cv2.rectangle(frame, (x1, y1 - label_h - 10), (x1 + label_w + 10, y1), color, -1)
                        cv2.putText(frame, label, (x1 + 5, y1 - 5),
                                    cv2.FONT_HERSHEY_SIMPLEX, 0.6, (255, 255, 255), 2)

                # Add status overlay
                status_color = (0, 0, 255) if fire_detected else (0, 165, 255) if smoke_detected else (0, 255, 0)
                status_text = f"🔥 FIRE!" if fire_detected else f"💨 SMOKE" if smoke_detected else "✓ Clear"
                cv2.putText(frame, status_text, (10, 30), cv2.FONT_HERSHEY_SIMPLEX, 1, status_color, 2)
                cv2.putText(frame, f"Detections: {detection_count}", (10, 60), cv2.FONT_HERSHEY_SIMPLEX, 0.6, (255, 255, 255), 2)

                if fire_detected:
                    self.send_telegram_alert("🔥 FIRE DETECTED! Immediate action required.")

            ret, buffer = cv2.imencode('.jpg', frame)
            frame_bytes = buffer.tobytes()
            yield (b'--frame\r\n'
                   b'Content-Type: image/jpeg\r\n\r\n' + frame_bytes + b'\r\n')

        cap.release()

    def process_image(self, image_bytes):
        if not self.model:
            return None, {"error": "Model not loaded"}
        
        # Decode image
        nparr = np.frombuffer(image_bytes, np.uint8)
        frame = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
        
        if frame is None:
            return None, {"error": "Could not decode image"}

        # Enhance frame and run inference with optimized parameters
        enhanced_frame = self.enhance_frame(frame)
        results = self.model(
            enhanced_frame,
            conf=self.CONF_THRESHOLD,
            iou=self.IOU_THRESHOLD,
            imgsz=self.IMG_SIZE
        )
        
        detections = []
        fire_detected = False
        
        # Override class names if needed (Fix for inverted labels)
        # Assuming model sees class 1 as Fire, but metadata says Smoke
        CUSTOM_NAMES = {0: 'Smoke', 1: 'Fire'}

        for result in results:
            boxes = result.boxes
            for box in boxes:
                cls = int(box.cls[0])
                # class_name = self.model.names[cls] # Original
                class_name = CUSTOM_NAMES.get(cls, self.model.names[cls])
                
                x1, y1, x2, y2 = map(int, box.xyxy[0])
                conf = float(box.conf[0])
                
                detections.append({
                    "class": class_name,
                    "confidence": conf,
                    "box": [x1, y1, x2, y2]
                })

                # Draw box
                color = (0, 0, 255) if 'Fire' in class_name or 'fire' in class_name else (0, 255, 0)
                cv2.rectangle(frame, (x1, y1), (x2, y2), color, 2)
                cv2.putText(frame, f"{class_name} {conf:.2f}", (x1, y1 - 10),
                            cv2.FONT_HERSHEY_SIMPLEX, 0.5, color, 2)
                
                if 'Fire' in class_name or 'fire' in class_name:
                    fire_detected = True

        if fire_detected:
            self.send_telegram_alert("🔥 FIRE DETECTED in uploaded image!")

        # Encode back to jpg
        _, buffer = cv2.imencode('.jpg', frame)
        encoded_image = base64.b64encode(buffer).decode('utf-8')
        
        return encoded_image, detections

    def process_video(self, video_path, output_path):
        if not self.model:
            return False, "Model not loaded"
            
        cap = cv2.VideoCapture(video_path)
        if not cap.isOpened():
            return False, "Could not open video"
            
        width = int(cap.get(cv2.CAP_PROP_FRAME_WIDTH))
        height = int(cap.get(cv2.CAP_PROP_FRAME_HEIGHT))
        fps = int(cap.get(cv2.CAP_PROP_FPS))
        
        # Define codec and create VideoWriter
        fourcc = cv2.VideoWriter_fourcc(*'avc1') 
        out = cv2.VideoWriter(output_path, fourcc, fps, (width, height))
        
        frame_count = 0
        fire_frames = 0
        
        # Override class names
        CUSTOM_NAMES = {0: 'Smoke', 1: 'Fire'}

        while cap.isOpened():
            ret, frame = cap.read()
            if not ret:
                break
                
            frame_count += 1
            # Enhance and run inference with optimized parameters
            enhanced_frame = self.enhance_frame(frame)
            results = self.model(
                enhanced_frame,
                conf=self.CONF_THRESHOLD,
                iou=self.IOU_THRESHOLD,
                imgsz=self.IMG_SIZE,
                verbose=False
            )
            
            frame_fire_detected = False
            for result in results:
                boxes = result.boxes
                for box in boxes:
                    cls = int(box.cls[0])
                    # class_name = self.model.names[cls]
                    class_name = CUSTOM_NAMES.get(cls, self.model.names[cls])

                    x1, y1, x2, y2 = map(int, box.xyxy[0])
                    conf = float(box.conf[0])
                    
                    color = (0, 0, 255) if 'Fire' in class_name or 'fire' in class_name else (0, 255, 0)
                    cv2.rectangle(frame, (x1, y1), (x2, y2), color, 2)
                    cv2.putText(frame, f"{class_name} {conf:.2f}", (x1, y1 - 10),
                                cv2.FONT_HERSHEY_SIMPLEX, 0.5, color, 2)
                                
                    if 'Fire' in class_name or 'fire' in class_name:
                        frame_fire_detected = True
            
            if frame_fire_detected:
                fire_frames += 1
                
            out.write(frame)
            
        cap.release()
        out.release()
        
        if fire_frames > 0:
            self.send_telegram_alert(f"🔥 FIRE DETECTED in uploaded video! ({fire_frames} frames)")
            
        return True, "Video processed successfully"

yolo_service = YoloService()
