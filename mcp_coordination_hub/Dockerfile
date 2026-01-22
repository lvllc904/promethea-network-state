FROM python:3.11-slim

WORKDIR /app

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY mcp_gateway.py .

# Expose port (Cloud Run defaults to 8080)
ENV PORT=8080

# Run uvicorn service
CMD exec uvicorn mcp_gateway:app --host 0.0.0.0 --port ${PORT}
