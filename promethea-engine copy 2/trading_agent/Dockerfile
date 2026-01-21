
# --- Stage 1: Builder ---
FROM python:3.9-slim-bullseye AS builder

WORKDIR /app

# Install Python dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir --user -r requirements.txt

# Copy the rest of your application code
COPY . .

# --- Stage 2: Final (optional: use distroless for minimal runtime) ---
# If you want a minimal image, uncomment the next two lines and comment out the 'FROM python:3.9-slim-bullseye' below.
# FROM gcr.io/distroless/python3-debian11
# COPY --from=builder /app /app
# WORKDIR /app
# EXPOSE 8000
# CMD ["uvicorn", "Services.api:app", "--host", "0.0.0.0", "--port", "8000"]

# For simplicity and debugging, use the builder image as the final image:
FROM python:3.9-slim-bullseye
ENV PATH="/root/.local/bin:${PATH}"
WORKDIR /app
COPY --from=builder /root/.local /root/.local
COPY --from=builder /app .
EXPOSE 8000
CMD ["python", "-m", "uvicorn", "Services.api:app", "--host", "0.0.0.0", "--port", "8000"]