import subprocess
import json
import os
from pathlib import Path
import google.generativeai as genai
from dotenv import load_dotenv

"""
This is a conceptual script demonstrating the core components of an AI Agent Executor.
It is NOT a complete, production-ready implementation.

Key Components:
1. Toolbelt: A collection of Python functions that can interact with the local environment.
2. Tool Registry: A dictionary that maps tool names to their functions.
3. Executor: The main loop that takes LLM output, calls the correct tool, and returns the result.
"""

# Load environment variables for API keys
load_dotenv()
GOOGLE_API_KEY = os.getenv("GOOGLE_API_KEY")
genai.configure(api_key=GOOGLE_API_KEY)

# --- 1. The Toolbelt: Functions the LLM can call ---

def list_files(directory: str = '.') -> str:
    """
    Tool to list files and directories at a given path.
    """
    try:
        print(f"AGENT ACTION: Listing files in '{directory}'")
        # Ensure the path is safe before listing
        safe_path = os.path.abspath(directory)
        return "\n".join(os.listdir(safe_path))
    except Exception as e:
        return f"Error listing files in '{directory}': {e}"

def read_file(path: str) -> str:
    """
    Tool to read a file's content.
    """
    try:
        print(f"AGENT ACTION: Reading file '{path}'")
        # Make sure the path is valid and within allowed directories
        safe_path = os.path.abspath(path)
        with open(safe_path, 'r') as f:
            return f.read()
    except Exception as e:
        return f"Error reading file '{path}': {e}"

def write_file(path: str, content: str) -> str:
    """
    Tool to write content to a file, overwriting it.
    """
    try:
        # Ensure the path is valid and prevent writing to critical system files
        print(f"AGENT ACTION: Writing to file '{path}'")
        safe_path = os.path.abspath(path)
        # Write to the file
        with open(path, 'w') as f:
            f.write(content)
        return f"Successfully wrote to {path}."
    except Exception as e:
        return f"Error writing to file: {e}"

def run_shell_command(command: str) -> str:
    """
    Tool to run a shell command.
    **SECURITY WARNING**: In a real-world application, this tool is extremely
    dangerous. It MUST be run in a sandboxed environment (e.g., a Docker container
    with no network access and a restricted file system) to prevent the LLM
    from executing harmful commands on your host machine. Never run this directly
    in your primary environment.
    """
    try:
        print(f"AGENT ACTION: Running command: `{command}`")
        # Add a timeout to prevent indefinite hanging
        # Execute the command
        result = subprocess.run(
            command,
            shell=True,
            capture_output=True,
            text=True,
            timeout=30 # Add a timeout to prevent long-running commands
        )
        output = f"STDOUT:\n{result.stdout}\n\n"
        if result.stderr:
            output += f"STDERR:\n{result.stderr}"
        return output
    except Exception as e:
        return f"Error running command: {e}"

# --- 2. The Tool Registry ---

TOOL_REGISTRY = {
    "list_files": list_files,
    "read_file": read_file,
    "write_file": write_file,
    "run_shell": run_shell_command,
}

# --- 3. The Executor ---

def execute_llm_action(llm_output_json: str) -> str:
    """
    Parses the LLM's JSON output and calls the appropriate tool.
    This is the core of the ReAct loop's "Act" step.
    """
    try:
        action_request = json.loads(llm_output_json)
        tool_name = action_request.get("tool")
        parameters = action_request.get("parameters", {})
        
        if not tool_name:
            return "Error: LLM output did not specify a 'tool'."
            
        if tool_name in TOOL_REGISTRY:
            tool_function = TOOL_REGISTRY[tool_name]
            tool_result = tool_function(**parameters)
            return str(tool_result)
        else: # Handle unknown tool
            return f"Error: Tool '{tool_name}' not found in registry."
    except json.JSONDecodeError:
        return f"Error: LLM output was not valid JSON. Output: {llm_output_json}"
    except Exception as e:
        return f"Error executing action: {e}"

def get_llm_response(prompt: str) -> str:
    """
    Sends a prompt to the Gemini LLM and returns its response.
    """
    try:
        model = genai.GenerativeModel('gemini-pro') # Or 'gemini-1.5-pro-latest' for more advanced
        response = model.generate_content(prompt)
        # Assuming the LLM is instructed to output JSON directly
        return response.text
    except Exception as e:
        return f"Error communicating with LLM: {e}"

def run_agent_loop(initial_problem_description: str, max_iterations: int = 5):
    """
    The main ReAct loop for the agent.
    """
    print(f"\n--- AGENT STARTING: Goal: {initial_problem_description} ---")
    
    # Define the tools available to the LLM in a human-readable format for the prompt
    tool_descriptions = "\n".join([
        f"- {name}: {func.__doc__.strip()}" for name, func in TOOL_REGISTRY.items()
    ])

    history = []
    current_observation = initial_problem_description

    for i in range(max_iterations):
        print(f"\n--- ITERATION {i+1}/{max_iterations} ---")
        
        # Construct the prompt for the LLM
        prompt = f"""
You are an autonomous AI agent designed to debug and fix Python code.
Your goal is: "{initial_problem_description}"

You have the following tools available:
{tool_descriptions}

Your response MUST be a JSON object with two keys: "thought" and "action".
"thought": Your reasoning process, current understanding, and plan.
"action": A JSON object specifying the "tool" to use and its "parameters".

Current Observation:
{current_observation}

History of interactions:
{json.dumps(history, indent=2)}
"""
        print(f"AGENT PROMPT (to LLM):\n{prompt}\n")
        
        llm_output = get_llm_response(prompt)
        print(f"LLM RAW OUTPUT:\n{llm_output}\n")
        
        tool_result = execute_llm_action(llm_output)
        
        history.append({"prompt": prompt, "llm_output": llm_output, "tool_result": tool_result})
        current_observation = tool_result # The result of the tool becomes the next observation
        
        if "Successfully" in tool_result and "run_shell" in llm_output and "train_world_model.py" in llm_output:
            print("\n--- AGENT SUCCESS: Script appears to be running successfully. ---")
            break
        elif "Error" in tool_result and "run_shell" in llm_output:
            print("\n--- AGENT FAILED TO FIX: Script still has errors. ---")
            # Continue for max_iterations to gather more errors
            
    print("\n--- AGENT LOOP ENDED ---")

if __name__ == "__main__":
    # Example usage:
    # Ensure GOOGLE_API_KEY is set in your .env file
    # You might need to adjust the initial_problem_description based on the actual error.
    initial_problem = "The script 'Scripts/train_world_model.py' is failing with an AttributeError. Debug and fix it."
    run_agent_loop(initial_problem, max_iterations=5)