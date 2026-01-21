from fastapi import FastAPI, Request, HTTPException
from fastapi.responses import FileResponse, JSONResponse
import yaml
import os

from .core_logic import get_strategy_discourse_vector

app = FastAPI(
    title="Promethea Discourse MCP",
    description="Provides tools for scraping and analyzing discussion forums like Reddit.",
    version="1.0.0",
)

SERVER_DIR = os.path.dirname(__file__)

@app.post("/tools/get_strategy_discourse_vector")
async def execute_get_strategy_discourse_vector(request: Request):
    """
    Endpoint to execute the get_strategy_discourse_vector tool.
    Gemini will call this endpoint.
    """
    try:
        body = await request.json()
        parameters = body.get("parameters", {})
        subreddits = parameters.get("subreddits")
        keywords = parameters.get("keywords")

        if not subreddits or not keywords:
            raise HTTPException(status_code=400, detail="'subreddits' and 'keywords' parameters are required.")

        # Call our actual logic
        vector = get_strategy_discourse_vector(subreddits, keywords)

        # The MCP server must return a specific JSON structure for the model
        return {
           "tool_name": "get_strategy_discourse_vector",
            "outputs": [
                {"list_value": vector}
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
        # Fallback to a previously created logo if one doesn't exist here
        logo_path = os.path.join(SERVER_DIR, "../google_trends_mcp/logo.png")
    return FileResponse(logo_path, media_type="image/png")
