/***************************
 * Login.jsx
 ***************************/
import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import "../App.css";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [emailError, setEmailError] = useState(false);
  const [passwordError, setPasswordError] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateInputs()) return;

    try {
      const response = await axios.post("http://localhost:5001/login", {
        email,
        password,
      });
      const { user } = response.data;
      alert("Login successful!");
      navigate("/profile", {
        state: { userName: user.name, userId: user.id },
      });
    } catch (error) {
      alert(error.response?.data?.message || "Error logging in!");
    }
  };

  const validateInputs = () => {
    let valid = true;
    if (!email || !/\S+@\S+\.\S+/.test(email)) {
      setEmailError(true);
      valid = false;
    } else {
      setEmailError(false);
    }

    if (!password || password.length < 6) {
      setPasswordError(true);
      valid = false;
    } else {
      setPasswordError(false);
    }
    return valid;
  };

  const handleForgotPassword = (e) => {
    e.preventDefault();
    navigate("/forgot-password");
  };

  const handleSignUp = (e) => {
    e.preventDefault();
    navigate("/signup");
  };

  const handleGoogleSignIn = () => {
    alert("Sign in with Google");
  };

  const handleFacebookSignIn = () => {
    alert("Sign in with Facebook");
  };

  return (
    <div className="apple-page">
      <div className="apple-center">
        <div className="apple-form-container">
          <div className="apple-form-card">
            <div className="apple-form-header">
              <h1>Login</h1>
              <p>Welcome back! Please sign in to your account.</p>
            </div>
            
            <form onSubmit={handleSubmit}>
              <div className="apple-form-group">
                <label htmlFor="email" className="apple-form-label">
                  Email
                </label>
                <input
                  id="email"
                  type="email"
                  className={`apple-form-input ${emailError ? 'error' : ''}`}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
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
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
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

              <div className="apple-form-group">
                <label className="apple-form-checkbox">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                  />
                  <span className="apple-form-checkmark"></span>
                  Remember me
                </label>
              </div>

              <button type="submit" className="apple-form-button primary">
                Login
              </button>

              <div className="apple-form-footer">
                <a href="#" onClick={handleForgotPassword} className="apple-form-link">
                  Forgot your password?
                </a>
              </div>
            </form>

            <div className="apple-form-divider">
              <span>or</span>
            </div>

            <button 
              type="button" 
              className="apple-form-button secondary"
              onClick={handleGoogleSignIn}
            >
              Sign in with Google
            </button>

            <button 
              type="button" 
              className="apple-form-button secondary"
              onClick={handleFacebookSignIn}
            >
              Sign in with Facebook
            </button>

            <div className="apple-form-footer">
              <span>Don't have an account? </span>
              <a href="#" onClick={handleSignUp} className="apple-form-link">
                Sign up
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;