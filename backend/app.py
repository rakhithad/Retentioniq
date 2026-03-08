import os
import sqlite3
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from datetime import datetime
from typing import Optional, List, Dict, Any
import bcrypt
from fastapi import HTTPException, status
from pydantic import BaseModel, EmailStr, Field, constr

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

# ---------- App setup ----------
app = FastAPI(title="AttritionIQ Dashboard")

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

# ---------- Password Utility ----------
def hash_password(password: str) -> str:
    """Hash password using bcrypt"""
    password_bytes = password.encode('utf-8')[:72]
    salt = bcrypt.gensalt()
    hashed = bcrypt.hashpw(password_bytes, salt)
    return hashed.decode('utf-8')

def verify_password(plain_password: str, hashed_password: str) -> bool:
    """Verify password against hash"""
    password_bytes = plain_password.encode('utf-8')[:72]
    hashed_bytes = hashed_password.encode('utf-8')
    return bcrypt.checkpw(password_bytes, hashed_bytes)

# ---------- Pydantic Models ----------
class EmployeeCreate(BaseModel):
    firstName: constr(strip_whitespace=True, min_length=1)
    lastName: constr(strip_whitespace=True, min_length=1)
    email: EmailStr
    phone: constr(strip_whitespace=True, min_length=4)
    employeeId: constr(strip_whitespace=True, min_length=1)
    department: Optional[str] = Field(default="")
    position: Optional[str] = Field(default="")
    password: constr(min_length=6)

class EmployeeLogin(BaseModel):
    employeeId: str
    password: str

class EmployeeData(BaseModel):
    employeeId: Optional[str] = None
    age: Optional[int] = None
    businessTravel: Optional[str] = None
    dailyRate: Optional[int] = None
    department: Optional[str] = None
    # ... (Note: In your actual code, include all 30+ fields here exactly as you wrote them)
    yearsSinceLastPromotion: Optional[int] = None
    yearsWithCurrManager: Optional[int] = None

# ---------- Routes ----------
@app.get("/")
def root():
    return {"message": "AttritionIQ API", "status": "healthy"}

@app.post("/register", status_code=201)
def register_employee(payload: EmployeeCreate):
    conn = get_connection()
    cur = conn.cursor()
    try:
        cur.execute("SELECT 1 FROM employees WHERE employeeId=?", (payload.employeeId,))
        if cur.fetchone():
            raise HTTPException(status_code=409, detail="Employee ID already exists")
        
        hashed = hash_password(payload.password)
        created_at = datetime.utcnow().isoformat() + "Z"
        
        cur.execute(
            """INSERT INTO employees 
               (employeeId, firstName, lastName, email, phone, department, position, hashed_password, created_at)
               VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)""",
            (payload.employeeId, payload.firstName, payload.lastName, payload.email,
             payload.phone, payload.department, payload.position, hashed, created_at)
        )
        conn.commit()
        return {"message": "Registration successful", "employeeId": payload.employeeId}
    finally:
        conn.close()

@app.post("/login")
def login_employee(payload: EmployeeLogin):
    conn = get_connection()
    cur = conn.cursor()
    try:
        cur.execute("SELECT * FROM employees WHERE employeeId=?", (payload.employeeId,))
        row = cur.fetchone()
        
        if not row or not verify_password(payload.password, row["hashed_password"]):
            raise HTTPException(status_code=401, detail="Invalid credentials")
        
        return {
            "message": "Login successful",
            "employeeId": row["employeeId"],
            "firstName": row["firstName"],
            "lastName": row["lastName"],
            "email": row["email"],
            "department": row["department"],
            "position": row["position"]
        }
    finally:
        conn.close()
        

@app.get("/health")
def health_check():
    return {
        "status": "healthy",
        "database": "connected" if os.path.exists(DB_PATH) else "initializing"
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)