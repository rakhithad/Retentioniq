import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Users, ArrowRight, User, Shield, Eye, EyeOff, UserPlus } from 'lucide-react';
import axios from 'axios';
import '../styles/LoginPage.css';

const API_BASE = "http://localhost:8000"; // FastAPI backend

// Hard-coded HR credentials
const HR_CREDENTIALS = [
  { username: 'hr_admin', password: 'admin123', name: 'HR Administrator', role: 'admin' },
  { username: 'hr_manager', password: 'manager123', name: 'HR Manager', role: 'manager' },
  { username: 'hr_user', password: 'hr123', name: 'HR User', role: 'user' }
];

// Department and Position options
const DEPARTMENTS = [
  'Research & Development',
  'Sales',
  'Human Resources'
];

const JOB_POSITIONS = [
  'Sales Executive',
  'Research Scientist',
  'Laboratory Technician',
  'Manufacturing Director',
  'Healthcare Representative'
];

const LoginPage = () => {
  const [loginMode, setLoginMode] = useState('employee'); // 'employee' or 'hr'
  const [showPassword, setShowPassword] = useState(false);
  const [showRegisterForm, setShowRegisterForm] = useState(false);
  const [formData, setFormData] = useState({
    employeeId: '',
    username: '',
    password: '',
    rememberMe: false,
    // Registration fields
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    department: '',
    position: ''
  });
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  // Check if user is already logged in
  useEffect(() => {
    const employee = sessionStorage.getItem('employee');
    const hrUser = sessionStorage.getItem('hrUser');
    
    if (employee) {
      navigate('/form');
    } else if (hrUser) {
      navigate('/hr-dashboard');
    }
  }, [navigate]);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value
    });
    // Clear error message when user starts typing
    if (errorMessage) setErrorMessage('');
    if (successMessage) setSuccessMessage('');
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      if (showRegisterForm) {
        handleRegister();
      } else {
        handleLogin();
      }
    }
  };

  const validateLoginForm = () => {
    if (loginMode === 'employee') {
      if (!formData.employeeId.trim()) {
        setErrorMessage('Please enter your Employee ID');
        return false;
      }
      if (!formData.password) {
        setErrorMessage('Please enter your password');
        return false;
      }
    } else {
      if (!formData.username.trim()) {
        setErrorMessage('Please enter your username');
        return false;
      }
      if (!formData.password) {
        setErrorMessage('Please enter your password');
        return false;
      }
    }
    return true;
  };

  const validateRegisterForm = () => {
    const requiredFields = ['firstName', 'lastName', 'email', 'phone', 'employeeId', 'department', 'position', 'password'];
    
    for (let field of requiredFields) {
      if (!formData[field] || !formData[field].toString().trim()) {
        setErrorMessage(`Please fill in ${field.replace(/([A-Z])/g, ' $1').toLowerCase()}`);
        return false;
      }
    }
    
    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      setErrorMessage('Please enter a valid email address');
      return false;
    }
    
    // Password validation
    if (formData.password.length < 6) {
      setErrorMessage('Password must be at least 6 characters long');
      return false;
    }
    
    return true;
  };

  const handleLogin = async () => {
    if (!validateLoginForm()) return;
    
    setErrorMessage('');
    setIsLoading(true);
    
    try {
      if (loginMode === 'employee') {
        // Employee login via API
        const res = await axios.post(`${API_BASE}/login`, {
          employeeId: formData.employeeId.trim(),
          password: formData.password
        });
        
        // Store employee data in sessionStorage
        const employeeData = {
          employeeId: res.data.employeeId,
          firstName: res.data.firstName || 'Employee',
          lastName: res.data.lastName || '',
          email: res.data.email || '',
          department: res.data.department || '',
          position: res.data.position || '',
          loginTime: new Date().toISOString()
        };
        sessionStorage.setItem('employee', JSON.stringify(employeeData));
        
        // Login successful - navigate to form with employee data
        navigate('/form');
      } else {
        // HR login - hard coded credentials
        const hrUser = HR_CREDENTIALS.find(
          user => user.username === formData.username.trim() && user.password === formData.password
        );

        if (hrUser) {
          // Store HR data in sessionStorage
          const hrData = {
            username: hrUser.username,
            name: hrUser.name,
            role: hrUser.role,
            userType: 'hr',
            loginTime: new Date().toISOString()
          };
          sessionStorage.setItem('hrUser', JSON.stringify(hrData));
          
          // Login successful - navigate to HR dashboard
          navigate('/hr-dashboard');
        } else {
          setErrorMessage('Invalid username or password');
        }
      }
    } catch (error) {
      console.error('Login error:', error);
      if (error.response) {
        switch (error.response.status) {
          case 401:
            setErrorMessage('Invalid credentials. Please check your Employee ID and password.');
            break;
          case 404:
            setErrorMessage('Employee not found. Please check your Employee ID or register first.');
            break;
          case 500:
            setErrorMessage('Server error. Please try again later.');
            break;
          default:
            setErrorMessage(error.response.data?.detail || 'Login failed. Please try again.');
        }
      } else if (error.request) {
        setErrorMessage('Cannot connect to server. Please check your internet connection.');
      } else {
        setErrorMessage('An unexpected error occurred. Please try again.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegister = async () => {
    if (!validateRegisterForm()) return;
    
    setErrorMessage('');
    setSuccessMessage('');
    setIsLoading(true);
    
    try {
      const registrationData = {
        firstName: formData.firstName.trim(),
        lastName: formData.lastName.trim(),
        email: formData.email.trim(),
        phone: formData.phone.trim(),
        employeeId: formData.employeeId.trim(),
        department: formData.department,
        position: formData.position,
        password: formData.password
      };

      await axios.post(`${API_BASE}/register`, registrationData);
      
      setSuccessMessage('Registration successful! You can now login.');
      setShowRegisterForm(false);
      
      // Clear form data except for employeeId and password for easy login
      setFormData({
        ...formData,
        firstName: '',
        lastName: '',
        email: '',
        phone: '',
        department: '',
        position: ''
      });
      
    } catch (error) {
      console.error('Registration error:', error);
      if (error.response) {
        switch (error.response.status) {
          case 409:
            setErrorMessage('Employee ID already exists. Please choose a different ID.');
            break;
          case 422:
            setErrorMessage('Invalid data provided. Please check all fields.');
            break;
          case 500:
            setErrorMessage('Server error. Please try again later.');
            break;
          default:
            setErrorMessage(error.response.data?.detail || 'Registration failed. Please try again.');
        }
      } else if (error.request) {
        setErrorMessage('Cannot connect to server. Please check your internet connection.');
      } else {
        setErrorMessage('An unexpected error occurred. Please try again.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleModeSwitch = (mode) => {
    setLoginMode(mode);
    setFormData({
      employeeId: '',
      username: '',
      password: '',
      rememberMe: formData.rememberMe,
      firstName: '',
      lastName: '',
      email: '',
      phone: '',
      department: '',
      position: ''
    });
    setErrorMessage('');
    setSuccessMessage('');
    setShowRegisterForm(false);
  };

  const toggleRegisterForm = () => {
    setShowRegisterForm(!showRegisterForm);
    setErrorMessage('');
    setSuccessMessage('');
    // Clear registration fields when switching
    if (!showRegisterForm) {
      setFormData({
        ...formData,
        firstName: '',
        lastName: '',
        email: '',
        phone: '',
        department: '',
        position: ''
      });
    }
  };

  return (
    <div className="login-container">
      <div className="background-gradient" />
      <div className="background-radial" />
      
      <div className="header">
        <div className="header-content">
          <Users size={32} className="header-icon" />
          <span className="header-title">RetentionIQ</span>
        </div>
      </div>

      <div className="login-card">
        <div className="card-header">
          <h1 className="card-title">
            {showRegisterForm ? 'Employee Registration' : 'Welcome Back'}
          </h1>
          <p className="card-subtitle">
            {showRegisterForm 
              ? 'Create your RetentionIQ account' 
              : 'Access your RetentionIQ dashboard'
            }
          </p>
        </div>

        {!showRegisterForm && (
          <div className="toggle-container">
            <button
              className={`toggle-button ${loginMode === 'employee' ? 'active' : 'inactive'}`}
              onClick={() => handleModeSwitch('employee')}
              disabled={isLoading}
            >
              <User size={20} /> Employee
            </button>
            <button
              className={`toggle-button ${loginMode === 'hr' ? 'active' : 'inactive'}`}
              onClick={() => handleModeSwitch('hr')}
              disabled={isLoading}
            >
              <Shield size={20} /> HR Manager
            </button>
          </div>
        )}

        <div className="loginform-container">
          {errorMessage && (
            <div style={{
              background: '#fef2f2',
              border: '1px solid #fecaca',
              borderRadius: '0.5rem',
              padding: '0.75rem',
              marginBottom: '1rem'
            }}>
              <p style={{
                color: '#dc2626',
                fontSize: '0.875rem',
                margin: '0',
                fontWeight: '500'
              }}>
                {errorMessage}
              </p>
            </div>
          )}

          {successMessage && (
            <div style={{
              background: '#f0fdf4',
              border: '1px solid #bbf7d0',
              borderRadius: '0.5rem',
              padding: '0.75rem',
              marginBottom: '1rem'
            }}>
              <p style={{
                color: '#16a34a',
                fontSize: '0.875rem',
                margin: '0',
                fontWeight: '500'
              }}>
                {successMessage}
              </p>
            </div>
          )}
          
          {/* Show HR credentials hint when HR mode is selected */}
          {loginMode === 'hr' && !showRegisterForm && (
            <div style={{
              background: '#eff6ff',
              border: '1px solid #bfdbfe',
              borderRadius: '0.5rem',
              padding: '0.75rem',
              marginBottom: '1rem',
              fontSize: '0.875rem'
            }}>
              <strong style={{ color: '#1e40af' }}>Demo HR Credentials:</strong><br />
              <div style={{ marginTop: '0.5rem', color: '#1f2937' }}>
                • <strong>Admin:</strong> hr_admin / admin123<br />
                • <strong>Manager:</strong> hr_manager / manager123<br />
                • <strong>User:</strong> hr_user / hr123
              </div>
            </div>
          )}

          {showRegisterForm ? (
            // Registration Form
            <>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div className="input-group">
                  <label className="input-label">First Name</label>
                  <input
                    type="text"
                    name="firstName"
                    value={formData.firstName}
                    onChange={handleInputChange}
                    onKeyPress={handleKeyPress}
                    placeholder="Enter first name"
                    className="input-field"
                    disabled={isLoading}
                    autoComplete="given-name"
                  />
                </div>
                <div className="input-group">
                  <label className="input-label">Last Name</label>
                  <input
                    type="text"
                    name="lastName"
                    value={formData.lastName}
                    onChange={handleInputChange}
                    onKeyPress={handleKeyPress}
                    placeholder="Enter last name"
                    className="input-field"
                    disabled={isLoading}
                    autoComplete="family-name"
                  />
                </div>
              </div>

              <div className="input-group">
                <label className="input-label">Email</label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  onKeyPress={handleKeyPress}
                  placeholder="Enter email address"
                  className="input-field"
                  disabled={isLoading}
                  autoComplete="email"
                />
              </div>

              <div className="input-group">
                <label className="input-label">Phone</label>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  onKeyPress={handleKeyPress}
                  placeholder="Enter phone number"
                  className="input-field"
                  disabled={isLoading}
                  autoComplete="tel"
                />
              </div>

              <div className="input-group">
                <label className="input-label">Employee ID</label>
                <input
                  type="text"
                  name="employeeId"
                  value={formData.employeeId}
                  onChange={handleInputChange}
                  onKeyPress={handleKeyPress}
                  placeholder="Enter employee ID"
                  className="input-field"
                  disabled={isLoading}
                  autoComplete="username"
                />
              </div>

              <div className="input-group">
                <label className="input-label">Department</label>
                <select
                  name="department"
                  value={formData.department}
                  onChange={handleInputChange}
                  className="input-field"
                  disabled={isLoading}
                  style={{
                    backgroundColor: 'white',
                    backgroundImage: 'url("data:image/svg+xml;charset=US-ASCII,<svg xmlns=\'http://www.w3.org/2000/svg\' viewBox=\'0 0 4 5\'><path fill=\'%23666\' d=\'M2 0L0 2h4zm0 5L0 3h4z\'/></svg>")',
                    backgroundRepeat: 'no-repeat',
                    backgroundPosition: 'right 12px center',
                    backgroundSize: '12px',
                    paddingRight: '40px'
                  }}
                >
                  <option value="">Select Department</option>
                  {DEPARTMENTS.map(dept => (
                    <option key={dept} value={dept}>{dept}</option>
                  ))}
                </select>
              </div>

              <div className="input-group">
                <label className="input-label">Job Position</label>
                <select
                  name="position"
                  value={formData.position}
                  onChange={handleInputChange}
                  className="input-field"
                  disabled={isLoading}
                  style={{
                    backgroundColor: 'white',
                    backgroundImage: 'url("data:image/svg+xml;charset=US-ASCII,<svg xmlns=\'http://www.w3.org/2000/svg\' viewBox=\'0 0 4 5\'><path fill=\'%23666\' d=\'M2 0L0 2h4zm0 5L0 3h4z\'/></svg>")',
                    backgroundRepeat: 'no-repeat',
                    backgroundPosition: 'right 12px center',
                    backgroundSize: '12px',
                    paddingRight: '40px'
                  }}
                >
                  <option value="">Select Job Position</option>
                  {JOB_POSITIONS.map(position => (
                    <option key={position} value={position}>{position}</option>
                  ))}
                </select>
              </div>

              <div className="input-group">
                <label className="input-label">Password</label>
                <div className="password-container">
                  <input
                    type={showPassword ? "text" : "password"}
                    name="password"
                    value={formData.password}
                    onChange={handleInputChange}
                    onKeyPress={handleKeyPress}
                    placeholder="Create password (min 6 characters)"
                    className="password-input"
                    disabled={isLoading}
                    autoComplete="new-password"
                  />
                  <button
                    type="button"
                    className="password-toggle"
                    onClick={() => setShowPassword(!showPassword)}
                    disabled={isLoading}
                    tabIndex="-1"
                  >
                    {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                </div>
              </div>

              <button
                onClick={handleRegister}
                className="login-button"
                disabled={isLoading}
                style={{
                  opacity: isLoading ? 0.7 : 1,
                  cursor: isLoading ? 'not-allowed' : 'pointer'
                }}
              >
                {isLoading ? (
                  <>
                    <div style={{
                      width: '20px',
                      height: '20px',
                      border: '2px solid transparent',
                      borderTop: '2px solid currentColor',
                      borderRadius: '50%',
                      animation: 'spin 1s linear infinite'
                    }} />
                    Registering...
                  </>
                ) : (
                  <>
                    Register <UserPlus size={20} />
                  </>
                )}
              </button>

              <div className="registration-section">
                <p className="registration-text">Already have an account?</p>
                <button
                  onClick={toggleRegisterForm}
                  className="register-button"
                  disabled={isLoading}
                  style={{ background: 'transparent', color: '#4f46e5' }}
                >
                  <User size={20} /> Back to Login
                </button>
              </div>
            </>
          ) : (
            // Login Form
            <>
              {loginMode === 'employee' ? (
                <div className="input-group">
                  <label className="input-label">Employee ID</label>
                  <input
                    type="text"
                    name="employeeId"
                    value={formData.employeeId}
                    onChange={handleInputChange}
                    onKeyPress={handleKeyPress}
                    placeholder="Enter your employee ID"
                    className="input-field"
                    disabled={isLoading}
                    autoComplete="username"
                  />
                </div>
              ) : (
                <div className="input-group">
                  <label className="input-label">Username</label>
                  <input
                    type="text"
                    name="username"
                    value={formData.username}
                    onChange={handleInputChange}
                    onKeyPress={handleKeyPress}
                    placeholder="Enter your username"
                    className="input-field"
                    disabled={isLoading}
                    autoComplete="username"
                  />
                </div>
              )}

              <div className="input-group">
                <label className="input-label">Password</label>
                <div className="password-container">
                  <input
                    type={showPassword ? "text" : "password"}
                    name="password"
                    value={formData.password}
                    onChange={handleInputChange}
                    onKeyPress={handleKeyPress}
                    placeholder="Enter your password"
                    className="password-input"
                    disabled={isLoading}
                    autoComplete="current-password"
                  />
                  <button
                    type="button"
                    className="password-toggle"
                    onClick={() => setShowPassword(!showPassword)}
                    disabled={isLoading}
                    tabIndex="-1"
                  >
                    {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                </div>
              </div>

              <div className="form-options">
                <label className="remember-me">
                  <input
                    type="checkbox"
                    name="rememberMe"
                    checked={formData.rememberMe}
                    onChange={handleInputChange}
                    className="checkbox"
                    disabled={isLoading}
                  />
                  <span className="remember-text">Remember me</span>
                </label>
                <a href="#" className="forgot-password">
                  Forgot password?
                </a>
              </div>

              <button
                onClick={handleLogin}
                className="login-button"
                disabled={isLoading}
                style={{
                  opacity: isLoading ? 0.7 : 1,
                  cursor: isLoading ? 'not-allowed' : 'pointer'
                }}
              >
                {isLoading ? (
                  <>
                    <div style={{
                      width: '20px',
                      height: '20px',
                      border: '2px solid transparent',
                      borderTop: '2px solid currentColor',
                      borderRadius: '50%',
                      animation: 'spin 1s linear infinite'
                    }} />
                    Signing In...
                  </>
                ) : (
                  <>
                    Sign In <ArrowRight size={20} />
                  </>
                )}
              </button>

              {loginMode === 'employee' && (
                <div className="registration-section">
                  <p className="registration-text">New employee?</p>
                  <button
                    onClick={toggleRegisterForm}
                    className="register-button"
                    disabled={isLoading}
                  >
                    <UserPlus size={20} /> Register New Employee
                  </button>
                </div>
              )}
            </>
          )}
        </div>

        <div className="card-footer">
          <p className="footer-text">
            © 2026 RetentionIQ. Secure employee management system.
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;