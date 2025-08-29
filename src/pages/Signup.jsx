/***************************
 * Signup.jsx
 ***************************/
import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import "../App.css";

const Signup = () => {
  const [formData, setFormData] = useState({ name: "", email: "", password: "" });
  const [nameError, setNameError] = useState(false);
  const [emailError, setEmailError] = useState(false);
  const [passwordError, setPasswordError] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const validateInputs = () => {
    let valid = true;

    if (!formData.name) {
      setNameError(true);
      valid = false;
    } else {
      setNameError(false);
    }

    if (!formData.email || !/\S+@\S+\.\S+/.test(formData.email)) {
      setEmailError(true);
      valid = false;
    } else {
      setEmailError(false);
    }

    if (!formData.password || formData.password.length < 6) {
      setPasswordError(true);
      valid = false;
    } else {
      setPasswordError(false);
    }

    return valid;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateInputs()) return;

    try {
      const response = await axios.post("http://localhost:5001/auth/signup", formData);
      console.log("Signup response:", response.data);
      // Try multiple possible field names
      const raw = response.data;
      const userId =
        raw.userId ??       // preferred
        raw.id ??           // fallback e.g. Prisma/SQL
        raw._id ??          // Mongo default
        raw.user?.id ??     // nested object
        raw.user?.userId;

      const userName =
        raw.userName ??
        raw.name ??
        raw.user?.name ??
        raw.user?.userName;

      if (userId) {
        navigate("/create-profile", { state: { userId, userName } });
      } else {
        alert("Signup succeeded but no userId returned. Check console for payload.");
      }
    } catch (error) {
      alert(error.response?.data?.message || "Error signing up!");
    }
  };

  const handleGoogleSignup = () => {
    alert("Continue with Google (coming soon)");
  };

  const handleFacebookSignup = () => {
    alert("Continue with Facebook (coming soon)");
  };

  const handleLogin = (e) => {
    e.preventDefault();
    navigate("/login");
  };

  return (
    <div className="apple-page">
      <div className="apple-center">
        <div className="apple-form-container">
          <div className="apple-form-card">
            <div className="apple-form-header">
              <h1>Sign Up</h1>
              <p>Create your account to get started.</p>
            </div>
            
            <form onSubmit={handleSubmit}>
              <div className="apple-form-group">
                <label htmlFor="name" className="apple-form-label">
                  Name
                </label>
                <input
                  id="name"
                  type="text"
                  className={`apple-form-input ${nameError ? 'error' : ''}`}
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  placeholder="Enter your full name"
                  aria-describedby={nameError ? "name-error" : undefined}
                />
                {nameError && (
                  <span id="name-error" className="apple-form-error">
                    Name is required
                  </span>
                )}
              </div>

              <div className="apple-form-group">
                <label htmlFor="email" className="apple-form-label">
                  Email
                </label>
                <input
                  id="email"
                  type="email"
                  className={`apple-form-input ${emailError ? 'error' : ''}`}
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  placeholder="Enter your email"
                  aria-describedby={emailError ? "email-error" : undefined}
                />
                {emailError && (
                  <span id="email-error" className="apple-form-error">
                    Invalid email address
                  </span>
                )}
              </div>

              <div className="apple-form-group">
                <label htmlFor="password" className="apple-form-label">
                  Password
                </label>
                <input
                  id="password"
                  type="password"
                  className={`apple-form-input ${passwordError ? 'error' : ''}`}
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  required
                  placeholder="Enter your password"
                  aria-describedby={passwordError ? "password-error" : undefined}
                />
                {passwordError && (
                  <span id="password-error" className="apple-form-error">
                    Password must be at least 6 characters
                  </span>
                )}
              </div>

              <button type="submit" className="apple-form-button primary">
                Sign Up
              </button>
            </form>

            <div className="apple-form-divider">
              <span>or</span>
            </div>

            <button 
              type="button" 
              className="apple-form-button secondary"
              onClick={handleGoogleSignup}
            >
              Continue with Google
            </button>

            <button 
              type="button" 
              className="apple-form-button secondary"
              onClick={handleFacebookSignup}
            >
              Continue with Facebook
            </button>

            <div className="apple-form-footer">
              <span>Already have an account? </span>
              <a href="#" onClick={handleLogin} className="apple-form-link">
                Login
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Signup;