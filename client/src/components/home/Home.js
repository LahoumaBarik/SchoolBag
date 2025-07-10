import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Calendar, CheckCircle, Shield, BarChart3, ArrowRight } from 'lucide-react';
import './Home.css';

const Home = () => {
  const [assignmentCount, setAssignmentCount] = useState(1200);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setIsVisible(true);
    // Animate the counter
    const interval = setInterval(() => {
      setAssignmentCount(prev => {
        const increment = Math.floor(Math.random() * 3) + 1;
        return prev + increment;
      });
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  const features = [
    {
      icon: <Shield className="feature-icon" />,
      title: "Secure Sign-in",
      description: "Your academic data is protected with enterprise-grade security and encrypted storage."
    },
    {
      icon: <CheckCircle className="feature-icon" />,
      title: "Smart Task Management",
      description: "Organize assignments, exams, and projects with intelligent prioritization and due date tracking."
    },
    {
      icon: <Calendar className="feature-icon" />,
      title: "Calendar Heat-map View",
      description: "Visualize your workload with an intuitive calendar that shows task density and helps you plan ahead."
    }
  ];

  return (
    <div className="home-container">
      {/* Header */}
      <header className="home-header">
        <div className="header-content">
          <div className="logo">
            <BarChart3 className="logo-icon" />
            <span>SchoolBag</span>
          </div>
          <nav className="header-nav">
            <Link to="/login" className="nav-link">Log in</Link>
            <Link to="/register" className="nav-button">Sign up</Link>
          </nav>
        </div>
      </header>

      {/* Hero Section */}
      <section className={`hero-section ${isVisible ? 'visible' : ''}`}>
        <div className="hero-content">
          <div className="hero-text">
            <h1 className="hero-title">
              Clarity, finally.
            </h1>
            <p className="hero-subtitle">
              Get organized and stay on top of your academic life with our intelligent task management system. 
              Never miss a deadline again.
            </p>
            <Link to="/register" className="cta-button">
              Create my account
              <ArrowRight className="cta-arrow" />
            </Link>
          </div>
          <div className="hero-visual">
            <div className="calendar-demo">
              <div className="calendar-header">
                <h3>November 2024</h3>
              </div>
              <div className="calendar-grid">
                {/* Generate calendar days with heat-map effect */}
                {Array.from({ length: 30 }, (_, i) => {
                  const intensity = Math.floor(Math.random() * 4);
                  return (
                    <div 
                      key={i} 
                      className={`calendar-day intensity-${intensity}`}
                      style={{ 
                        animationDelay: `${i * 0.05}s`,
                        opacity: isVisible ? 1 : 0
                      }}
                    >
                      {i + 1}
                    </div>
                  );
                })}
              </div>
              <div className="calendar-legend">
                <span>Less</span>
                <div className="legend-dots">
                  <div className="legend-dot intensity-0"></div>
                  <div className="legend-dot intensity-1"></div>
                  <div className="legend-dot intensity-2"></div>
                  <div className="legend-dot intensity-3"></div>
                </div>
                <span>More</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="features-section">
        <div className="features-content">
          <h2 className="features-title">Everything you need to succeed</h2>
          <div className="features-grid">
            {features.map((feature, index) => (
              <div 
                key={index} 
                className={`feature-card ${isVisible ? 'visible' : ''}`}
                style={{ animationDelay: `${index * 0.2}s` }}
              >
                <div className="feature-icon-wrapper">
                  {feature.icon}
                </div>
                <h3 className="feature-title">{feature.title}</h3>
                <p className="feature-description">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Task Management Preview */}
      <section className="preview-section">
        <div className="preview-content">
          <div className="preview-text">
            <h2>Capture tasks at the speed of thought</h2>
            <p>
              Our smart interface learns how you work and helps you organize everything from assignments 
              to exam preparation with context-aware templates and intelligent reminders.
            </p>
            <ul className="preview-features">
              <li>✓ Context-aware note templates</li>
              <li>✓ Smart deadline reminders</li>
              <li>✓ Priority-based organization</li>
              <li>✓ Real-time collaboration</li>
            </ul>
          </div>
          <div className="preview-visual">
            <div className="task-preview">
              <div className="task-item high-priority">
                <div className="task-indicator"></div>
                <div className="task-content">
                  <h4>Linear Algebra Final Exam</h4>
                  <p>Mathematics • Due Dec 15</p>
                </div>
                <div className="task-status completed"></div>
              </div>
              <div className="task-item medium-priority">
                <div className="task-indicator"></div>
                <div className="task-content">
                  <h4>Research Paper Draft</h4>
                  <p>History • Due Dec 12</p>
                </div>
                <div className="task-status in-progress"></div>
              </div>
              <div className="task-item low-priority">
                <div className="task-indicator"></div>
                <div className="task-content">
                  <h4>Chemistry Lab Report</h4>
                  <p>Chemistry • Due Dec 18</p>
                </div>
                <div className="task-status pending"></div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Social Proof Section */}
      <section className="social-proof-section">
        <div className="social-proof-content">
          <div className="stat-card">
            <div className="stat-number">
              {assignmentCount.toLocaleString()}
            </div>
            <div className="stat-label">assignments already planned</div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="cta-section">
        <div className="cta-content">
          <h2>Ready to take control of your academic life?</h2>
          <p>Join thousands of students who have organized their way to success.</p>
          <Link to="/register" className="cta-button-large">
            Get started for free
            <ArrowRight className="cta-arrow" />
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="home-footer">
        <div className="footer-content">
          <div className="footer-brand">
            <BarChart3 className="logo-icon" />
            <span>SchoolBag</span>
          </div>
          <div className="footer-links">
            <Link to="/login">Sign in</Link>
            <Link to="/register">Sign up</Link>
          </div>
        </div>
        <div className="footer-bottom">
          <p>&copy; 2024 SchoolBag. Built by LahoumaBarik Team.</p>
        </div>
      </footer>
    </div>
  );
};

export default Home; 