import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import '../styles/LoginPage.css';

const API_BASE = "http://localhost:8000"; 

const HR_CREDENTIALS = [
  { username: 'hr_admin', password: 'admin123', name: 'HR Administrator', role: 'admin' },
  { username: 'hr_manager', password: 'manager123', name: 'HR Manager', role: 'manager' },
  { username: 'hr_user', password: 'hr123', name: 'HR User', role: 'user' }
];

const DEPARTMENTS = ['Research & Development', 'Sales', 'Human Resources'];
const JOB_POSITIONS = ['Sales Executive', 'Research Scientist', 'Laboratory Technician', 'Manufacturing Director', 'Healthcare Representative'];

const LoginPage = () => {
  const [loginMode, setLoginMode] = useState('employee'); 
  const [showRegisterForm, setShowRegisterForm] = useState(false);
  const [formData, setFormData] = useState({
    employeeId: '', username: '', password: '', firstName: '',
    lastName: '', email: '', phone: '', department: '', position: ''
  });
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  // If already logged in, push them directly to their dashboard
  useEffect(() => {
    const employee = sessionStorage.getItem('employee');
    const hrUser = sessionStorage.getItem('hrUser');
    if (employee) navigate('/form');
    else if (hrUser) navigate('/hr-dashboard');
  }, [navigate]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    setErrorMessage('');
    setSuccessMessage('');
  };

  const handleLogin = async () => {
    if (loginMode === 'employee' && !formData.employeeId) {
        setErrorMessage('Enter ID'); return;
    }
    if (loginMode === 'hr' && !formData.username) {
        setErrorMessage('Enter Username'); return;
    }
    if (!formData.password) {
        setErrorMessage('Enter Password'); return;
    }

    setIsLoading(true);
    try {
      if (loginMode === 'employee') {
        const res = await axios.post(`${API_BASE}/login`, {
          employeeId: formData.employeeId.trim(),
          password: formData.password
        });
        
        sessionStorage.setItem('employee', JSON.stringify(res.data));
        navigate('/form');
      } else {
        const hrUser = HR_CREDENTIALS.find(u => u.username === formData.username && u.password === formData.password);
        if (hrUser) {
          sessionStorage.setItem('hrUser', JSON.stringify(hrUser));
          navigate('/hr-dashboard');
        } else {
          setErrorMessage('Wrong credentials');
        }
      }
    } catch (error) {
      setErrorMessage('Login failed. Check details.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegister = async () => {
    if(!formData.employeeId || !formData.password || !formData.email) {
        setErrorMessage("Please fill all fields");
        return;
    }

    setIsLoading(true);
    try {
      await axios.post(`${API_BASE}/register`, formData);
      setSuccessMessage('Registered! Please login.');
      setShowRegisterForm(false);
    } catch (error) {
      setErrorMessage('Error registering.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="main-container">
      <div className="login-box">
        <h1>RetentionIQ System</h1>
        
        {!showRegisterForm && (
            <div className="tabs">
                <button 
                    onClick={() => setLoginMode('employee')} 
                    className={loginMode === 'employee' ? 'active-btn' : ''}
                >
                    Employee Login
                </button>
                <button 
                    onClick={() => setLoginMode('hr')}
                    className={loginMode === 'hr' ? 'active-btn' : ''}
                >
                    HR Login
                </button>
            </div>
        )}

        <h3>{showRegisterForm ? 'Register New User' : 'Please Sign In'}</h3>

        {errorMessage && <p className="error-msg">{errorMessage}</p>}
        {successMessage && <p className="success-msg">{successMessage}</p>}

        <div className="form-content">
            {showRegisterForm ? (
                // REGISTER FORM
                <div>
                    <label>First Name:</label><br/>
                    <input type="text" name="firstName" onChange={handleInputChange} /><br/>
                    <label>Last Name:</label><br/>
                    <input type="text" name="lastName" onChange={handleInputChange} /><br/>
                    <label>Email:</label><br/>
                    <input type="email" name="email" onChange={handleInputChange} /><br/>
                    <label>Phone:</label><br/>
                    <input type="text" name="phone" onChange={handleInputChange} /><br/>
                    <label>Employee ID:</label><br/>
                    <input type="text" name="employeeId" onChange={handleInputChange} /><br/>
                    <label>Department:</label><br/>
                    <select name="department" onChange={handleInputChange}>
                        <option value="">Select...</option>
                        {DEPARTMENTS.map(d => <option key={d} value={d}>{d}</option>)}
                    </select><br/>
                    <label>Position:</label><br/>
                    <select name="position" onChange={handleInputChange}>
                        <option value="">Select...</option>
                        {JOB_POSITIONS.map(p => <option key={p} value={p}>{p}</option>)}
                    </select><br/>
                    <label>Password:</label><br/>
                    <input type="password" name="password" onChange={handleInputChange} /><br/><br/>
                    <button onClick={handleRegister} disabled={isLoading}>
                        {isLoading ? 'Wait...' : 'Register'}
                    </button>
                    <br/><br/>
                    <button onClick={() => setShowRegisterForm(false)}>Cancel</button>
                </div>
            ) : (
                // LOGIN FORM
                <div>
                    {loginMode === 'employee' ? (
                        <>
                            <label>Employee ID:</label><br/>
                            <input type="text" name="employeeId" onChange={handleInputChange} />
                        </>
                    ) : (
                        <>
                            <label>Username:</label><br/>
                            <input type="text" name="username" onChange={handleInputChange} />
                        </>
                    )}
                    <br/>
                    <label>Password:</label><br/>
                    <input type="password" name="password" onChange={handleInputChange} />
                    <br/><br/>
                    <button onClick={handleLogin} disabled={isLoading} className="main-btn">
                        {isLoading ? 'Logging in...' : 'Login'}
                    </button>

                    {loginMode === 'employee' && (
                        <div style={{marginTop: '20px'}}>
                            <p>Don't have an account?</p>
                            <button onClick={() => setShowRegisterForm(true)}>Register Here</button>
                        </div>
                    )}
                </div>
            )}
        </div>
      </div>
    </div>
  );
};

export default LoginPage;