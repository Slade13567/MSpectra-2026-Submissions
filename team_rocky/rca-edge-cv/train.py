from ultralytics import YOLO

def main():
    # 1. Load the base model
    model = YOLO("yolov8n.pt")

    # 2. Ultra-Safe Training Settings
    model.train(
        data="datasets/cylinders/data.yaml", 
        epochs=100,
        imgsz=640,
        
        # RESOURCE LIMITS
        batch=8,            # Very low memory footprint (Safety first)
        workers=2,          # Minimal CPU threads (Prevents CPU overheating)
        device=0,           # Use the 4070
        
        # STABILITY SETTINGS
        amp=True,           # Saves VRAM
        patience=15,        # If it doesn't improve for 15 rounds, stop (Saves time/heat)
        overlap_mask=False, # Reduces math complexity
        
        # OUTPUT
        name="cylinder_v1_safe",
        exist_ok=True
    )

if __name__ == "__main__":
    main()