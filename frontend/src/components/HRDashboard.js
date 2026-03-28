import React, { useState, useEffect } from 'react';
import { Users, TrendingUp, AlertTriangle, BarChart3, PieChart, Activity, User, Building, Shield, Target, LogOut, Eye, Brain } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import '../styles/HRDashboard.css';

// Import the detailed analysis modal component
import EmployeeDetailModal from './EmployeeDetailModal';

const API_BASE = 'http://localhost:8000';

const HRDashboard = () => {
  const [employees, setEmployees] = useState([]);
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [currentView, setCurrentView] = useState('dashboard');
  const [hrUser, setHrUser] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedEmployeeId, setSelectedEmployeeId] = useState(null);
  const [filters, setFilters] = useState({
    riskLevel: '',
    department: ''
  });
  const navigate = useNavigate();

  useEffect(() => {
    // Check if HR user is logged in
    const storedHrUser = sessionStorage.getItem('hrUser');
    if (!storedHrUser) {
      navigate('/login');
      return;
    }
    setHrUser(JSON.parse(storedHrUser));
    fetchDashboardData();
  }, [navigate]);

  const fetchDashboardData = async () => {
    try {
      const [employeesRes, analyticsRes] = await Promise.all([
        fetch(`${API_BASE}/dashboard/employees`),
        fetch(`${API_BASE}/dashboard/analytics`)
      ]);
      
      const employeesData = await employeesRes.json();
      const analyticsData = await analyticsRes.json();
      
      setEmployees(employeesData.employees || []);
      setAnalytics(analyticsData);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      setLoading(false);
    }
  };

  const handleLogout = () => {
    sessionStorage.removeItem('hrUser');
    navigate('/login');
  };

  const handleEmployeeClick = (employeeId) => {
    setSelectedEmployeeId(employeeId);
    setShowDetailModal(true);
  };

  const handleCloseModal = () => {
    setShowDetailModal(false);
    setSelectedEmployeeId(null);
  };

  const getRiskClass = (riskLevel) => {
    switch (riskLevel?.toLowerCase()) {
      case 'high': return 'high';
      case 'medium': return 'medium';
      case 'low': return 'low';
      default: return 'low';
    }
  };

  const getProbabilityClass = (probability) => {
    if (probability >= 0.7) return 'high';
    if (probability >= 0.4) return 'medium';
    return 'low';
  };

  
  const filteredEmployees = employees.filter(employee => {
    const riskMatch = !filters.riskLevel || employee.riskLevel === filters.riskLevel;
    const deptMatch = !filters.department || employee.department === filters.department;
    return riskMatch && deptMatch;
  });

  
  const uniqueDepartments = [...new Set(employees.map(emp => emp.department))];

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-content">
          <div className="loading-spinner"></div>
          <p className="loading-text">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="dashboard-container">
      {/* Header */}
      <div className="dashboard-header">
        <div className="header-container">
          <div className="header-content">
            <div className="header-brand">
              <div className="header-brand-icon">
                <div className="brand-icon-container">
                  <Users className="brand-icon" size={24} />
                </div>
                <div className="brand-info">
                  <h1>RetentionIQ Dashboard</h1>
                  <p>Employee Attrition Risk Management</p>
                </div>
              </div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <div className="nav-buttons">
                <button
                  onClick={() => setCurrentView('dashboard')}
                  className={`nav-button ${currentView === 'dashboard' ? 'active' : 'inactive'}`}
                >
                  <BarChart3 size={16} />
                  Dashboard
                </button>
                <button
                  onClick={() => setCurrentView('employees')}
                  className={`nav-button ${currentView === 'employees' ? 'active' : 'inactive'}`}
                >
                  <Users size={16} />
                  Employee List
                </button>
              </div>
              {hrUser && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginLeft: '1rem', paddingLeft: '1rem', borderLeft: '1px solid #e5e7eb' }}>
                  <span style={{ fontSize: '0.875rem', color: '#6b7280' }}>Welcome, {hrUser.name}</span>
                  <button
                    onClick={handleLogout}
                    className="nav-button inactive"
                    style={{ padding: '0.5rem' }}
                    title="Logout"
                  >
                    <LogOut size={16} />
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="dashboard-content">
        {currentView === 'dashboard' && analytics && (
          <div className="dashboard-section">
            {/* Key Metrics */}
            <div className="metrics-grid">
              <div className="metric-card metric-blue">
                <div className="metric-header">
                  <div className="metric-info">
                    <h3>Total Employees</h3>
                    <p>{analytics.totalEmployees}</p>
                  </div>
                  <div className="metric-icon">
                    <Users size={24} />
                  </div>
                </div>
              </div>

              <div className="metric-card metric-red">
                <div className="metric-header">
                  <div className="metric-info">
                    <h3>High Risk</h3>
                    <p>{analytics.highRiskCount}</p>
                  </div>
                  <div className="metric-icon">
                    <AlertTriangle size={24} />
                  </div>
                </div>
              </div>

              <div className="metric-card metric-yellow">
                <div className="metric-header">
                  <div className="metric-info">
                    <h3>Medium Risk</h3>
                    <p>{analytics.mediumRiskCount}</p>
                  </div>
                  <div className="metric-icon">
                    <Shield size={24} />
                  </div>
                </div>
              </div>

              <div className="metric-card metric-purple">
                <div className="metric-header">
                  <div className="metric-info">
                    <h3>Attrition Rate</h3>
                    <p>{analytics.attritionRate}%</p>
                  </div>
                  <div className="metric-icon">
                    <TrendingUp size={24} />
                  </div>
                </div>
              </div>
            </div>

            {/* Charts Section */}
            <div className="charts-grid">
              {/* Department Risk */}
              <div className="chart-card">
                <div className="chart-header">
                  <Building className="chart-icon" size={20} />
                  <h3>Department Risk Analysis</h3>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  {Object.entries(analytics.departmentRisk || {}).map(([dept, risk]) => (
                    <div key={dept} className="progress-item">
                      <span className="progress-label">{dept}</span>
                      <div className="progress-info">
                        <div className="progress-bar">
                          <div
                            className="progress-fill red"
                            style={{ width: `${Math.min(risk, 100)}%` }}
                          ></div>
                        </div>
                        <span className="progress-value">
                          {risk.toFixed(1)}%
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Job Role Risk */}
              <div className="chart-card">
                <div className="chart-header">
                  <Target className="chart-icon" size={20} />
                  <h3>Job Role Risk Analysis</h3>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  {Object.entries(analytics.jobRoleRisk || {}).slice(0, 6).map(([role, risk]) => (
                    <div key={role} className="progress-item">
                      <span className="progress-label" style={{ fontSize: '0.75rem' }}>{role}</span>
                      <div className="progress-info">
                        <div className="progress-bar" style={{ width: '6rem' }}>
                          <div
                            className="progress-fill yellow"
                            style={{ width: `${Math.min(risk, 100)}%` }}
                          ></div>
                        </div>
                        <span className="progress-value">
                          {risk.toFixed(1)}%
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Risk Factors */}
            <div className="chart-card">
              <div className="chart-header">
                <BarChart3 className="chart-icon" size={20} />
                <h3>Top Risk Factors</h3>
              </div>
              <div className="risk-factors-grid">
                {analytics.topRiskFactors.map((factor, index) => (
                  <div key={index} className="risk-factor-card">
                    <div className="risk-factor-header">
                      <h4 className="risk-factor-title">{factor.factor}</h4>
                      <span className="risk-factor-impact">{(factor.impact * 100).toFixed(0)}%</span>
                    </div>
                    <p className="risk-factor-description">{factor.description}</p>
                    <div className="risk-factor-progress">
                      <div
                        className="risk-factor-fill"
                        style={{ width: `${factor.impact * 100}%` }}
                      ></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {currentView === 'employees' && (
          <div className="employee-section">
            {/* Filters */}
            <div className="filter-card">
              <div className="filter-controls">
                <div className="filter-group">
                  <span className="filter-label">Filter by Risk:</span>
                  <select 
                    className="filter-select"
                    value={filters.riskLevel}
                    onChange={(e) => setFilters(prev => ({...prev, riskLevel: e.target.value}))}
                  >
                    <option value="">All Levels</option>
                    <option value="High">High Risk</option>
                    <option value="Medium">Medium Risk</option>
                    <option value="Low">Low Risk</option>
                  </select>
                </div>
                <div className="filter-group">
                  <span className="filter-label">Department:</span>
                  <select 
                    className="filter-select"
                    value={filters.department}
                    onChange={(e) => setFilters(prev => ({...prev, department: e.target.value}))}
                  >
                    <option value="">All Departments</option>
                    {uniqueDepartments.map(dept => (
                      <option key={dept} value={dept}>{dept}</option>
                    ))}
                  </select>
                </div>
                <div className="filter-group">
                  <span className="filter-label">
                    Showing {filteredEmployees.length} of {employees.length} employees
                  </span>
                </div>
              </div>
            </div>

            {/* Employee Table */}
            <div className="employee-table-card">
              <div className="table-header">
                <h3>Employee Attrition Risk Assessment</h3>
                <p>Click on any employee to view detailed AI-powered analysis and recommendations</p>
              </div>
              <div className="table-container">
                <table className="employee-table">
                  <thead className="table-head">
                    <tr>
                      <th>Employee</th>
                      <th>Job Role</th>
                      <th>Department</th>
                      <th>Attrition Risk</th>
                      <th>Probability</th>
                      <th>Risk Level</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody className="table-body">
                    {filteredEmployees.map((employee) => (
                      <tr key={employee.employeeId} className="table-row-hover">
                        <td>
                          <div className="employee-info">
                            <div className="employee-avatar">
                              <div className="avatar-circle">
                                <User className="avatar-icon" size={20} />
                              </div>
                            </div>
                            <div className="employee-details">
                              <div className="name">
                                {employee.firstName} {employee.lastName}
                              </div>
                              <div className="id">
                                ID: {employee.employeeId}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td>
                          <span className="cell-text">{employee.jobRole}</span>
                        </td>
                        <td>
                          <span className="cell-text">{employee.department}</span>
                        </td>
                        <td>
                          <span className={`status-badge ${employee.predictedAttrition === 'Yes' ? 'yes' : 'no'}`}>
                            {employee.predictedAttrition}
                          </span>
                        </td>
                        <td>
                          <div className="probability-container">
                            <div className="probability-bar">
                              <div
                                className={`probability-fill ${getProbabilityClass(employee.attritionProbability)}`}
                                style={{ width: `${employee.attritionProbability * 100}%` }}
                              ></div>
                            </div>
                            <span className="probability-text">
                              {(employee.attritionProbability * 100).toFixed(1)}%
                            </span>
                          </div>
                        </td>
                        <td>
                          <span className={`risk-badge ${getRiskClass(employee.riskLevel)}`}>
                            <span className="risk-indicator"></span>
                            {employee.riskLevel} Risk
                          </span>
                        </td>
                        <td>
                          <div className="action-buttons">
                            <button
                              onClick={() => handleEmployeeClick(employee.employeeId)}
                              className="action-button primary"
                              title="View detailed analysis"
                            >
                              <Brain size={16} />
                              <span>Analyze</span>
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Employee Detail Modal */}
      <EmployeeDetailModal
        employeeId={selectedEmployeeId}
        isOpen={showDetailModal}
        onClose={handleCloseModal}
      />
    </div>
  );
};

export default HRDashboard;