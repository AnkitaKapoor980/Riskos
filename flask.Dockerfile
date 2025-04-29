FROM python:3.11-slim

WORKDIR /app/flask-api

# Copy and install Python requirements
COPY backend/flask-api/requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy Flask API source code
COPY backend/flask-api ./

# Expose the port your Flask API runs on
EXPOSE 5001

CMD ["python", "app.py"]