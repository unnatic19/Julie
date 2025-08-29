/***************************
 * App.jsx
 ***************************/
import React from "react";
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from "react-router-dom";

import Landing from "./pages/Landing";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Profile from "./pages/Profile";
import CreateWardrobe from "./pages/CreateWardrobe";
import CreateProfile from "./pages/CreateProfile";
import MyWardrobe from "./pages/MyWardrobe";
import Stylist from "./pages/Stylist";
import Chatbot from "./components/Chatbot";

const AppContent = () => {
  const location = useLocation();
  const isLandingPage = location.pathname === '/';
  
  // Extract userId from various sources
  const userId = location.state?.userId || 
                 location.pathname.match(/\/my-wardrobe\/(\d+)/)?.[1] || 
                 1; // fallback

  return (
    <>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/create-wardrobe" element={<CreateWardrobe />} />
        <Route path="/create-profile" element={<CreateProfile />} />
        <Route path="/my-wardrobe/:userId" element={<MyWardrobe />} />
        <Route path="/stylist" element={<Stylist />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
      
      {/* Show chatbot on all pages except landing */}
      {!isLandingPage && <Chatbot userId={userId} />}
    </>
  );
};

const App = () => {
  return (
    <Router>
      <AppContent />
    </Router>
  );
};

export default App;