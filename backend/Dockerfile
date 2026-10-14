FROM python:3.12-slim

WORKDIR /app

# Install packages first (Docker reuses this step if requirements don't change)
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY app ./app

# The database file lives here (Compose keeps it in a volume)
RUN mkdir -p /data

EXPOSE 8000

# Add sample data if the database is empty, then start the API
CMD ["sh", "-c", "python -m app.seed && uvicorn app.main:app --host 0.0.0.0 --port 8000"]