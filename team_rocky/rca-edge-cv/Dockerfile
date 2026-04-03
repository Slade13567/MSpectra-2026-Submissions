# 1. Using Python 3.12 as established
FROM python:3.12-slim

# 2. Install system dependencies for OpenCV
RUN apt-get update && apt-get install -y \
    libgl1 \
    libglib2.0-0 \
    libsm6 \
    libxext6 \
    libxrender1 \
    && rm -rf /var/lib/apt/lists/*

# 3. Set the working directory
WORKDIR /app

# 4. Copy requirements and install
COPY requirements.txt .
# Upgrade pip and install with a higher timeout for those heavy AI wheels
RUN pip install --upgrade pip && \
    pip install --no-cache-dir --default-timeout=100 -r requirements.txt

# 5. Copy the rest of the code (including src/ and best.pt)
COPY . .

# 6. Run your main script
CMD ["python", "src/main.py"]