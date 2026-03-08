from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import os
import sqlite3

# ---------- App setup ----------
app = FastAPI(title="AttritionIQ Dashboard")

# ---------- Routes ----------
@app.get("/")
def root():
    return {"message": "AttritionIQ API", "status": "healthy"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)

    app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://127.0.0.1:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ---------- Configuration ----------
DB_DIR = "db"
DB_PATH = os.path.join(DB_DIR, "employees.db")

# ---------- DB Helpers ----------
def get_connection():
    ensure_db_exists()
    conn = sqlite3.connect(DB_PATH, check_same_thread=False)
    conn.row_factory = sqlite3.Row
    return conn

def ensure_db_exists():
    if not os.path.exists(DB_DIR):
        os.makedirs(DB_DIR, exist_ok=True)
    if not os.path.exists(DB_PATH):
        init_db()