from fastapi import FastAPI, Request, HTTPException
from fastapi.responses import FileResponse, JSONResponse
import yaml
import os

# Import the core logic from our other file
from .core_logic import get_interest_acceleration

app = FastAPI(
    title="Promethea Google Trends MCP",
    description="Provides tools for fetching and analyzing Google Trends data.",
    version="1.0.0",
)

# Get the directory of the current script to locate other files
SERVER_DIR = os.path.dirname(__file__)

@app.post("/tools/get_interest_acceleration")
async def execute_get_interest_acceleration(request: Request):
    """
    Endpoint to execute the get_interest_acceleration tool.
    Gemini will call this endpoint.
    """
    try:
        body = await request.json()
        # The arguments from the model will be in a 'parameters' field
        keyword = body.get("parameters", {}).get("keyword")

        if not keyword:
            raise HTTPException(status_code=400, detail="'keyword' parameter is required.")

        # Call our actual logic
        acceleration = get_interest_acceleration(keyword)

        # The MCP server must return a specific JSON structure for the model
        return {
           "tool_name": "get_interest_acceleration",
            "outputs": [
                {"float": acceleration}
            ]
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/.well-known/ai-plugin.json", include_in_schema=False)
async def get_plugin_manifest():
    plugin_path = os.path.join(SERVER_DIR, "ai-plugin.json")
    return FileResponse(plugin_path, media_type="application/json")

@app.get("/openapi.yaml", include_in_schema=False)
async def get_openapi_spec():
    openapi_path = os.path.join(SERVER_DIR, "openapi.yaml")
    with open(openapi_path) as f:
        yaml_content = yaml.safe_load(f)
    return JSONResponse(content=yaml_content)

@app.get("/logo.png", include_in_schema=False)
async def get_logo():
    # You can create and place a logo.png file here if you wish
    logo_path = os.path.join(SERVER_DIR, "logo.png")
    return FileResponse(logo_path, media_type="image/png")