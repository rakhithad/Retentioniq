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

@app.get("/health")
def health_check():
    return {
        "status": "healthy",
        "database": "connected" if os.path.exists(DB_PATH) else "initializing"
    }

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

@app.on_event("startup")
async def startup_event():
    ensure_db_exists()

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

def init_db():
    os.makedirs(DB_DIR, exist_ok=True)
    conn = sqlite3.connect(DB_PATH, check_same_thread=False)
    cur = conn.cursor()
    try:
        cur.execute("""
            CREATE TABLE IF NOT EXISTS employees (
                employeeId TEXT PRIMARY KEY,
                firstName TEXT NOT NULL,
                lastName TEXT NOT NULL,
                email TEXT NOT NULL,
                phone TEXT NOT NULL,
                department TEXT,
                position TEXT,
                hashed_password TEXT NOT NULL,
                created_at TEXT NOT NULL
            )
        """)
        cur.execute("""
            CREATE TABLE IF NOT EXISTS employee_records (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                employeeId TEXT NOT NULL,
                created_at TEXT NOT NULL,
                Age INTEGER, BusinessTravel TEXT, DailyRate INTEGER,
                Department TEXT, DistanceFromHome INTEGER, Education INTEGER,
                EducationField TEXT, EnvironmentSatisfaction INTEGER, Gender TEXT,
                HourlyRate INTEGER, JobInvolvement INTEGER, JobLevel INTEGER,
                JobRole TEXT, JobSatisfaction INTEGER, MaritalStatus TEXT,
                MonthlyIncome INTEGER, MonthlyRate INTEGER, NumCompaniesWorked INTEGER,
                OverTime TEXT, PercentSalaryHike INTEGER, PerformanceRating INTEGER,
                RelationshipSatisfaction INTEGER, StockOptionLevel INTEGER,
                TotalWorkingYears INTEGER, TrainingTimesLastYear INTEGER,
                WorkLifeBalance INTEGER, YearsAtCompany INTEGER,
                YearsInCurrentRole INTEGER, YearsSinceLastPromotion INTEGER,
                YearsWithCurrManager INTEGER,
                FOREIGN KEY (employeeId) REFERENCES employees(employeeId)
            )
        """)
        conn.commit()
    finally:
        conn.close()


