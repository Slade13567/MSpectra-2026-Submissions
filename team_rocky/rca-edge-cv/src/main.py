import os
import cv2
import threading
from flask import Flask, Response, request
from flask_cors import CORS
from dotenv import load_dotenv
from supabase import create_client, Client
from ultralytics import YOLO

# --- INITIALIZATION ---
load_dotenv()
app = Flask(__name__)
CORS(app)

# Global variables for thread safety
output_frame = None
inference_frame = None
lock = threading.Lock()
logged_ids = set() 

# 1. LOAD YOUR CUSTOM BRAIN
# Assuming you moved 'best.pt' to your root rca-edge-cv folder
model = YOLO("best.pt")

# Setup Supabase
url: str = os.environ.get("SUPABASE_URL")
key: str = os.environ.get("SUPABASE_KEY")
supabase: Client = create_client(url, key)

def generate_frames(show_inference=False):
    global output_frame, inference_frame, lock
    while True:
        with lock:
            active_frame = inference_frame if show_inference else output_frame
            if active_frame is None:
                continue
            (flag, encodedImage) = cv2.imencode(".jpg", active_frame)
            if not flag:
                continue
        yield(b'--frame\r\n' b'Content-Type: image/jpeg\r\n\r\n' + bytearray(encodedImage) + b'\r\n')

@app.route('/video_feed')
def video_feed():
    inference_active = request.args.get('inference', 'false').lower() == 'true'
    return Response(generate_frames(inference_active), mimetype='multipart/x-mixed-replace; boundary=frame')


track_history = {}
def run_cv_pipeline():
    global output_frame, inference_frame, lock, logged_ids
    
    video_path = r"assets/vid2.mp4"
    cap = cv2.VideoCapture(video_path)

    # --- THE FIX ---
    # We call .get() on 'cap', and pass 'cv2.CAP_PROP_FRAME_WIDTH' as the ID
    width = int(cap.get(cv2.CAP_PROP_FRAME_WIDTH))
    counting_line = width // 2 
    print(f"🚀 Pipeline Started. Counting line set at x = {counting_line}")

    while True:
        ret, frame = cap.read()
        if not ret:
            # VIDEO LOOP: Clear memory so Supabase gets new entries for the next lap
            print("🔄 Video looping... resetting logged IDs.")
            logged_ids.clear() 
            cap.set(cv2.CAP_PROP_POS_FRAMES, 0)
            continue

        with lock:
            output_frame = frame.copy()

        # Custom Model + Custom Tracker (Kalman Filter logic)
        results = model.track(
            frame, 
            persist=True, 
            tracker="custom_tracker.yaml", 
            conf=0.5,
            iou=0.5,
            verbose=False
        )
        
        if results[0].boxes.id is not None:
            boxes = results[0].boxes.xyxy.cpu().tolist()
            track_ids = results[0].boxes.id.int().cpu().tolist()
            confidences = results[0].boxes.conf.cpu().tolist()
            
            for box, track_id, conf in zip(boxes, track_ids, confidences):
                center_x = (box[0] + box[2]) / 2
                
                # ==========================================
                # 🔥 THE CONSTRAINT ENGINE & ID CORRECTION
                # ==========================================
                is_valid = True
                
                if track_id in track_history:
                    last_x = track_history[track_id]
                    distance_moved = center_x - last_x
                    
                    # DEMO MODE: We loosened the speed limit from 150px to 600px 
                    # because the demo video has severe camera shake/panning.
                    if distance_moved > 600:
                        is_valid = False
                        
                    # DEMO MODE: We allow backward movement (up to -200px) 
                    # to account for the person holding the camera stepping backward.
                    elif distance_moved < -200:
                        is_valid = False
                
                # If the physics make sense, update the memory
                if is_valid:
                    track_history[track_id] = center_x
                    
                    # LOGIC: Crosses the middle line AND hasn't been logged yet
                    if center_x > counting_line and track_id not in logged_ids:
                        try:
                            # 1. Capture the actual response from the database
                            response = supabase.table('conveyor_logs').insert({
                                "tracking_id": track_id,
                                "class_name": "cylinder",
                                "confidence": float(conf)
                            }).execute()
                            
                            # 2. Supabase v2+ Python SDK usually returns the inserted data in response.data
                            # If data exists, it was a success.
                            if response.data:
                                logged_ids.add(track_id)
                                print(f"✅ DB SUCCESS: Cylinder {track_id} | X: {int(center_x)}")
                            else:
                                # If it didn't crash but returned no data, something is weird.
                                print(f"⚠️ DB WARNING: Request went through, but returned no data. Check RLS or Schema.")
                                
                        except Exception as e:
                            # 3. If Supabase rejects it (RLS, wrong column name, etc.), it will print the EXACT reason here.
                            print(f"❌ SUPABASE ERROR: {e}")
                else:
                    # Constraint Engine caught an anomaly!
                    print(f"⚠️ ANOMALY BLOCKED: ID {track_id} violated physics constraints.")

        with lock:
            inference_frame = results[0].plot()

# Start the CV Thread
t = threading.Thread(target=run_cv_pipeline)
t.daemon = True
t.start()

if __name__ == "__main__":
    app.run(host='0.0.0.0', port=5000, debug=False, threaded=True)