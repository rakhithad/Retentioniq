import React, { useState, useEffect } from 'react';
import { Users, TrendingUp, AlertTriangle, BarChart3, Building, Shield, Target, LogOut, Brain, User } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import '../styles/HRDashboard.css';
import EmployeeDetailModal from './EmployeeDetailModal';

const API_BASE = 'http://localhost:8000';

const HRDashboard = () => {
  const [employees, setEmployees] = useState([]);
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [currentView, setCurrentView] = useState('dashboard');
  const [hrUser, setHrUser] = useState(null);
  
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedEmployeeId, setSelectedEmployeeId] = useState(null);
  
  const [filters, setFilters] = useState({ riskLevel: '', department: '' });
  const navigate = useNavigate();

  useEffect(() => {
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
    return <div style={{ padding: '50px', textAlign: 'center' }}>Loading dashboard data...</div>;
  }

  return (
    <div className="dashboard-container">
      {/* Header */}
      <div className="dashboard-header" style={{ borderBottom: '1px solid #ccc', padding: '10px 20px', display: 'flex', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <Users size={24} />
          <h2>RetentionIQ Dashboard</h2>
        </div>
        <div style={{ display: 'flex', gap: '20px', alignItems: 'center' }}>
          <button onClick={() => setCurrentView('dashboard')} disabled={currentView === 'dashboard'}>Overview</button>
          <button onClick={() => setCurrentView('employees')} disabled={currentView === 'employees'}>Employee List</button>
          <span>Welcome, {hrUser?.name}</span>
          <button onClick={handleLogout}><LogOut size={16} /></button>
        </div>
      </div>

      <div className="dashboard-content" style={{ padding: '20px' }}>
        {currentView === 'dashboard' && analytics && (
          <div className="dashboard-section">
            {/* Key Metrics */}
            <div style={{ display: 'flex', gap: '20px', marginBottom: '30px' }}>
              <div style={{ border: '1px solid #ccc', padding: '15px', borderRadius: '8px', flex: 1 }}>
                <h3>Total Employees</h3>
                <p style={{ fontSize: '24px', fontWeight: 'bold' }}>{analytics.totalEmployees}</p>
              </div>
              <div style={{ border: '1px solid #ccc', padding: '15px', borderRadius: '8px', flex: 1, color: 'red' }}>
                <h3>High Risk</h3>
                <p style={{ fontSize: '24px', fontWeight: 'bold' }}>{analytics.highRiskCount}</p>
              </div>
              <div style={{ border: '1px solid #ccc', padding: '15px', borderRadius: '8px', flex: 1, color: 'orange' }}>
                <h3>Medium Risk</h3>
                <p style={{ fontSize: '24px', fontWeight: 'bold' }}>{analytics.mediumRiskCount}</p>
              </div>
              <div style={{ border: '1px solid #ccc', padding: '15px', borderRadius: '8px', flex: 1, color: 'purple' }}>
                <h3>Attrition Rate</h3>
                <p style={{ fontSize: '24px', fontWeight: 'bold' }}>{analytics.attritionRate}%</p>
              </div>
            </div>

            {/* Risk Factors & Charts Area */}
            <div style={{ display: 'flex', gap: '20px' }}>
              <div style={{ flex: 1, border: '1px solid #ccc', padding: '15px', borderRadius: '8px' }}>
                <Building size={20} /> <h3>Department Risk Analysis</h3>
                {Object.entries(analytics.departmentRisk || {}).map(([dept, risk]) => (
                  <div key={dept} style={{ marginBottom: '10px' }}>
                    <span>{dept}</span>
                    <div style={{ background: '#eee', height: '10px', width: '100%', borderRadius: '5px' }}>
                      <div style={{ background: 'red', height: '100%', width: `${Math.min(risk, 100)}%`, borderRadius: '5px' }}></div>
                    </div>
                    <small>{risk.toFixed(1)}%</small>
                  </div>
                ))}
              </div>

              <div style={{ flex: 1, border: '1px solid #ccc', padding: '15px', borderRadius: '8px' }}>
                <BarChart3 size={20} /> <h3>Top Risk Factors</h3>
                {analytics.topRiskFactors.map((factor, index) => (
                  <div key={index} style={{ marginBottom: '10px', borderBottom: '1px solid #eee', paddingBottom: '5px' }}>
                    <strong>{factor.factor} ({(factor.impact * 100).toFixed(0)}%)</strong>
                    <p style={{ margin: '5px 0', fontSize: '12px', color: '#555' }}>{factor.description}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {currentView === 'employees' && (
          <div className="employee-section">
            <div style={{ marginBottom: '20px', padding: '15px', background: '#f9f9f9', borderRadius: '8px' }}>
              <strong>Filters: </strong>
              <select onChange={(e) => setFilters(prev => ({...prev, riskLevel: e.target.value}))} style={{ margin: '0 10px' }}>
                <option value="">All Risk Levels</option>
                <option value="High">High Risk</option>
                <option value="Medium">Medium Risk</option>
                <option value="Low">Low Risk</option>
              </select>
              
              <select onChange={(e) => setFilters(prev => ({...prev, department: e.target.value}))}>
                <option value="">All Departments</option>
                {uniqueDepartments.map(dept => <option key={dept} value={dept}>{dept}</option>)}
              </select>
            </div>

            <table style={{ width: '100%', textAlign: 'left', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ background: '#eee' }}>
                  <th style={{ padding: '10px' }}>Employee</th>
                  <th style={{ padding: '10px' }}>Role / Dept</th>
                  <th style={{ padding: '10px' }}>Risk Level</th>
                  <th style={{ padding: '10px' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredEmployees.map((employee) => (
                  <tr key={employee.employeeId} style={{ borderBottom: '1px solid #eee' }}>
                    <td style={{ padding: '10px' }}>
                      <strong>{employee.firstName} {employee.lastName}</strong><br/>
                      <small>ID: {employee.employeeId}</small>
                    </td>
                    <td style={{ padding: '10px' }}>{employee.jobRole} <br/> <small>{employee.department}</small></td>
                    <td style={{ padding: '10px', color: getRiskClass(employee.riskLevel) === 'high' ? 'red' : 'inherit' }}>
                      {employee.riskLevel} ({(employee.attritionProbability * 100).toFixed(1)}%)
                    </td>
                    <td style={{ padding: '10px' }}>
                      <button onClick={() => handleEmployeeClick(employee.employeeId)} style={{ cursor: 'pointer', padding: '5px 10px' }}>
                        <Brain size={16} /> Analyze
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <EmployeeDetailModal
        employeeId={selectedEmployeeId}
        isOpen={showDetailModal}
        onClose={handleCloseModal}
      />
    </div>
  );
};

export default HRDashboard;