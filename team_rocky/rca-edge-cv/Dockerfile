# Use the official YOLOv8 image (Pre-loaded with CUDA and Video Codecs)
FROM ultralytics/ultralytics:latest-python

# Set the internal working directory
WORKDIR /app

# Copy requirements and install
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy everything from rca-edge-cv into /app
COPY . .

# Ensure Python doesn't buffer logs (so you see your DB successes in real-time)
ENV PYTHONUNBUFFERED=1

# Run the engine
CMD ["python", "src/main.py"]