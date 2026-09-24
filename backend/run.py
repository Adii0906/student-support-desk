"""Start the API: python run.py  (works from any folder)."""
import os
import sys

HERE = os.path.dirname(os.path.abspath(__file__))
os.chdir(HERE)
sys.path.insert(0, HERE)

import uvicorn  # noqa: E402

if __name__ == "__main__":
    host = os.environ.get("HOST", "127.0.0.1")
    port = int(os.environ.get("PORT", "8000"))
    reload = os.environ.get("UVICORN_RELOAD", "false").lower() in {"1", "true", "yes", "on"}
    print(f"\n  Ticket API: http://{host}:{port}   API docs: http://{host}:{port}/docs\n")
    uvicorn.run("main:app", host=host, port=port, reload=reload, reload_dirs=[HERE] if reload else None)
