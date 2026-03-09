import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/EmployeeDataForm.css';

const EmployeeDataForm = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false); 
  
  const [employeeInfo, setEmployeeInfo] = useState({
    employeeId: '',
    firstName: '',
    lastName: ''
  });
  
  // All fields in one big state object
  const [formData, setFormData] = useState({
    age: '', businessTravel: '', dailyRate: '', department: '',
    distanceFromHome: '', education: '', educationField: '',
    environmentSatisfaction: '', gender: '', hourlyRate: '',
    jobInvolvement: '', jobLevel: '', jobRole: '', jobSatisfaction: '',
    maritalStatus: '', monthlyIncome: '', monthlyRate: '',
    numCompaniesWorked: '', overTime: '', percentSalaryHike: '',
    performanceRating: '', relationshipSatisfaction: '',
    stockOptionLevel: '', totalWorkingYears: '', trainingTimesLastYear: '',
    workLifeBalance: '', yearsAtCompany: '', yearsInCurrentRole: '',
    yearsSinceLastPromotion: '', yearsWithCurrManager: ''
  });

  useEffect(() => {
    const storedEmployee = sessionStorage.getItem('employee');
    if (storedEmployee) {
      setEmployeeInfo(JSON.parse(storedEmployee));
    } else {
      navigate('/login');
    }
  }, [navigate]);

  const handleLogout = () => {
    sessionStorage.removeItem('employee');
    navigate('/login');
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    const dataToSubmit = {
      ...formData,
      employeeId: employeeInfo.employeeId
    };
    
    try {
      const response = await fetch("http://127.0.0.1:8000/employee-data", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(dataToSubmit),
      });

      if (!response.ok) throw new Error("Failed");
      
      await response.json();
      alert("Data Saved Successfully!");
      
    } catch (error) {
      alert("Error saving data");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page-container">
      <div className="header">
        <h2>Employee Data Entry</h2>
        <div className="user-info">
            <span>User: {employeeInfo.firstName}</span>
            <button onClick={handleLogout} className="logout-btn">Logout</button>
        </div>
      </div>

      <div className="form-wrapper">
        <form onSubmit={handleSubmit}>
            
            {/* Section 1: Personal Details */}
            <h3>1. Personal Details</h3>
            <div className="input-group">
                <label>Age:</label>
                <input type="number" name="age" onChange={handleInputChange} required />
            </div>
            
            <div className="input-group">
                <label>Gender:</label>
                <select name="gender" onChange={handleInputChange}>
                    <option value="">Select</option>
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                </select>
            </div>

            <div className="input-group">
                <label>Marital Status:</label>
                <select name="maritalStatus" onChange={handleInputChange}>
                    <option value="">Select</option>
                    <option value="Single">Single</option>
                    <option value="Married">Married</option>
                    <option value="Divorced">Divorced</option>
                </select>
            </div>

            <div className="input-group">
                <label>Distance From Home (km):</label>
                <input type="number" name="distanceFromHome" onChange={handleInputChange} />
            </div>

            <hr />

            {/* Section 2: Job Info */}
            <h3>2. Job Information</h3>
            <div className="input-group">
                <label>Department:</label>
                <select name="department" onChange={handleInputChange}>
                    <option value="">Select</option>
                    <option value="Sales">Sales</option>
                    <option value="Research & Development">R&D</option>
                    <option value="Human Resources">HR</option>
                </select>
            </div>

            <div className="input-group">
                <label>Job Role:</label>
                <select name="jobRole" onChange={handleInputChange}>
                    <option value="">Select</option>
                    <option value="Sales Executive">Sales Executive</option>
                    <option value="Research Scientist">Research Scientist</option>
                    <option value="Laboratory Technician">Lab Tech</option>
                    <option value="Manager">Manager</option>
                </select>
            </div>

            <div className="input-group">
                <label>Business Travel:</label>
                <select name="businessTravel" onChange={handleInputChange}>
                    <option value="">Select</option>
                    <option value="Non-Travel">None</option>
                    <option value="Travel_Rarely">Rarely</option>
                    <option value="Travel_Frequently">Frequently</option>
                </select>
            </div>

            <div className="input-group">
                <label>Over Time:</label>
                <select name="overTime" onChange={handleInputChange}>
                    <option value="">Select</option>
                    <option value="Yes">Yes</option>
                    <option value="No">No</option>
                </select>
            </div>

            <hr />

            {/* Section 3: Money */}
            <h3>3. Salary & Compensation</h3>
            <div className="input-group">
                <label>Monthly Income ($):</label>
                <input type="number" name="monthlyIncome" onChange={handleInputChange} />
            </div>

            <div className="input-group">
                <label>Percent Salary Hike (%):</label>
                <input type="number" name="percentSalaryHike" onChange={handleInputChange} />
            </div>

            <div className="input-group">
                <label>Stock Option Level (0-3):</label>
                <input type="number" name="stockOptionLevel" min="0" max="3" onChange={handleInputChange} />
            </div>

            <hr />

            {/* Section 4: Satisfaction (1-4) */}
            <h3>4. Satisfaction Surveys (Scale 1-4)</h3>
            <div className="input-group">
                <label>Environment Satisfaction:</label>
                <select name="environmentSatisfaction" onChange={handleInputChange}>
                    <option value="1">1 - Low</option>
                    <option value="2">2 - Medium</option>
                    <option value="3">3 - High</option>
                    <option value="4">4 - Very High</option>
                </select>
            </div>

            <div className="input-group">
                <label>Job Satisfaction:</label>
                <select name="jobSatisfaction" onChange={handleInputChange}>
                    <option value="1">1 - Low</option>
                    <option value="2">2 - Medium</option>
                    <option value="3">3 - High</option>
                    <option value="4">4 - Very High</option>
                </select>
            </div>

            <div className="input-group">
                <label>Work Life Balance:</label>
                <select name="workLifeBalance" onChange={handleInputChange}>
                    <option value="1">1 - Bad</option>
                    <option value="2">2 - Good</option>
                    <option value="3">3 - Better</option>
                    <option value="4">4 - Best</option>
                </select>
            </div>

            <hr />

            {/* Section 5: Experience */}
            <h3>5. Experience</h3>
            <div className="input-group">
                <label>Total Working Years:</label>
                <input type="number" name="totalWorkingYears" onChange={handleInputChange} />
            </div>

            <div className="input-group">
                <label>Years at Company:</label>
                <input type="number" name="yearsAtCompany" onChange={handleInputChange} />
            </div>

            <div className="input-group">
                <label>Years Since Last Promotion:</label>
                <input type="number" name="yearsSinceLastPromotion" onChange={handleInputChange} />
            </div>

            <br />
            <button type="submit" className="submit-btn" disabled={loading}>
                {loading ? "Saving..." : "Submit Data"}
            </button>

        </form>
      </div>
    </div>
  );
};

export default EmployeeDataForm;