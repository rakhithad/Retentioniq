import React from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/HomePage.css';

const HomePage = () => {
  const navigate = useNavigate();

  return (
    <div className="home-container" style={{ textAlign: 'center', padding: '50px', fontFamily: 'sans-serif' }}>
      <h1>Welcome to RetentionIQ</h1>
      <p>Enterprise Employee Attrition Prediction System</p>
      <br />
      <button 
        onClick={() => navigate('/login')} 
        style={{ padding: '10px 20px', fontSize: '16px', cursor: 'pointer', backgroundColor: '#0056b3', color: 'white', border: 'none', borderRadius: '4px' }}
      >
        Go to Login Portal
      </button>
    </div>
  );
};

export default HomePage;