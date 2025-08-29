/***************************
 * CreateProfile.jsx
 ***************************/
import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import "../App.css";

const CreateProfile = () => {
  const location = useLocation();
  const userName = location.state?.userName || "User";
  const userId = location.state?.userId;
  const navigate = useNavigate();
  const [uploadLoading, setUploadLoading] = useState(false);
  const [profileSaving, setProfileSaving] = useState(false);

  const [photoURL, setPhotoURL] = useState("");
  const [profileData, setProfileData] = useState({
    height: "",
    chest: "",
    weight: "",
    waist: "",
    gender: "",
    age: "",
  });
  const [error, setError] = useState("");

  // Check if userId is available, redirect if not
  useEffect(() => {
    if (!userId) {
      setError("User ID not found. Please sign up again.");
      // Redirect to signup after 3 seconds
      setTimeout(() => {
        navigate("/signup");
      }, 3000);
    }
  }, [userId, navigate]);

  const handleChange = (event) => {
    setProfileData({ ...profileData, [event.target.name]: event.target.value });
  };

  const handleImageUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    // show an instant preview
    const localPreview = URL.createObjectURL(file);
    setPhotoURL(localPreview);

    const formData = new FormData();
    formData.append("photo", file);
    formData.append("userId", userId);

    try {
      setUploadLoading(true);
      const res = await fetch("http://localhost:5001/profile/photo", {
        method: "POST",
        body: formData,
      });
      const data = await res.json();

      // switch to server‑stored image once upload succeeds
      if (data?.filePath) {
        // keep just "photo-1745928…jpg" so backend can read from /uploads
        const fileName = data.filePath.split("/").pop();
        setPhotoURL(fileName);
      }
    } catch (err) {
      console.error("Image upload error:", err);
      // keep the local preview if the upload fails
    } finally {
      setUploadLoading(false);
    }
  };

  const handleSaveProfile = async () => {
    // Don't proceed if userId is not available
    if (!userId) {
      setError("User ID not found. Cannot save profile.");
      return;
    }

    setProfileSaving(true);
    setError("");
    
    try {
      // 1️⃣ Save profile
      const response = await fetch("http://localhost:5001/profile", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId,
          height: profileData.height,
          chest: profileData.chest,
          weight: profileData.weight,
          waist: profileData.waist,
          gender: profileData.gender,
          age: profileData.age,
          photoURL,
        }),
      });

      if (!response.ok) {
        throw new Error(`Failed to save profile: ${response.statusText}`);
      }

      const savedProfile = await response.json();

      // 2️⃣ Kick off colour analysis without waiting
      fetch("http://localhost:5001/profile/colour", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId }),
      }).catch((err) => console.warn("Colour analysis failed:", err));

      // 3️⃣ Go to profile page immediately with user data
      navigate("/profile", { 
        state: { 
          userId, 
          userName,
          profileData: savedProfile 
        } 
      });
    } catch (err) {
      console.error("Profile save error:", err);
      setError(`Failed to save profile: ${err.message}`);
    } finally {
      setProfileSaving(false);
    }
  };

  // Show error message if userId is not available
  if (!userId) {
    return (
      <div className="apple-page">
        <div className="apple-center">
          <div className="apple-form-container">
            <div className="apple-form-card">
              <div className="apple-form-header">
                <h1>Error</h1>
                <p style={{ color: "var(--apple-error, #ff3b30)" }}>
                  {error}
                </p>
                <p>Redirecting to signup...</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="apple-page">
      <div className="apple-center">
        <div className="apple-form-container">
          <div className="apple-form-card">
            <div className="apple-form-header">
              <h1>Create Profile</h1>
              <p>Complete your profile to get started</p>
            </div>

            {/* Error message display */}
            {error && (
              <div className="apple-form-group">
                <p style={{ color: "var(--apple-error, #ff3b30)", textAlign: "center" }}>
                  {error}
                </p>
              </div>
            )}

            {/* Profile Image Section */}
            <div className="apple-form-group" style={{ textAlign: "center" }}>
              <img
                src={photoURL ? (photoURL.startsWith("blob:") ? photoURL : `http://localhost:5001/uploads/${photoURL}`) : "/default-avatar.png"}
                alt="Profile"
                className="apple-avatar"
                style={{ 
                  width: "120px", 
                  height: "120px", 
                  borderRadius: "50%", 
                  objectFit: "cover",
                  border: "3px solid var(--apple-border)",
                  marginBottom: "var(--apple-spacing-lg)"
                }}
              />
              <h3 style={{ marginBottom: "var(--apple-spacing-sm)" }}>{userName}</h3>
              <p style={{ color: "var(--apple-secondary)", marginBottom: "var(--apple-spacing-lg)" }}>User</p>
              
              <label className="apple-form-button" style={{ cursor: "pointer", marginBottom: "var(--apple-spacing-xl)" }}>
                {uploadLoading ? "Uploading..." : "Upload Image"}
                <input 
                  hidden 
                  accept="image/*" 
                  type="file" 
                  onChange={handleImageUpload}
                  disabled={uploadLoading}
                />
              </label>
            </div>

            {/* Profile Form Fields */}
            <div className="apple-form-group">
              <label className="apple-form-label">Height</label>
              <input
                type="text"
                name="height"
                className="apple-form-input"
                placeholder="e.g., 5'6&quot; or 170cm"
                value={profileData.height}
                onChange={handleChange}
              />
            </div>

            <div className="apple-form-group">
              <label className="apple-form-label">Chest/Bust Circumference</label>
              <input
                type="text"
                name="chest"
                className="apple-form-input"
                placeholder="e.g., 36&quot; or 91cm"
                value={profileData.chest}
                onChange={handleChange}
              />
            </div>

            <div className="apple-form-group">
              <label className="apple-form-label">Weight</label>
              <input
                type="text"
                name="weight"
                className="apple-form-input"
                placeholder="e.g., 140 lbs or 64 kg"
                value={profileData.weight}
                onChange={handleChange}
              />
            </div>

            <div className="apple-form-group">
              <label className="apple-form-label">Waist Circumference</label>
              <input
                type="text"
                name="waist"
                className="apple-form-input"
                placeholder="e.g., 28&quot; or 71cm"
                value={profileData.waist}
                onChange={handleChange}
              />
            </div>

            <div className="apple-form-group">
              <label className="apple-form-label">Gender</label>
              <select
                name="gender"
                className="apple-form-input"
                value={profileData.gender}
                onChange={handleChange}
              >
                <option value="">Select Gender</option>
                <option value="male">Male</option>
                <option value="female">Female</option>
                <option value="non-binary">Non-binary</option>
                <option value="prefer-not-to-say">Prefer not to say</option>
              </select>
            </div>

            <div className="apple-form-group">
              <label className="apple-form-label">Age</label>
              <input
                type="number"
                name="age"
                className="apple-form-input"
                placeholder="e.g., 25"
                value={profileData.age}
                onChange={handleChange}
              />
            </div>

            <button
              className="apple-form-button"
              disabled={uploadLoading || profileSaving}
              onClick={handleSaveProfile}
            >
              {uploadLoading
                ? "Uploading image..."
                : profileSaving
                ? "Saving..."
                : "Save Profile"}
            </button>

            <div className="apple-form-footer">
              <p>
                You can update your profile information at any time from your{" "}
                <a href="/profile">profile page</a>.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreateProfile;