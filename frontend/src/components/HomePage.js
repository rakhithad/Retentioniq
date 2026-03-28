/* HomePage.jsx */
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { BarChart3, Users, TrendingUp, Shield, Brain, Target, ArrowRight, CheckCircle, Star, Award } from 'lucide-react';
import "../styles/HomePage.css";

const Homepage = () => {
  const navigate = useNavigate();
  
  const handleGetStarted = () => {
    navigate('/login');
  }; 
  
  return (
    <div className="homepage">
      {/* Navigation */}
      <nav className="navbar">
        <div className="nav-container">
          <div className="nav-brand">
            <Users className="nav-logo" />
            <span>RetentionIQ</span>
          </div>
          <div className="nav-links">
            <a href="#features">Features</a>
            <a href="#how-it-works">How It Works</a>
            <a href="#analytics">Analytics</a>
            <a href="#contact">Contact</a>
            <button className="nav-cta" onClick={handleGetStarted}>Get Started</button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="hero">
        <div className="hero-container">
          <div className="hero-content">
            <div className="hero-badge">
              <Star className="badge-icon" />
              <span>AI-Powered HR Analytics</span>
            </div>
            <h1 className="hero-title">
              Predict Employee Attrition with
              <span className="gradient-text"> Advanced ML</span>
            </h1>
            <p className="hero-subtitle">
              Leverage machine learning, behavioral analytics, and statistical modeling to identify at-risk employees 
              and reduce costly turnover with actionable insights and explainable AI.
            </p>
            <div className="hero-actions">
              <button className="btn-primary" onClick={handleGetStarted}>
                Start Predicting <ArrowRight size={20} />
              </button>
              <button className="btn-secondary">
                View Demo
              </button>
            </div>
            <div className="hero-stats">
              <div className="stat">
                <div className="stat-number">87%</div>
                <div className="stat-label">Prediction Accuracy</div>
              </div>
              <div className="stat">
                <div className="stat-number">45%</div>
                <div className="stat-label">Turnover Reduction</div>
              </div>
              <div className="stat">
                <div className="stat-number">$2M+</div>
                <div className="stat-label">Cost Savings</div>
              </div>
            </div>
          </div>
          <div className="hero-visual">
            <div className="chart-container">
              <div className="chart-header">
                <div className="chart-title">Employee Risk Analysis</div>
                <div className="chart-subtitle">Real-time Attrition Predictions</div>
              </div>
              <div className="risk-bars">
                <div className="risk-bar high">
                  <div className="risk-label">High Risk</div>
                  <div className="risk-fill" style={{width: '15%'}}></div>
                  <div className="risk-value">15%</div>
                </div>
                <div className="risk-bar medium">
                  <div className="risk-label">Medium Risk</div>
                  <div className="risk-fill" style={{width: '25%'}}></div>
                  <div className="risk-value">25%</div>
                </div>
                <div className="risk-bar low">
                  <div className="risk-label">Low Risk</div>
                  <div className="risk-fill" style={{width: '60%'}}></div>
                  <div className="risk-value">60%</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="features">
        <div className="container">
          <div className="section-header">
            <h2>Comprehensive Attrition Analytics</h2>
            <p>Advanced ML models combined with statistical rigor for actionable HR insights</p>
          </div>
          <div className="features-grid">
            <div className="feature-card">
              <div className="feature-icon">
                <Brain />
              </div>
              <h3>Machine Learning Models</h3>
              <p>Multiple classification algorithms including Logistic Regression, Random Forest, and XGBoost for accurate predictions.</p>
              <ul>
                <li>Ensemble model voting</li>
                <li>Cross-validation testing</li>
                <li>Feature importance ranking</li>
              </ul>
            </div>
            <div className="feature-card">
              <div className="feature-icon">
                <BarChart3 />
              </div>
              <h3>Statistical Analysis</h3>
              <p>Rigorous statistical methods including hypothesis testing, correlation analysis, and survival modeling.</p>
              <ul>
                <li>Cox regression survival analysis</li>
                <li>Chi-square & t-test analysis</li>
                <li>Principal Component Analysis</li>
              </ul>
            </div>
            <div className="feature-card">
              <div className="feature-icon">
                <Shield />
              </div>
              <h3>Explainable AI</h3>
              <p>SHAP explanations provide clear insights into which factors drive attrition risk for each employee.</p>
              <ul>
                <li>Individual risk factors</li>
                <li>Feature contribution analysis</li>
                <li>Interpretable model outputs</li>
              </ul>
            </div>
            <div className="feature-card">
              <div className="feature-icon">
                <TrendingUp />
              </div>
              <h3>Behavioral Analytics</h3>
              <p>Time-based analysis of employee patterns to detect early warning signs of potential attrition.</p>
              <ul>
                <li>Performance trend analysis</li>
                <li>Engagement pattern detection</li>
                <li>Monthly behavior tracking</li>
              </ul>
            </div>
            <div className="feature-card">
              <div className="feature-icon">
                <Users />
              </div>
              <h3>Risk Profiling</h3>
              <p>Clustering algorithms group employees into risk categories for targeted retention strategies.</p>
              <ul>
                <li>Multi-dimensional clustering</li>
                <li>Risk score calculation</li>
                <li>Segment-based insights</li>
              </ul>
            </div>
            <div className="feature-card">
              <div className="feature-icon">
                <Target />
              </div>
              <h3>Causal Insights</h3>
              <p>Go beyond correlation to understand the actual drivers of employee turnover with causal analysis.</p>
              <ul>
                <li>Causal relationship mapping</li>
                <li>Intervention impact modeling</li>
                <li>Policy recommendation engine</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section id="how-it-works" className="how-it-works">
        <div className="container">
          <div className="section-header">
            <h2>How RetentionIQ Works</h2>
            <p>A sophisticated pipeline that transforms HR data into actionable retention strategies</p>
          </div>
          <div className="process-steps">
            <div className="step">
              <div className="step-number">1</div>
              <div className="step-content">
                <h3>Data Integration</h3>
                <p>Connect your HR systems and import employee data including performance metrics, satisfaction scores, and behavioral indicators.</p>
              </div>
            </div>
            <div className="step">
              <div className="step-number">2</div>
              <div className="step-content">
                <h3>ML Model Training</h3>
                <p>Our ensemble of machine learning models analyzes patterns and learns from historical attrition data to make accurate predictions.</p>
              </div>
            </div>
            <div className="step">
              <div className="step-number">3</div>
              <div className="step-content">
                <h3>Statistical Validation</h3>
                <p>Rigorous statistical testing validates predictions and identifies significant risk factors with confidence intervals.</p>
              </div>
            </div>
            <div className="step">
              <div className="step-number">4</div>
              <div className="step-content">
                <h3>Risk Scoring & Insights</h3>
                <p>Employees receive risk scores with SHAP explanations showing exactly which factors contribute to their attrition risk.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Analytics Dashboard Preview */}
      <section id="analytics" className="analytics-preview">
        <div className="container">
          <div className="analytics-content">
            <div className="analytics-text">
              <h2>Powerful Analytics Dashboard</h2>
              <p>Get comprehensive insights with interactive visualizations, real-time monitoring, and detailed reporting capabilities.</p>
              <div className="analytics-features">
                <div className="analytics-feature">
                  <CheckCircle size={20} />
                  <span>Real-time risk monitoring</span>
                </div>
                <div className="analytics-feature">
                  <CheckCircle size={20} />
                  <span>Interactive SHAP explanations</span>
                </div>
                <div className="analytics-feature">
                  <CheckCircle size={20} />
                  <span>Survival analysis curves</span>
                </div>
                <div className="analytics-feature">
                  <CheckCircle size={20} />
                  <span>Statistical significance testing</span>
                </div>
              </div>
              <button className="btn-primary" onClick={handleGetStarted}>
                Explore Dashboard <ArrowRight size={20} />
              </button>
            </div>
            <div className="analytics-visual">
              <div className="dashboard-mockup">
                <div className="dashboard-header">
                  <div className="dashboard-title">HR Analytics Dashboard</div>
                  <div className="dashboard-controls">
                    <div className="control active">Overview</div>
                    <div className="control">Predictions</div>
                    <div className="control">SHAP</div>
                  </div>
                </div>
                <div className="dashboard-metrics">
                  <div className="metric-card">
                    <div className="metric-value">234</div>
                    <div className="metric-label">Active Employees</div>
                    <div className="metric-change positive">+5.2%</div>
                  </div>
                  <div className="metric-card">
                    <div className="metric-value">23</div>
                    <div className="metric-label">High Risk</div>
                    <div className="metric-change negative">+12%</div>
                  </div>
                  <div className="metric-card">
                    <div className="metric-value">87%</div>
                    <div className="metric-label">Model Accuracy</div>
                    <div className="metric-change positive">+2.1%</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="cta-section">
        <div className="container">
          <div className="cta-content">
            <h2>Ready to Reduce Employee Turnover?</h2>
            <p>Join leading companies using RetentionIQ to make data-driven retention decisions</p>
            <div className="cta-actions">
              <button className="btn-primary large" onClick={handleGetStarted}>
                Get Started <ArrowRight size={24} />
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="footer">
        <div className="container">
          <div className="footer-content">
            <div className="footer-brand">
              <Users size={32} />
              <span>RetentionIQ</span>
            </div>
            <div className="footer-links">
              <div className="footer-section">
                <h4>Product</h4>
                <a href="#features">Features</a>
                <a href="#pricing">Pricing</a>
                <a href="#integrations">Integrations</a>
                <a href="#api">API Docs</a>
              </div>
              <div className="footer-section">
                <h4>Company</h4>
                <a href="#about">About Us</a>
                <a href="#careers">Careers</a>
                <a href="#blog">Blog</a>
                <a href="#contact">Contact</a>
              </div>
              <div className="footer-section">
                <h4>Resources</h4>
                <a href="#documentation">Documentation</a>
                <a href="#support">Support</a>
                <a href="#case-studies">Case Studies</a>
                <a href="#whitepapers">Whitepapers</a>
              </div>
            </div>
          </div>
          <div className="footer-bottom">
            <div className="footer-copyright">
              © 2026 RetentionIQ. All rights reserved.
            </div>
            <div className="footer-legal">
              <a href="#privacy">Privacy Policy</a>
              <a href="#terms">Terms of Service</a>
              <a href="#security">Security</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Homepage;