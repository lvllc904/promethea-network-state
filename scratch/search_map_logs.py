import json

log_path = "/Users/officeone/.gemini/antigravity/brain/66fb206e-e29e-4dbd-8e73-4cddf39e00c8/.system_generated/logs/transcript.jsonl"

steps_to_view = [1727, 2408, 1827] # step numbers of interest

with open(log_path, "r") as f:
    for line in f:
        try:
            data = json.loads(line)
            idx = data.get("step_index")
            if idx in steps_to_view:
                print(f"==================================================")
                print(f"STEP {idx} | Source: {data.get('source')} | Type: {data.get('type')}")
                print(f"==================================================")
                print(data.get("content", "[No Content]"))
                print("\n" + "="*50 + "\n")
        except Exception as e:
            pass
