# Base: Python 3.11-slim for a minimal, fast, and secure image
FROM python:3.11-slim

# Set working directory inside the container
WORKDIR /app

# Prevent Python from writing .pyc files and buffering output
ENV PYTHONDONTWRITEBYTECODE 1
ENV PYTHONUNBUFFERED 1

# Install dependencies from requirements.txt
COPY requirements.txt /app/
RUN pip install --no-cache-dir -r requirements.txt

# Copy the application code
COPY . /app/

# Expose the port for the FastAPI server (Agent-Core MCP Gateway)
# This port will be called by host apps (Warp, Android Studio)
EXPOSE 8080

# Command to run the FastAPI server using Uvicorn
# The host 0.0.0.0 is necessary for the container to be accessible externally
CMD ["uvicorn", "mcp_gateway:app", "--host", "0.0.0.0", "--port", "8080"]