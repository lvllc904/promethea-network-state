from fastapi import FastAPI, HTTPException
from fastapi.responses import FileResponse, JSONResponse
import yaml
import os

from .core_logic import get_put_call_ratio

app = FastAPI(
    title="Promethea Options Data MCP",
    description="Provides tools for fetching options-based market sentiment data, like the Put/Call ratio.",
    version="1.0.0",
)

SERVER_DIR = os.path.dirname(__file__)

@app.post("/tools/get_put_call_ratio")
async def execute_get_put_call_ratio():
    """
    Endpoint to execute the get_put_call_ratio tool.
    Gemini will call this endpoint.
    """
    try:
        # This tool takes no parameters, so we just call the logic directly.
        ratio = get_put_call_ratio()

        # The MCP server must return a specific JSON structure for the model
        return {
           "tool_name": "get_put_call_ratio",
            "outputs": [
                {"float": ratio}
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
    logo_path = os.path.join(SERVER_DIR, "logo.png")
    if not os.path.exists(logo_path):
        # Fallback to the google trends logo if one doesn't exist here
        logo_path = os.path.join(SERVER_DIR, "../google_trends_mcp/logo.png")
    return FileResponse(logo_path, media_type="image/png")
