/***************************
 * CreateWardrobe.jsx
 ***************************/
import React, { useState } from "react";
import axios from "axios";
import { useLocation, useNavigate } from "react-router-dom";
import "../App.css";

// Example clothing types
const clothingTypes = ["Top", "Pants", "Dress", "Skirt", "Jacket", "Shoes", "Other"];
const topSizes = ["XS", "S", "M", "L", "XL", "XXL"];
const pantSizes = ["W24 L30", "W26 L32", "W28 L34", "W30 L32", "W32 L34", "W34 L32", "W36 L34"];
const seasons = ["Spring", "Summer", "Fall", "Winter", "All Seasons"];

const CreateWardrobe = () => {
  // If you have userId from Profile (passed via location.state)
  const location = useLocation();
  const navigate = useNavigate();
  // For example, location.state?.userId
  // For demo, assume userId=1
  const userId = location.state?.userId || 1;

  const [formData, setFormData] = useState({
    brand: "",
    clothingType: "",
    size: "",
    color: "",
    season: "",
    description: "",
  });
  const [imageFile, setImageFile] = useState(null);

  const getSizeOptions = () => {
    if (formData.clothingType === "Top" || formData.clothingType === "Dress" || formData.clothingType === "Jacket") {
      return topSizes;
    } else if (formData.clothingType === "Pants" || formData.clothingType === "Skirt") {
      return pantSizes;
    }
    // For shoes / other, you could customize or skip size
    return [];
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleFileChange = (e) => {
    setImageFile(e.target.files[0]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!imageFile) {
      alert("Please select an image file.");
      return;
    }

    // Build multipart form data
    const data = new FormData();
    data.append("image", imageFile);            // The file input
    data.append("userId", userId);
    data.append("brand", formData.brand);
    data.append("clothingType", formData.clothingType);
    data.append("size", formData.size);
    data.append("color", formData.color);
    data.append("season", formData.season);
    data.append("description", formData.description);

    try {
      const response = await axios.post("http://localhost:5001/wardrobe", data, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      console.log("Wardrobe item created:", response.data);
      alert("Wardrobe item added successfully!");
      // Navigate to MyWardrobe to see the new item
      navigate(`/my-wardrobe/${userId}`);
    } catch (error) {
      console.error("Error creating wardrobe item:", error);
      alert("Failed to create wardrobe item.");
    }
  };

  return (
    <div className="apple-page">
      <div className="apple-center">
        <div className="apple-form-container">
          <div className="apple-form-card">
            <div className="apple-form-header">
              <h1>Create Virtual Wardrobe</h1>
            </div>
            <form onSubmit={handleSubmit} encType="multipart/form-data">
              {/* Image Upload */}
              <div className="apple-form-group">
                <label className="apple-form-button file-upload-button">
                  Upload Image
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                    style={{ display: 'none' }}
                  />
                </label>
                {imageFile && (
                  <div className="file-preview">
                    <span>Selected File: {imageFile.name}</span>
                  </div>
                )}
              </div>

              {/* Brand */}
              <div className="apple-form-group">
                <label className="apple-form-label">Brand</label>
                <input
                  type="text"
                  className="apple-form-input"
                  name="brand"
                  value={formData.brand}
                  onChange={handleChange}
                  placeholder="Enter brand name"
                />
              </div>

              {/* Clothing Type */}
              <div className="apple-form-group">
                <label className="apple-form-label">Clothing Type</label>
                <select
                  className="apple-form-input"
                  name="clothingType"
                  value={formData.clothingType}
                  onChange={handleChange}
                >
                  <option value="">Select clothing type</option>
                  {clothingTypes.map(type => (
                    <option key={type} value={type}>
                      {type}
                    </option>
                  ))}
                </select>
              </div>

              {/* Size (dynamic based on clothingType) */}
              <div className="apple-form-group">
                <label className="apple-form-label">Size</label>
                <select
                  className="apple-form-input"
                  name="size"
                  value={formData.size}
                  onChange={handleChange}
                  disabled={!formData.clothingType}
                >
                  <option value="">Select size</option>
                  {getSizeOptions().map(sz => (
                    <option key={sz} value={sz}>
                      {sz}
                    </option>
                  ))}
                </select>
              </div>

              {/* Color */}
              <div className="apple-form-group">
                <label className="apple-form-label">Color</label>
                <input
                  type="text"
                  className="apple-form-input"
                  name="color"
                  value={formData.color}
                  onChange={handleChange}
                  placeholder="Enter color"
                />
              </div>

              {/* Season */}
              <div className="apple-form-group">
                <label className="apple-form-label">Season</label>
                <select
                  className="apple-form-input"
                  name="season"
                  value={formData.season}
                  onChange={handleChange}
                >
                  <option value="">Select season</option>
                  {seasons.map(s => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </select>
              </div>

              {/* Description */}
              <div className="apple-form-group">
                <label className="apple-form-label">Description</label>
                <textarea
                  className="apple-form-input"
                  name="description"
                  rows={3}
                  value={formData.description}
                  onChange={handleChange}
                  placeholder="Enter description"
                />
              </div>

              <button
                type="submit"
                className="apple-form-button"
              >
                Add to Wardrobe
              </button>
            </form>

            {/* Navigation Buttons */}
            <div className="apple-form-group" style={{ display: 'flex', gap: 'var(--apple-spacing-md)', marginTop: 'var(--apple-spacing-lg)' }}>
              <button
                type="button"
                className="apple-form-button secondary"
                onClick={() => navigate(`/my-wardrobe/${userId}`)}
                style={{ flex: 1 }}
              >
                My Wardrobe 
              </button>
              <button
                type="button"
                className="apple-form-button secondary"
                onClick={() => navigate('/profile', { state: { userId } })}
                style={{ flex: 1 }}
              >
                My Profile
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreateWardrobe;