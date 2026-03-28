import React, { useState, useEffect } from 'react';
import { X, AlertTriangle, TrendingUp, Target, Clock, CheckCircle, XCircle, BarChart3, Brain, Lightbulb } from 'lucide-react';
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
      if (!response.ok) {
        throw new Error('Failed to fetch detailed analysis');
      }
      const data = await response.json();
      setAnalysisData(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const getRiskColor = (riskLevel) => {
    switch (riskLevel?.toLowerCase()) {
      case 'high': return 'risk-level-badge high';
      case 'medium': return 'risk-level-badge medium';
      case 'low': return 'risk-level-badge low';
      default: return 'risk-level-badge';
    }
  };

  const getImpactColor = (shapValue) => {
    if (shapValue > 0.1) return 'shap-bar-fill red';
    if (shapValue > 0.05) return 'shap-bar-fill orange';
    if (shapValue > 0) return 'shap-bar-fill yellow';
    if (shapValue > -0.05) return 'shap-bar-fill blue';
    return 'shap-bar-fill green';
  };

  const getPriorityColor = (priority) => {
    switch (priority?.toLowerCase()) {
      case 'high': return 'priority-badge high';
      case 'medium': return 'priority-badge medium';
      case 'low': return 'priority-badge low';
      default: return 'priority-badge';
    }
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-container">
        {/* Header */}
        <div className="modal-header">
          <div className="modal-header-content">
            <div className="modal-header-icon">
              <Brain />
            </div>
            <div className="modal-header-info">
              <h2>
                {analysisData?.name || 'Employee Analysis'}
              </h2>
              <p>
                Detailed Attrition Risk Analysis & Recommendations
              </p>
            </div>
          </div>
          <button onClick={onClose} className="modal-close-button">
            <X />
          </button>
        </div>

        <div className="modal-body">
          {loading && (
            <div className="modal-loading">
              <div className="modal-loading-spinner"></div>
              <span className="modal-loading-text">Loading detailed analysis...</span>
            </div>
          )}

          {error && (
            <div className="modal-error">
              <div className="modal-error-icon">
                <AlertTriangle />
              </div>
              <p className="modal-error-text">Error loading analysis: {error}</p>
            </div>
          )}

          {analysisData && (
            <div>
              {/* Overview Cards */}
              <div className="overview-grid">
                {/* Risk Score */}
                <div className="overview-card risk">
                  <div className="overview-card-header">
                    <AlertTriangle />
                    <h3 className="overview-card-title">Risk Score</h3>
                  </div>
                  <div className="overview-card-value">
                    {analysisData.riskScore.toFixed(1)}%
                  </div>
                  <span className={getRiskColor(analysisData.prediction.risk_level)}>
                    {analysisData.prediction.risk_level} Risk
                  </span>
                </div>

                {/* Prediction */}
                <div className="overview-card prediction">
                  <div className="overview-card-header">
                    <TrendingUp />
                    <h3 className="overview-card-title">Attrition Prediction</h3>
                  </div>
                  <div className="prediction-status">
                    {analysisData.prediction.prediction === 'Yes' ? (
                      <XCircle className="prediction-icon yes" />
                    ) : (
                      <CheckCircle className="prediction-icon no" />
                    )}
                    <div className="prediction-info">
                      <div className="prediction-label">
                        {analysisData.prediction.prediction}
                      </div>
                      <div className="prediction-confidence">
                        Confidence: {(analysisData.prediction.confidence * 100).toFixed(1)}%
                      </div>
                    </div>
                  </div>
                </div>

                {/* Employee Info */}
                <div className="overview-card details">
                  <div className="overview-card-header">
                    <Target />
                    <h3 className="overview-card-title">Employee Details</h3>
                  </div>
                  <div className="employee-details-list">
                    <div className="employee-detail-item"><strong>Department:</strong> {analysisData.department}</div>
                    <div className="employee-detail-item"><strong>Position:</strong> {analysisData.position}</div>
                    <div className="employee-detail-item"><strong>ID:</strong> {analysisData.employeeId}</div>
                  </div>
                </div>
              </div>

              {/* SHAP Analysis */}
              {analysisData.shapAnalysis && (
                <div className="analysis-section">
                  <div className="analysis-section-header">
                    <BarChart3 />
                    <h3 className="analysis-section-title">Key Risk Factors Analysis</h3>
                    <span className="analysis-badge">
                      {analysisData.shapAnalysis.explanation ? 'Industry-Standard Analysis' : 'AI-Powered Insights'}
                    </span>
                  </div>

                  {analysisData.shapAnalysis.top_factors && analysisData.shapAnalysis.top_factors.length > 0 ? (
                    <div className="shap-factors-list">
                      {analysisData.shapAnalysis.top_factors.slice(0, 6).map((factor, index) => (
                        <div key={index} className="shap-factor-item">
                          <div className="shap-factor-header">
                            <span className="shap-factor-name">
                              {factor.feature}
                            </span>
                            <span className={`shap-impact-badge ${factor.shap_value > 0 ? 'increases' : 'decreases'}`}>
                              {factor.impact} risk
                            </span>
                          </div>
                          <p className="shap-factor-description">
                            {factor.description}
                          </p>
                          <div className="shap-factor-bar">
                            <div className="shap-bar-container">
                              <div
                                className={getImpactColor(factor.shap_value)}
                                style={{ width: `${Math.min(Math.abs(factor.shap_value) * 1000, 100)}%` }}
                              ></div>
                            </div>
                            <span className="shap-value-text">
                              {factor.shap_value > 0 ? '+' : ''}{factor.shap_value.toFixed(3)}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="empty-state">
                      <BarChart3 />
                      <p className="empty-state-text">
                        {analysisData.shapAnalysis.explanation || 'Unable to generate detailed factor analysis'}
                      </p>
                      <p className="empty-state-subtext">
                        This may occur when employee data is incomplete or the ML model is unavailable.
                      </p>
                    </div>
                  )}

                  {/* SHAP Plot */}
                  {analysisData.shapAnalysis.shap_plot && (
                    <div className="shap-plot-container">
                      <h4 className="shap-plot-title">
                        Feature Impact Visualization
                      </h4>
                      <div className="shap-plot-image">
                        <img
                          src={analysisData.shapAnalysis.shap_plot}
                          alt="SHAP Analysis Plot"
                          onError={(e) => {
                            e.target.style.display = 'none';
                          }}
                        />
                      </div>
                    </div>
                  )}
                  
                  {/* Show explanation if SHAP analysis used fallback data */}
                  {analysisData.shapAnalysis.explanation && (
                    <div className="analysis-note">
                      <div className="analysis-note-icon">
                        <Brain size={16} />
                      </div>
                      <p className="analysis-note-text">
                        {analysisData.shapAnalysis.explanation}
                      </p>
                    </div>
                  )}
                </div>
              )}

              {/* Recommendations */}
              {analysisData.recommendations && analysisData.recommendations.length > 0 && (
                <div className="analysis-section">
                  <div className="analysis-section-header">
                    <Lightbulb />
                    <h3 className="analysis-section-title">Retention Recommendations</h3>
                  </div>

                  <div className="recommendations-grid">
                    {analysisData.recommendations.map((rec, index) => (
                      <div key={index} className="recommendation-card">
                        <div className="recommendation-card-header">
                          <span className={getPriorityColor(rec.priority)}>
                            {rec.priority} Priority
                          </span>
                          <span className="timeline-badge">
                            <Clock />
                            {rec.timeline}
                          </span>
                        </div>

                        <h4 className="recommendation-title">
                          {rec.action}
                        </h4>

                        <ul className="recommendation-suggestions">
                          {rec.suggestions.map((suggestion, suggIndex) => (
                            <li key={suggIndex} className="recommendation-suggestion">
                              <CheckCircle />
                              <span>{suggestion}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Action Items */}
              <div className="next-steps-section">
                <h3 className="next-steps-title">Next Steps</h3>
                <div className="next-steps-list">
                  <div className="next-step-item">
                    <div className="next-step-bullet"></div>
                    <div className="next-step-content">
                      <p className="next-step-title">Schedule One-on-One Meeting</p>
                      <p className="next-step-description">Discuss concerns and career aspirations within the next week</p>
                    </div>
                  </div>
                  <div className="next-step-item">
                    <div className="next-step-bullet"></div>
                    <div className="next-step-content">
                      <p className="next-step-title">Create Action Plan</p>
                      <p className="next-step-description">Develop specific interventions based on the recommendations above</p>
                    </div>
                  </div>
                  <div className="next-step-item">
                    <div className="next-step-bullet"></div>
                    <div className="next-step-content">
                      <p className="next-step-title">Follow-up Assessment</p>
                      <p className="next-step-description">Re-evaluate risk levels after implementing retention strategies</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="modal-footer">
          <div className="modal-footer-info">
            Analysis generated using AI-powered SHAP (SHapley Additive exPlanations) methodology
          </div>
          <button onClick={onClose} className="modal-footer-button">
            Close Analysis
          </button>
        </div>
      </div>
    </div>
  );
};

export default EmployeeDetailModal;