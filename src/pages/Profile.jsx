/***************************
 * Profile.jsx
 ***************************/
import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import axios from "axios";
import "../App.css";

const TabPanel = ({ value, index, children }) => (
  value === index && <div className="apple-tab-content">{children}</div>
);

const Profile = () => {
  const location = useLocation();
  const userName = location.state?.userName || "User";
  const userId = location.state?.userId || 1;

  const navigate = useNavigate();

  const [tabValue, setTabValue] = useState(0);
  
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [paletteLoading, setPaletteLoading] = useState(false);
  const [paletteError, setPaletteError] = useState(null);

  useEffect(() => {
    if (!userId) return;

    const controller = new AbortController();

    async function fetchProfile() {
      try {
        const res = await fetch(
          `http://localhost:5001/profile?userId=${userId}`,
          { signal: controller.signal }
        );
        if (!res.ok) throw new Error("Network response was not ok");
        const data = await res.json();
        setProfile(data);
        // auto-generate palette if not present
        if (!data?.palette?.length) {
          requestPalette(userId);
        }
      } catch (err) {
        if (err.name !== "AbortError") {
          console.error("Profile fetch error:", err);
          setError("Could not load profile");
        }
      } finally {
        setLoading(false);
      }
    }

    fetchProfile();

    return () => controller.abort();
  }, [userId]);


  const requestPalette = async (id) => {
    if (!id) return;
    setPaletteLoading(true);
    setPaletteError(null);
    try {
      const res = await axios.post("http://localhost:5001/profile/colour", {
        userId: id,
      });
      console.log("Palette API response:", res.data);
      setProfile(prev => ({ ...prev, ...res.data }));
    } catch (err) {
      setPaletteError("Palette generation failed");
      console.error(err);
    } finally {
      setPaletteLoading(false);
    }
  };

  return (
    <div className="apple-page">
      <div className="apple-profile-container">
        {/* Left - Profile Card */}
        <div className="apple-profile-sidebar">
          <img
            src={profile?.user_photo ? `http://localhost:5001/uploads/${profile.user_photo}` : "https://via.placeholder.com/120"}
            alt="Profile"
            className="apple-avatar"
          />
          <h2 className="apple-mb-sm">{userName}</h2>
          <p className="apple-text-secondary apple-mb-lg">User</p>

          {loading ? (
            <div className="apple-loading">
              <div className="apple-loading-spinner"></div>
              Loading...
            </div>
          ) : error ? (
            <div className="apple-error">{error}</div>
          ) : profile ? (
            <div className="apple-profile-info">
              <div className="apple-profile-info-item">
                <span className="apple-profile-info-label">Height</span>
                <span className="apple-profile-info-value">{profile.height || "—"}</span>
              </div>
              <div className="apple-profile-info-item">
                <span className="apple-profile-info-label">Chest/Bust</span>
                <span className="apple-profile-info-value">{profile.chest || "—"}</span>
              </div>
              <div className="apple-profile-info-item">
                <span className="apple-profile-info-label">Weight</span>
                <span className="apple-profile-info-value">{profile.weight || "—"}</span>
              </div>
              <div className="apple-profile-info-item">
                <span className="apple-profile-info-label">Waist</span>
                <span className="apple-profile-info-value">{profile.waist || "—"}</span>
              </div>
              <div className="apple-profile-info-item">
                <span className="apple-profile-info-label">Gender</span>
                <span className="apple-profile-info-value">{profile.gender || "—"}</span>
              </div>
              <div className="apple-profile-info-item">
                <span className="apple-profile-info-label">Age</span>
                <span className="apple-profile-info-value">{profile.age || "—"}</span>
              </div>
            </div>
          ) : (
            <p className="apple-text-secondary">No profile found.</p>
          )}

          {paletteLoading && (
            <div className="apple-loading apple-mt-lg">
              <div className="apple-loading-spinner"></div>
              Analyzing colours...
            </div>
          )}
          {paletteError && (
            <div className="apple-error apple-mt-lg">{paletteError}</div>
          )}
          
          <button
            className="apple-button apple-mt-lg"
            style={{ width: "100%" }}
            onClick={() => navigate(`/my-wardrobe/${userId}`)}
          >
            View My Wardrobe
          </button>
          
          <button
            className="apple-button apple-mt-md"
            style={{ 
              width: "100%",
              background: "linear-gradient(135deg, var(--apple-blue), var(--apple-blue-hover))",
              fontWeight: "600"
            }}
            onClick={() => navigate('/stylist', { state: { userId } })}
          >
            🎨 Personal Stylist
          </button>
        </div>

        {/* Right - Content Tabs */}
        <div className="apple-profile-content">
          <div className="apple-tabs">
            <button
              className={`apple-tab ${tabValue === 0 ? 'active' : ''}`}
              onClick={() => setTabValue(0)}
            >
              Season
            </button>
            <button
              className={`apple-tab ${tabValue === 1 ? 'active' : ''}`}
              onClick={() => setTabValue(1)}
            >
              Undertones
            </button>
            <button
              className={`apple-tab ${tabValue === 2 ? 'active' : ''}`}
              onClick={() => setTabValue(2)}
            >
              Colour Palette
            </button>
          </div>

          <TabPanel value={tabValue} index={0}>
            {profile?.season ? (
              <div>
                <h3 className="apple-mb-md">Your Season</h3>
                <div className="apple-card" style={{ display: "inline-block", padding: "1rem 2rem" }}>
                  <h4 className="apple-text-primary" style={{ margin: 0 }}>{profile.season}</h4>
                </div>
              </div>
            ) : (
              <p className="apple-text-secondary">Season analysis not yet generated.</p>
            )}
          </TabPanel>

          <TabPanel value={tabValue} index={1}>
            {profile?.undertone ? (
              <div>
                <h3 className="apple-mb-md">Your Undertone</h3>
                <div className="apple-card" style={{ display: "inline-block", padding: "1rem 2rem" }}>
                  <h4 className="apple-text-primary" style={{ margin: 0 }}>{profile.undertone}</h4>
                </div>
              </div>
            ) : (
              <p className="apple-text-secondary">Undertone analysis not yet generated.</p>
            )}
          </TabPanel>

          <TabPanel value={tabValue} index={2}>
            {profile?.palette ? (
              <div>
                <h3 className="apple-mb-md">Your Colour Palette</h3>
                <div className="apple-color-palette">
                  {profile.palette.map((col, index) => (
                    <div
                      key={index}
                      className="apple-color-swatch"
                      style={{ backgroundColor: col }}
                      title={col}
                    />
                  ))}
                </div>
              </div>
            ) : (
              <p className="apple-text-secondary">Colour palette not yet generated.</p>
            )}
          </TabPanel>
        </div>
      </div>
    </div>
  );
};

export default Profile;