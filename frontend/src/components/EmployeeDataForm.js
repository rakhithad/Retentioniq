import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronRight, User, Users, Briefcase, MapPin, GraduationCap, Clock, DollarSign, Star, Heart, TrendingUp, LogOut } from 'lucide-react';
import '../styles/EmployeeDataForm.css';

const EmployeeDataForm = () => {
  const [currentPage, setCurrentPage] = useState(1);
  const totalPages = 5;
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  
  const [employeeInfo, setEmployeeInfo] = useState({
    employeeId: '',
    firstName: '',
    lastName: ''
  });
  
  const [formData, setFormData] = useState({
    age: '',
    businessTravel: '',
    dailyRate: '',
    department: '',
    distanceFromHome: '',
    education: '',
    educationField: '',
    environmentSatisfaction: '',
    gender: '',
    hourlyRate: '',
    jobInvolvement: '',
    jobLevel: '',
    jobRole: '',
    jobSatisfaction: '',
    maritalStatus: '',
    monthlyIncome: '',
    monthlyRate: '',
    numCompaniesWorked: '',
    overTime: '',
    percentSalaryHike: '',
    performanceRating: '',
    relationshipSatisfaction: '',
    stockOptionLevel: '',
    totalWorkingYears: '',
    trainingTimesLastYear: '',
    workLifeBalance: '',
    yearsAtCompany: '',
    yearsInCurrentRole: '',
    yearsSinceLastPromotion: '',
    yearsWithCurrManager: ''
  });

  useEffect(() => {
    const storedEmployee = sessionStorage.getItem('employee');
    if (storedEmployee) {
      const employee = JSON.parse(storedEmployee);
      setEmployeeInfo(employee);
      loadExistingFormData(employee.employeeId);
    } else {
      navigate('/login');
    }
  }, [navigate]);

  const loadExistingFormData = async (employeeId) => {
    try {
      const response = await fetch(`http://127.0.0.1:8000/employee-form-data/${employeeId}`);
      if (response.ok) {
        const data = await response.json();
        if (data.formData) {
          setFormData(prevData => ({
            ...prevData,
            ...data.formData
          }));
        }
      }
    } catch (error) {
      console.error("Error loading existing form data:", error);
    } finally {
      setLoading(false);
    }
  };

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
    const dataToSubmit = {
      ...formData,
      employeeId: employeeInfo.employeeId
    };
    
    console.log("Form data being sent:", dataToSubmit);
    try {
      const response = await fetch("http://127.0.0.1:8000/employee-data", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(dataToSubmit),
      });

      if (!response.ok) throw new Error("Failed to save data");
      const data = await response.json();
      alert(data.message);
      console.log("Saved:", data);
    } catch (error) {
      console.error("Error:", error);
      alert("Error saving data");
    }
  };

  const renderInput = (name, label, type = 'text', options = null, icon = null) => (
    <div className="form-group">
      <label htmlFor={name} className="form-label">
        {icon && <span className="label-icon">{icon}</span>}
        {label}
      </label>
      {type === 'select' ? (
        <select
          id={name}
          name={name}
          value={formData[name] || ''}
          onChange={handleInputChange}
          className="form-input"
          required
        >
          <option value="">Select {label}</option>
          {options.map(option => (
            <option key={option} value={option}>{option}</option>
          ))}
        </select>
      ) : (
        <input
          type={type}
          id={name}
          name={name}
          value={formData[name] || ''}
          onChange={handleInputChange}
          className="form-input"
          placeholder={`Enter ${label.toLowerCase()}`}
          required
        />
      )}
    </div>
  );

  const renderPage1 = () => (
    <div className="form-page">
      <div className="page-header">
        <User className="page-icon" />
        <h2>Personal Information</h2>
        <p>Basic employee details and demographics</p>
      </div>
      <div className="form-grid">
        <div className="form-group">
          <label className="form-label">
            <User size={16} />
            Employee ID
          </label>
          <input
            type="text"
            value={employeeInfo.employeeId}
            className="form-input"
            disabled
            style={{ backgroundColor: '#f5f5f5', color: '#666' }}
          />
        </div>
        {renderInput('age', 'Age', 'number', null, <User size={16} />)}
        {renderInput('gender', 'Gender', 'select', ['Male', 'Female'], <User size={16} />)}
        {renderInput('maritalStatus', 'Marital Status', 'select', ['Married', 'Single', 'Divorced'], <Heart size={16} />)}
        {renderInput('distanceFromHome', 'Distance From Home (km)', 'number', null, <MapPin size={16} />)}
      </div>
    </div>
  );

  const renderPage2 = () => (
    <div className="form-page">
      <div className="page-header">
        <GraduationCap className="page-icon" />
        <h2>Education & Background</h2>
        <p>Educational qualifications and experience</p>
      </div>
      <div className="form-grid">
        {renderInput('education', 'Education Level', 'select', ['Below College', 'College', 'Bachelor', 'Master', 'Doctor'], <GraduationCap size={16} />)}
        {renderInput('educationField', 'Education Field', 'select', ['Life Sciences', 'Medical', 'Marketing'], <GraduationCap size={16} />)}
        {renderInput('totalWorkingYears', 'Total Working Years', 'number', null, <Clock size={16} />)}
        {renderInput('numCompaniesWorked', 'Number of Companies Worked', 'number', null, <Briefcase size={16} />)}
        {renderInput('yearsAtCompany', 'Years at Company', 'number', null, <Briefcase size={16} />)}
        {renderInput('trainingTimesLastYear', 'Training Times Last Year', 'number', null, <TrendingUp size={16} />)}
      </div>
    </div>
  );

  const renderPage3 = () => (
    <div className="form-page">
      <div className="page-header">
        <Briefcase className="page-icon" />
        <h2>Job Information</h2>
        <p>Current role and department details</p>
      </div>
      <div className="form-grid">
        {renderInput('department', 'Department', 'select', ['Research & Development', 'Sales', 'Human Resources'], <Briefcase size={16} />)}
        {renderInput('jobRole', 'Job Role', 'select', ['Sales Executive', 'Research Scientist', 'Laboratory Technician', 'Manufacturing Director', 'Healthcare Representative'], <Briefcase size={16} />)}
        {renderInput('jobLevel', 'Job Level', 'select', ['1', '2', '3', '4', '5'], <TrendingUp size={16} />)}
        {renderInput('businessTravel', 'Business Travel', 'select', ['Travel_Rarely', 'Travel_Frequently', 'Non-Travel'], <MapPin size={16} />)}
        {renderInput('overTime', 'Over Time', 'select', ['Yes', 'No'], <Clock size={16} />)}
        {renderInput('yearsInCurrentRole', 'Years in Current Role', 'number', null, <Briefcase size={16} />)}
        {renderInput('yearsSinceLastPromotion', 'Years Since Last Promotion', 'number', null, <TrendingUp size={16} />)}
        {renderInput('yearsWithCurrManager', 'Years with Current Manager', 'number', null, <User size={16} />)}
      </div>
    </div>
  );

  const renderPage4 = () => (
    <div className="form-page">
      <div className="page-header">
        <DollarSign className="page-icon" />
        <h2>Compensation & Benefits</h2>
        <p>Salary and compensation details</p>
      </div>
      <div className="form-grid">
        {renderInput('monthlyIncome', 'Monthly Income', 'number', null, <DollarSign size={16} />)}
        {renderInput('hourlyRate', 'Hourly Rate', 'number', null, <DollarSign size={16} />)}
        {renderInput('dailyRate', 'Daily Rate', 'number', null, <DollarSign size={16} />)}
        {renderInput('monthlyRate', 'Monthly Rate', 'number', null, <DollarSign size={16} />)}
        {renderInput('percentSalaryHike', 'Percent Salary Hike', 'number', null, <TrendingUp size={16} />)}
        {renderInput('stockOptionLevel', 'Stock Option Level', 'select', ['0', '1', '2', '3'], <TrendingUp size={16} />)}
      </div>
    </div>
  );

  const renderPage5 = () => (
    <div className="form-page">
      <div className="page-header">
        <Star className="page-icon" />
        <h2>Satisfaction & Performance</h2>
        <p>Job satisfaction and performance metrics</p>
      </div>
      <div className="form-grid">
        {renderInput('jobSatisfaction', 'Job Satisfaction', 'select', ['Low', 'Medium', 'High', 'Very High'], <Star size={16} />)}
        {renderInput('environmentSatisfaction', 'Environment Satisfaction', 'select', ['Low', 'Medium', 'High', 'Very High'], <Star size={16} />)}
        {renderInput('workLifeBalance', 'Work Life Balance', 'select', ['Bad', 'Good', 'Better', 'Best'], <Star size={16} />)}
        {renderInput('relationshipSatisfaction', 'Relationship Satisfaction', 'select', ['Low', 'Medium', 'High', 'Very High'], <Heart size={16} />)}
        {renderInput('jobInvolvement', 'Job Involvement', 'select', ['Low', 'Medium', 'High', 'Very High'], <Briefcase size={16} />)}
        {renderInput('performanceRating', 'Performance Rating', 'select', ['Low', 'Good', 'Excellent', 'Outstanding'], <TrendingUp size={16} />)}
      </div>
    </div>
  );

  // Calculate progress percentage
  const progressPercentage = (currentPage / totalPages) * 100;

  if (loading) {
    return (
      <div className="employee-data-form">
        <div className="app-container">
          <div className="form-container" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
            <div>Loading...</div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="employee-data-form">
      <div className="app-container">
        <div className="form-container">
          <div className="form-header">
            <div className="header-top">
              <div className="logo">
                <Users className="logo-icon" />
                <span>AttentionIQ</span>
              </div>
              <button onClick={handleLogout} className="logout-button" title="Logout">
                <LogOut size={20} />
                Logout
              </button>
            </div>
            <h1>Employee Data Collection</h1>
            <p>Welcome, {employeeInfo.firstName} {employeeInfo.lastName} ({employeeInfo.employeeId})</p>
          </div>


          <div className="page-indicator">
            Page {currentPage} of {totalPages}
          </div>

          <form onSubmit={handleSubmit}>
            {currentPage === 1 && renderPage1()}
            {currentPage === 2 && renderPage2()}
            {currentPage === 3 && renderPage3()}
            {currentPage === 4 && renderPage4()}
            {currentPage === 5 && renderPage5()}

            <div className="form-actions">
              {currentPage > 1 && (
                <button type="button" onClick={() => setCurrentPage(currentPage - 1)} className="btn btn-secondary">Previous</button>
              )}
              {currentPage < totalPages ? (
                <button type="button" onClick={() => setCurrentPage(currentPage + 1)} className="btn btn-primary">
                  Next <ChevronRight size={20} />
                </button>
              ) : (
                <button type="submit" className="btn btn-primary">Submit Data</button>
              )}
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default EmployeeDataForm;