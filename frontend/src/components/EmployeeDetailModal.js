import React, { useState, useEffect } from 'react';
import '../styles/EmployeeDetailModal.css';

const EmployeeDetailModal = ({ employeeId, isOpen, onClose }) => {
  const [analysisData, setAnalysisData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (isOpen && employeeId) {
      fetchDetailedAnalysis();
    }
  }, [isOpen, employeeId]);

  const fetchDetailedAnalysis = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`http://localhost:8000/dashboard/employee/${employeeId}/detailed-analysis`);
      if (!response.ok) throw new Error('Failed');
      const data = await response.json();
      setAnalysisData(data);
    } catch (err) {
      setError("Could not load data.");
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="modal-backdrop" style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000 }}>
      <div className="modal-box" style={{ background: 'white', padding: '20px', borderRadius: '8px', width: '80%', maxHeight: '90vh', overflowY: 'auto' }}>
        
        <div className="modal-header" style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #ccc', paddingBottom: '10px' }}>
            <h3>Employee Analysis: {analysisData?.name || 'Loading...'}</h3>
            <button onClick={onClose} style={{ cursor: 'pointer', background: 'none', border: 'none', fontSize: '18px' }}>X</button>
        </div>

        <div className="modal-content" style={{ marginTop: '20px' }}>
            {loading && <p>Analyzing AI predictions...</p>}
            {error && <p style={{ color: 'red' }}>{error}</p>}

            {analysisData && (
                <div>
                    <table style={{ width: '100%', marginBottom: '20px', textAlign: 'left' }}>
                        <tbody>
                            <tr>
                                <td><strong>Risk Score:</strong></td>
                                <td>{analysisData.riskScore.toFixed(1)}%</td>
                            </tr>
                            <tr>
                                <td><strong>Risk Level:</strong></td>
                                <td style={{ color: analysisData.prediction.risk_level === 'High' ? 'red' : 'green', fontWeight: 'bold' }}>
                                    {analysisData.prediction.risk_level}
                                </td>
                            </tr>
                            <tr>
                                <td><strong>Department:</strong></td>
                                <td>{analysisData.department}</td>
                            </tr>
                        </tbody>
                    </table>

                    <hr />

                    <h4>Why is this risk high? (Top Factors)</h4>
                    <ul>
                        {analysisData.shapAnalysis.top_factors.map((factor, idx) => (
                            <li key={idx} style={{marginBottom: '10px'}}>
                                <strong>{factor.feature}:</strong> {factor.description}
                            </li>
                        ))}
                    </ul>

                    {analysisData.shapAnalysis.shap_plot && (
                        <div style={{textAlign: 'center', margin: '20px 0'}}>
                            <p><strong>AI Visual Analysis Chart (SHAP)</strong></p>
                            <img 
                                src={analysisData.shapAnalysis.shap_plot} 
                                alt="SHAP Analysis Graph" 
                                style={{maxWidth: '100%', border: '1px solid #eee', borderRadius: '4px'}} 
                            />
                        </div>
                    )}

                    <hr />

                    <h4>Suggested Retention Actions</h4>
                    {analysisData.recommendations.map((rec, idx) => (
                        <div key={idx} style={{ background: '#f9f9f9', padding: '10px', borderRadius: '4px', marginBottom: '10px' }}>
                            <p style={{ margin: '0 0 5px 0' }}><strong>Action: {rec.action}</strong> (Priority: {rec.priority})</p>
                            <ul style={{ margin: 0, paddingLeft: '20px' }}>
                                {rec.suggestions.map((s, i) => <li key={i}>{s}</li>)}
                            </ul>
                        </div>
                    ))}
                </div>
            )}
        </div>
      </div>
    </div>
  );
};

export default EmployeeDetailModal;