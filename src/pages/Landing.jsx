/***************************
 * Landing.jsx
 ***************************/
import React from "react";
import { useNavigate } from "react-router-dom";
import "../App.css";

const Landing = () => {
  const navigate = useNavigate();

  const handleGetStarted = () => {
    navigate("/signup");
  };

  const handleLogin = () => {
    navigate("/login");
  };

  return (
    <div className="apple-page landing-page">
      {/* Hero Section */}
      <section className="landing-hero">
        <div className="apple-container">
          <div className="landing-hero-content">
            <div className="landing-hero-text">
              <h1 className="landing-hero-title">
                Your Personal Style Assistant
              </h1>
              <p className="landing-hero-subtitle">
                Discover your perfect wardrobe, organize your style, and never run out of outfit ideas. 
                Julie helps you make the most of every piece in your closet.
              </p>
              <div className="landing-hero-buttons">
                <button 
                  className="apple-form-button primary landing-cta-primary"
                  onClick={handleGetStarted}
                >
                  Get Started Free
                </button>
                <button 
                  className="apple-form-button secondary landing-cta-secondary"
                  onClick={handleLogin}
                >
                  Sign In
                </button>
              </div>
            </div>
            <div className="landing-hero-visual">
              <div className="landing-hero-card">
                <div className="landing-hero-card-content">
                  <div className="landing-sample-outfit">
                    <div className="landing-outfit-item">👗</div>
                    <div className="landing-outfit-item">👠</div>
                    <div className="landing-outfit-item">👜</div>
                  </div>
                  <p className="landing-card-text">Perfect outfit suggestions</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="landing-features">
        <div className="apple-container">
          <h2 className="landing-section-title">Everything you need to elevate your style</h2>
          <div className="landing-features-grid">
            <div className="landing-feature-card apple-fade-in">
              <div className="landing-feature-icon">🎨</div>
              <h3>Color Analysis</h3>
              <p>Discover your perfect color palette and find clothes that complement your skin tone beautifully.</p>
            </div>
            <div className="landing-feature-card apple-fade-in">
              <div className="landing-feature-icon">👔</div>
              <h3>Smart Wardrobe</h3>
              <p>Organize your entire closet digitally and never forget what you own again.</p>
            </div>
            <div className="landing-feature-card apple-fade-in">
              <div className="landing-feature-icon">✨</div>
              <h3>Outfit Suggestions</h3>
              <p>Get personalized outfit recommendations based on your style, occasion, and weather.</p>
            </div>
            <div className="landing-feature-card apple-fade-in">
              <div className="landing-feature-icon">📊</div>
              <h3>Style Analytics</h3>
              <p>Track your wearing patterns and discover which pieces work best for you.</p>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="landing-how-it-works">
        <div className="apple-container">
          <h2 className="landing-section-title">How it works</h2>
          <div className="landing-steps">
            <div className="landing-step">
              <div className="landing-step-number">1</div>
              <div className="landing-step-content">
                <h3>Create Your Profile</h3>
                <p>Tell us about your style preferences, body type, and lifestyle.</p>
              </div>
            </div>
            <div className="landing-step">
              <div className="landing-step-number">2</div>
              <div className="landing-step-content">
                <h3>Build Your Digital Wardrobe</h3>
                <p>Upload photos of your clothes and let our AI categorize everything.</p>
              </div>
            </div>
            <div className="landing-step">
              <div className="landing-step-number">3</div>
              <div className="landing-step-content">
                <h3>Get Personalized Suggestions</h3>
                <p>Receive daily outfit recommendations tailored just for you.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="landing-cta">
        <div className="apple-container">
          <div className="landing-cta-content">
            <h2>Ready to transform your style?</h2>
            <p>Join thousands of fashion-forward individuals who've revolutionized their wardrobes with Julie.</p>
            <button 
              className="apple-form-button primary landing-cta-final"
              onClick={handleGetStarted}
            >
              Start Your Style Journey
            </button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="landing-footer">
        <div className="apple-container">
          <div className="landing-footer-content">
            <div className="landing-footer-brand">
              <h3>Julie</h3>
              <p>Your personal style assistant</p>
            </div>
            <div className="landing-footer-links">
              <a href="#" onClick={(e) => { e.preventDefault(); navigate("/login"); }}>Sign In</a>
              <a href="#" onClick={(e) => { e.preventDefault(); navigate("/signup"); }}>Sign Up</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Landing;