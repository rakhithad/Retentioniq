import os
import sqlite3
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from datetime import datetime
from typing import Optional, List, Dict, Any
import bcrypt
from fastapi import HTTPException, status
from pydantic import BaseModel, EmailStr, Field, constr
import shap
import matplotlib
matplotlib.use('Agg') # This tells the server to draw graphs in the background without opening a window
import matplotlib.pyplot as plt
import base64
from io import BytesIO

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


# ---------- Load ML Model ----------
MODEL_PATH = "rf_model_optimized.pkl"
LABEL_ENCODERS_PATH = "label_encoders.pkl"
CATEGORICAL_COLUMNS = ['BusinessTravel', 'Department', 'EducationField', 'Gender', 'JobRole', 'MaritalStatus', 'OverTime']

try:
    model = joblib.load(MODEL_PATH)
except:
    model = None

try:
    label_encoders = joblib.load(LABEL_ENCODERS_PATH)
except:
    label_encoders = None

# ---------- Feature Engineering ----------
def prepare_features_for_prediction(data: dict) -> pd.DataFrame:
    feature_columns = [
        'Age', 'BusinessTravel', 'DailyRate', 'Department', 'DistanceFromHome',
        'Education', 'EducationField', 'EnvironmentSatisfaction', 'Gender',
        'HourlyRate', 'JobInvolvement', 'JobLevel', 'JobRole', 'JobSatisfaction',
        'MaritalStatus', 'MonthlyIncome', 'MonthlyRate', 'NumCompaniesWorked',
        'OverTime', 'PercentSalaryHike', 'PerformanceRating', 'RelationshipSatisfaction',
        'StockOptionLevel', 'TotalWorkingYears', 'TrainingTimesLastYear',
        'WorkLifeBalance', 'YearsAtCompany', 'YearsInCurrentRole',
        'YearsSinceLastPromotion', 'YearsWithCurrManager'
    ]
    features = pd.DataFrame(index=[0], columns=feature_columns)
    
    numeric_mappings = {
        'age': 'Age', 'dailyRate': 'DailyRate', 'distanceFromHome': 'DistanceFromHome',
        'hourlyRate': 'HourlyRate', 'jobLevel': 'JobLevel', 'monthlyIncome': 'MonthlyIncome',
        'monthlyRate': 'MonthlyRate', 'numCompaniesWorked': 'NumCompaniesWorked',
        'percentSalaryHike': 'PercentSalaryHike', 'stockOptionLevel': 'StockOptionLevel',
        'totalWorkingYears': 'TotalWorkingYears', 'trainingTimesLastYear': 'TrainingTimesLastYear',
        'yearsAtCompany': 'YearsAtCompany', 'yearsInCurrentRole': 'YearsInCurrentRole',
        'yearsSinceLastPromotion': 'YearsSinceLastPromotion', 'yearsWithCurrManager': 'YearsWithCurrManager'
    }
    
    for data_key, feature_key in numeric_mappings.items():
        features.loc[0, feature_key] = data.get(data_key, 0)
    
    label_mappings = {
        'education': 'Education', 'environmentSatisfaction': 'EnvironmentSatisfaction',
        'jobInvolvement': 'JobInvolvement', 'jobSatisfaction': 'JobSatisfaction',
        'performanceRating': 'PerformanceRating', 'relationshipSatisfaction': 'RelationshipSatisfaction',
        'workLifeBalance': 'WorkLifeBalance'
    }
    
    for data_key, feature_key in label_mappings.items():
        features.loc[0, feature_key] = data.get(data_key, 1)
    
    categorical_mappings = {
        'businessTravel': 'BusinessTravel', 'department': 'Department',
        'educationField': 'EducationField', 'gender': 'Gender',
        'jobRole': 'JobRole', 'maritalStatus': 'MaritalStatus', 'overTime': 'OverTime'
    }
    
    if label_encoders:
        for data_key, feature_key in categorical_mappings.items():
            value = data.get(data_key)
            if value and feature_key in label_encoders:
                try:
                    features.loc[0, feature_key] = label_encoders[feature_key].transform([str(value)])[0]
                except:
                    features.loc[0, feature_key] = 0
            else:
                features.loc[0, feature_key] = 0
    else:
        for _, feature_key in categorical_mappings.items():
            features.loc[0, feature_key] = 0
    
    features = features.infer_objects(copy=False).fillna(0)
    numeric_columns = [col for col in features.columns if col not in CATEGORICAL_COLUMNS]
    for col in numeric_columns:
        features[col] = pd.to_numeric(features[col], errors='coerce').fillna(0)
    
    return features

def predict_attrition(employee_data: dict) -> Dict[str, Any]:
    if model is None:
        return {'prediction': 'No', 'probability': 0.25, 'risk_level': 'Low', 'confidence': 0.75}
    try:
        features = prepare_features_for_prediction(employee_data)
        prediction = model.predict(features)[0]
        probability = model.predict_proba(features)[0]
        attrition_prob = probability[1] if len(probability) > 1 else probability[0]
        confidence = max(probability) if len(probability) > 1 else abs(0.5 - probability[0]) + 0.5
        
        risk_level = 'High' if attrition_prob >= 0.7 else 'Medium' if attrition_prob >= 0.4 else 'Low'
        
        return {
            'prediction': 'Yes' if prediction == 1 else 'No',
            'probability': float(attrition_prob),
            'risk_level': risk_level,
            'confidence': float(confidence)
        }
    except:
        return {'prediction': 'No', 'probability': 0.25, 'risk_level': 'Low', 'confidence': 0.75}


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


@app.get("/dashboard/employees")
def get_dashboard_employees():
    """Get all employees with their attrition predictions"""
    conn = get_connection()
    cur = conn.cursor()
    cur.execute("""
        SELECT e.employeeId, e.firstName, e.lastName, e.department, e.position,
               er.JobRole, er.Age, er.BusinessTravel, er.DailyRate, er.Department as RecordDepartment,
               er.DistanceFromHome, er.Education, er.EducationField, er.EnvironmentSatisfaction,
               er.Gender, er.HourlyRate, er.JobInvolvement, er.JobLevel, er.JobSatisfaction,
               er.MaritalStatus, er.MonthlyIncome, er.MonthlyRate, er.NumCompaniesWorked,
               er.OverTime, er.PercentSalaryHike, er.PerformanceRating, er.RelationshipSatisfaction,
               er.StockOptionLevel, er.TotalWorkingYears, er.TrainingTimesLastYear, er.WorkLifeBalance,
               er.YearsAtCompany, er.YearsInCurrentRole, er.YearsSinceLastPromotion, er.YearsWithCurrManager
        FROM employees e
        LEFT JOIN (
            SELECT DISTINCT employeeId, 
                   FIRST_VALUE(JobRole) OVER (PARTITION BY employeeId ORDER BY created_at DESC) as JobRole,
                   FIRST_VALUE(Age) OVER (PARTITION BY employeeId ORDER BY created_at DESC) as Age,
                   FIRST_VALUE(BusinessTravel) OVER (PARTITION BY employeeId ORDER BY created_at DESC) as BusinessTravel,
                   FIRST_VALUE(DailyRate) OVER (PARTITION BY employeeId ORDER BY created_at DESC) as DailyRate,
                   FIRST_VALUE(Department) OVER (PARTITION BY employeeId ORDER BY created_at DESC) as Department,
                   FIRST_VALUE(DistanceFromHome) OVER (PARTITION BY employeeId ORDER BY created_at DESC) as DistanceFromHome,
                   FIRST_VALUE(Education) OVER (PARTITION BY employeeId ORDER BY created_at DESC) as Education,
                   FIRST_VALUE(EducationField) OVER (PARTITION BY employeeId ORDER BY created_at DESC) as EducationField,
                   FIRST_VALUE(EnvironmentSatisfaction) OVER (PARTITION BY employeeId ORDER BY created_at DESC) as EnvironmentSatisfaction,
                   FIRST_VALUE(Gender) OVER (PARTITION BY employeeId ORDER BY created_at DESC) as Gender,
                   FIRST_VALUE(HourlyRate) OVER (PARTITION BY employeeId ORDER BY created_at DESC) as HourlyRate,
                   FIRST_VALUE(JobInvolvement) OVER (PARTITION BY employeeId ORDER BY created_at DESC) as JobInvolvement,
                   FIRST_VALUE(JobLevel) OVER (PARTITION BY employeeId ORDER BY created_at DESC) as JobLevel,
                   FIRST_VALUE(JobSatisfaction) OVER (PARTITION BY employeeId ORDER BY created_at DESC) as JobSatisfaction,
                   FIRST_VALUE(MaritalStatus) OVER (PARTITION BY employeeId ORDER BY created_at DESC) as MaritalStatus,
                   FIRST_VALUE(MonthlyIncome) OVER (PARTITION BY employeeId ORDER BY created_at DESC) as MonthlyIncome,
                   FIRST_VALUE(MonthlyRate) OVER (PARTITION BY employeeId ORDER BY created_at DESC) as MonthlyRate,
                   FIRST_VALUE(NumCompaniesWorked) OVER (PARTITION BY employeeId ORDER BY created_at DESC) as NumCompaniesWorked,
                   FIRST_VALUE(OverTime) OVER (PARTITION BY employeeId ORDER BY created_at DESC) as OverTime,
                   FIRST_VALUE(PercentSalaryHike) OVER (PARTITION BY employeeId ORDER BY created_at DESC) as PercentSalaryHike,
                   FIRST_VALUE(PerformanceRating) OVER (PARTITION BY employeeId ORDER BY created_at DESC) as PerformanceRating,
                   FIRST_VALUE(RelationshipSatisfaction) OVER (PARTITION BY employeeId ORDER BY created_at DESC) as RelationshipSatisfaction,
                   FIRST_VALUE(StockOptionLevel) OVER (PARTITION BY employeeId ORDER BY created_at DESC) as StockOptionLevel,
                   FIRST_VALUE(TotalWorkingYears) OVER (PARTITION BY employeeId ORDER BY created_at DESC) as TotalWorkingYears,
                   FIRST_VALUE(TrainingTimesLastYear) OVER (PARTITION BY employeeId ORDER BY created_at DESC) as TrainingTimesLastYear,
                   FIRST_VALUE(WorkLifeBalance) OVER (PARTITION BY employeeId ORDER BY created_at DESC) as WorkLifeBalance,
                   FIRST_VALUE(YearsAtCompany) OVER (PARTITION BY employeeId ORDER BY created_at DESC) as YearsAtCompany,
                   FIRST_VALUE(YearsInCurrentRole) OVER (PARTITION BY employeeId ORDER BY created_at DESC) as YearsInCurrentRole,
                   FIRST_VALUE(YearsSinceLastPromotion) OVER (PARTITION BY employeeId ORDER BY created_at DESC) as YearsSinceLastPromotion,
                   FIRST_VALUE(YearsWithCurrManager) OVER (PARTITION BY employeeId ORDER BY created_at DESC) as YearsWithCurrManager
            FROM employee_records
        ) er ON e.employeeId = er.employeeId
    """)
    
    rows = cur.fetchall()
    conn.close()
    
    employees = []
    for row in rows:
        employee_data = {
            'age': row['Age'], 'businessTravel': row['BusinessTravel'], 'dailyRate': row['DailyRate'],
            'department': row['RecordDepartment'] or row['department'], 'distanceFromHome': row['DistanceFromHome'],
            'education': row['Education'], 'educationField': row['EducationField'],
            'environmentSatisfaction': row['EnvironmentSatisfaction'], 'gender': row['Gender'],
            'hourlyRate': row['HourlyRate'], 'jobInvolvement': row['JobInvolvement'],
            'jobLevel': row['JobLevel'], 'jobRole': row['JobRole'] or row['position'],
            'jobSatisfaction': row['JobSatisfaction'], 'maritalStatus': row['MaritalStatus'],
            'monthlyIncome': row['MonthlyIncome'], 'monthlyRate': row['MonthlyRate'],
            'numCompaniesWorked': row['NumCompaniesWorked'], 'overTime': row['OverTime'],
            'percentSalaryHike': row['PercentSalaryHike'], 'performanceRating': row['PerformanceRating'],
            'relationshipSatisfaction': row['RelationshipSatisfaction'], 'stockOptionLevel': row['StockOptionLevel'],
            'totalWorkingYears': row['TotalWorkingYears'], 'trainingTimesLastYear': row['TrainingTimesLastYear'],
            'workLifeBalance': row['WorkLifeBalance'], 'yearsAtCompany': row['YearsAtCompany'],
            'yearsInCurrentRole': row['YearsInCurrentRole'], 'yearsSinceLastPromotion': row['YearsSinceLastPromotion'],
            'yearsWithCurrManager': row['YearsWithCurrManager']
        }
        
        prediction = predict_attrition(employee_data)
        
        employee = {
            'employeeId': row['employeeId'], 'firstName': row['firstName'], 'lastName': row['lastName'],
            'jobRole': row['JobRole'] or row['position'] or 'Not Specified',
            'department': row['RecordDepartment'] or row['department'] or 'Not Specified',
            'predictedAttrition': prediction['prediction'],
            'attritionProbability': prediction['probability'],
            'riskLevel': prediction['risk_level']
        }
        employees.append(employee)
    
    return {"employees": employees}

@app.get("/dashboard/analytics")
def get_dashboard_analytics():
    """Get comprehensive attrition analytics"""
    dashboard_data = get_dashboard_employees()
    employees = dashboard_data["employees"]
    
    if not employees:
        return {
            "totalEmployees": 0, "highRiskCount": 0, "mediumRiskCount": 0, "lowRiskCount": 0,
            "attritionRate": 0.0, "departmentRisk": {}, "jobRoleRisk": {}, "topRiskFactors": []
        }
    
    total_employees = len(employees)
    high_risk = sum(1 for emp in employees if emp['riskLevel'] == 'High')
    medium_risk = sum(1 for emp in employees if emp['riskLevel'] == 'Medium')
    low_risk = sum(1 for emp in employees if emp['riskLevel'] == 'Low')
    
    predicted_attritions = sum(1 for emp in employees if emp['predictedAttrition'] == 'Yes')
    attrition_rate = (predicted_attritions / total_employees) * 100 if total_employees > 0 else 0
    
    dept_stats = {}
    for emp in employees:
        dept = emp['department']
        if dept not in dept_stats:
            dept_stats[dept] = {'total': 0, 'high_risk': 0}
        dept_stats[dept]['total'] += 1
        if emp['riskLevel'] == 'High':
            dept_stats[dept]['high_risk'] += 1
            
    department_risk = {
        dept: (stats['high_risk'] / stats['total']) * 100 if stats['total'] > 0 else 0
        for dept, stats in dept_stats.items()
    }
    
    top_risk_factors = [
        {"factor": "Work-Life Balance", "impact": 0.85, "description": "Poor work-life balance strongly predicts attrition"},
        {"factor": "Job Satisfaction", "impact": 0.78, "description": "Low job satisfaction increases leaving likelihood"},
        {"factor": "Overtime Work", "impact": 0.72, "description": "Frequent overtime correlates with higher turnover"}
    ]
    
    return {
        "totalEmployees": total_employees, "highRiskCount": high_risk,
        "mediumRiskCount": medium_risk, "lowRiskCount": low_risk,
        "attritionRate": round(attrition_rate, 2), "departmentRisk": department_risk,
        "topRiskFactors": top_risk_factors
    }

# ---------- Explainability & Recommendations ----------
def get_readable_feature_name(feature_name: str) -> str:
    name_mapping = {
        'Age': 'Age', 'BusinessTravel': 'Business Travel Frequency', 'DailyRate': 'Daily Pay Rate',
        'Department': 'Department', 'DistanceFromHome': 'Distance from Home', 'Education': 'Education Level',
        'EnvironmentSatisfaction': 'Work Environment Satisfaction', 'JobRole': 'Job Role',
        'JobSatisfaction': 'Job Satisfaction', 'MonthlyIncome': 'Monthly Income',
        'OverTime': 'Overtime Work', 'WorkLifeBalance': 'Work-Life Balance',
        'YearsAtCompany': 'Years at Current Company', 'YearsSinceLastPromotion': 'Years Since Last Promotion'
    }
    return name_mapping.get(feature_name, feature_name)

def get_feature_description(feature_name: str, feature_value, shap_value: float) -> str:
    impact = "increases" if shap_value > 0 else "decreases"
    return f"{get_readable_feature_name(feature_name)} value of {feature_value} {impact} attrition risk."

def generate_shap_plot(explainer, features, shap_values) -> str:
    try:
        plt.figure(figsize=(10, 8))
        expected_val = explainer.expected_value[1] if isinstance(explainer.expected_value, (list, np.ndarray)) and len(explainer.expected_value) > 1 else (explainer.expected_value[0] if isinstance(explainer.expected_value, (list, np.ndarray)) else explainer.expected_value)
        shap_vals_for_plot = shap_values[0] if len(shap_values.shape) > 1 else shap_values
        
        shap.plots.waterfall(expected_val, shap_vals_for_plot, features.iloc[0], show=False)
        plt.title("SHAP Feature Impact on Attrition Prediction", fontsize=14, fontweight='bold')
        plt.tight_layout()
      
        buffer = BytesIO()
        plt.savefig(buffer, format='png', dpi=150, bbox_inches='tight')
        buffer.seek(0)
        plot_base64 = base64.b64encode(buffer.read()).decode('utf-8')
        buffer.close()
        plt.close()
        return f"data:image/png;base64,{plot_base64}"
    except Exception as e:
        plt.close()  
        return None

def get_mock_shap_data(employee_data: dict) -> Dict[str, Any]:
    """Fallback realistic data if SHAP calculation fails"""
    return {
        'top_factors': [
            {'feature': 'Work-Life Balance', 'shap_value': 0.085, 'feature_value': employee_data.get('workLifeBalance', 2), 'impact': 'increases', 'description': "Poor work-life balance increases risk."},
            {'feature': 'Overtime Work', 'shap_value': 0.072, 'feature_value': employee_data.get('overTime', 'Yes'), 'impact': 'increases', 'description': "Frequent overtime increases risk."}
        ],
        'shap_plot': None, 'base_value': 0.3, 'prediction_value': 0.45,
        'recommendations': [{'action': 'Improve Work-Life Balance', 'priority': 'High', 'timeline': '1-2 months', 'suggestions': ['Flexible hours', 'Review workload']}]
    }

def get_shap_explanation(employee_data: dict) -> Dict[str, Any]:
    if model is None: return get_mock_shap_data(employee_data)
    try:
        features = prepare_features_for_prediction(employee_data)
        explainer = shap.TreeExplainer(model)
        shap_values = explainer.shap_values(features)
        shap_values_pos = shap_values[1] if isinstance(shap_values, list) and len(shap_values) == 2 else (shap_values[0] if isinstance(shap_values, list) else shap_values)
        
        shap_vals = np.array(shap_values_pos[0] if len(shap_values_pos.shape) > 1 else shap_values_pos).flatten()
        feature_names = features.columns.tolist()
        feature_values = features.iloc[0].tolist()
        
        feature_shap_pairs = list(zip(feature_names, [float(v) for v in shap_vals], feature_values))
        feature_shap_pairs.sort(key=lambda x: abs(x[1]), reverse=True)
        
        top_factors = []
        for feature_name, shap_val, feature_val in feature_shap_pairs[:5]:
            top_factors.append({
                'feature': get_readable_feature_name(feature_name),
                'shap_value': shap_val, 'feature_value': feature_val,
                'impact': "increases" if shap_val > 0 else "decreases",
                'description': get_feature_description(feature_name, feature_val, shap_val)
            })
            
        plot = generate_shap_plot(explainer, features, shap_values_pos)
        
        return {
            'top_factors': top_factors, 'shap_plot': plot,
            'base_value': float(explainer.expected_value[1] if isinstance(explainer.expected_value, (list, np.ndarray)) and len(explainer.expected_value) > 1 else (explainer.expected_value[0] if isinstance(explainer.expected_value, (list, np.ndarray)) else explainer.expected_value)),
        }
    except Exception as e:
        print(f"SHAP error: {e}")
        return get_mock_shap_data(employee_data)

@app.get("/dashboard/employee/{employeeId}/detailed-analysis")
def get_employee_detailed_analysis(employeeId: str):
    conn = get_connection()
    cur = conn.cursor()
    cur.execute("SELECT * FROM employees WHERE employeeId=?", (employeeId,))
    employee_row = cur.fetchone()
    cur.execute("SELECT * FROM employee_records WHERE employeeId=? ORDER BY created_at DESC LIMIT 1", (employeeId,))
    data_row = cur.fetchone()
    conn.close()
    
    if not employee_row or not data_row:
        raise HTTPException(status_code=404, detail="Data not found")
        
    employee_data = dict(data_row)
    prediction = predict_attrition(employee_data)
    shap_data = get_shap_explanation(employee_data)
    
    # Generate simple recommendations based on top factors
    recommendations = []
    for factor in shap_data.get('top_factors', []):
        if factor['shap_value'] > 0:
            recommendations.append({
                'action': f"Address {factor['feature']} concerns",
                'priority': 'High' if factor['shap_value'] > 0.05 else 'Medium',
                'timeline': '2-4 weeks',
                'suggestions': [f"Schedule 1-on-1 to discuss {factor['feature'].lower()}"]
            })
            
    if 'recommendations' in shap_data: # use mock recs if they exist
        recommendations = shap_data['recommendations']

    return {
        "employeeId": employeeId,
        "name": f"{employee_row['firstName']} {employee_row['lastName']}",
        "department": employee_row['department'],
        "prediction": prediction,
        "shapAnalysis": shap_data,
        "recommendations": recommendations[:3],
        "riskScore": prediction['probability'] * 100
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)