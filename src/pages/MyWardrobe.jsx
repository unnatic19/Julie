import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate, useParams } from 'react-router-dom';
import Slider from 'react-slick';
import 'slick-carousel/slick/slick.css';
import 'slick-carousel/slick/slick-theme.css';
import '../App.css';

const MyWardrobe = () => {
  const { userId } = useParams();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState('grid'); // 'grid' or 'carousel'
  const [selectedItem, setSelectedItem] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    axios
      .get(`http://localhost:5001/wardrobe_items?userId=${userId}`)
      .then(res => setItems(res.data))
      .catch(err => {
        console.error(err);
        setError('Failed to load wardrobe items');
      })
      .finally(() => setLoading(false));
  }, [userId]);

  const carouselSettings = {
    dots: true,
    infinite: true,
    speed: 500,
    slidesToShow: 3,
    slidesToScroll: 1,
    autoplay: true,
    autoplaySpeed: 3000,
    pauseOnHover: true,
    responsive: [
      {
        breakpoint: 768,
        settings: {
          slidesToShow: 2,
          slidesToScroll: 1,
        }
      },
      {
        breakpoint: 480,
        settings: {
          slidesToShow: 1,
          slidesToScroll: 1,
        }
      }
    ]
  };

  const handleItemClick = (item) => {
    setSelectedItem(item);
    setShowModal(true);
  };

  const handleEditItem = (item) => {
    setEditingItem({ ...item });
    setShowModal(true);
  };

  const handleDeleteItem = async (itemId) => {
    if (window.confirm('Are you sure you want to delete this item?')) {
      try {
        await axios.delete(`http://localhost:5001/wardrobe_items/${itemId}`);
        setItems(items.filter(item => item.item_id !== itemId));
        setShowModal(false);
      } catch (err) {
        console.error('Error deleting item:', err);
        setError('Failed to delete item');
      }
    }
  };

  const handleSaveEdit = async () => {
    try {
      await axios.put(`http://localhost:5001/wardrobe_items/${editingItem.item_id}`, editingItem);
      setItems(items.map(item => 
        item.item_id === editingItem.item_id ? editingItem : item
      ));
      setEditingItem(null);
      setShowModal(false);
    } catch (err) {
      console.error('Error updating item:', err);
      setError('Failed to update item');
    }
  };

  const closeModal = () => {
    setShowModal(false);
    setSelectedItem(null);
    setEditingItem(null);
  };

  const getImageUrl = (item) => {
    // Try processed image first, fallback to original
    if (item.processed_image_path) {
      const processedFilename = item.processed_image_path.split('/').pop();
      return `http://localhost:5001/processed/${processedFilename}`;
    } else if (item.original_image_path) {
      const originalFilename = item.original_image_path.split('/').pop();
      return `http://localhost:5001/uploads/${originalFilename}`;
    }
    return null;
  };

  const renderWardrobeItem = (item, index) => {
    const imageUrl = getImageUrl(item);
    
    return (
      <div key={item.item_id} className="apple-wardrobe-item apple-card">
        <div className="apple-wardrobe-item-image-container">
          {imageUrl ? (
            <img
              src={imageUrl}
              alt={`${item.brand} ${item.clothing_type}`}
              onError={(e) => {
                // Try fallback image
                if (item.original_image_path && !e.target.src.includes('original')) {
                  const originalFilename = item.original_image_path.split('/').pop();
                  e.target.src = `http://localhost:5002/original/${originalFilename}`;
                } else {
                  e.target.style.display = 'none';
                }
              }}
            />
          ) : (
            <div className="apple-wardrobe-item-placeholder">
              <span>No Image</span>
            </div>
          )}
        </div>
        
        <div className="apple-wardrobe-item-content">
          <h3 className="apple-wardrobe-item-title">
            {item.brand} — {item.clothing_type}
          </h3>
          
          <div className="apple-wardrobe-item-details">
            {item.color && (
              <span className="apple-wardrobe-item-detail">
                <span className="apple-wardrobe-item-detail-label">Color:</span>
                <span className="apple-wardrobe-item-detail-value">{item.color}</span>
              </span>
            )}
            {item.season && (
              <span className="apple-wardrobe-item-detail">
                <span className="apple-wardrobe-item-detail-label">Season:</span>
                <span className="apple-wardrobe-item-detail-value">{item.season}</span>
              </span>
            )}
            {item.size && (
              <span className="apple-wardrobe-item-detail">
                <span className="apple-wardrobe-item-detail-label">Size:</span>
                <span className="apple-wardrobe-item-detail-value">{item.size}</span>
              </span>
            )}
          </div>
          
          <div className="apple-wardrobe-item-actions">
            <button
              className="apple-wardrobe-action-button apple-wardrobe-action-view"
              onClick={() => handleItemClick(item)}
            >
              View Details
            </button>
            <button
              className="apple-wardrobe-action-button apple-wardrobe-action-edit"
              onClick={() => handleEditItem(item)}
            >
              Edit
            </button>
            <button
              className="apple-wardrobe-action-button apple-wardrobe-action-delete"
              onClick={() => handleDeleteItem(item.item_id)}
            >
              Delete
            </button>
          </div>
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="apple-page">
        <div className="apple-container">
          <div className="apple-loading">
            <div className="apple-loading-spinner"></div>
            Loading your wardrobe...
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="apple-page">
      <div className="apple-container">
        <div className="apple-form-header">
          <button className="apple-back-button" onClick={() => navigate(-1)}>
            Back
          </button>
          <h1>My Wardrobe</h1>
          <p>Your personal collection of clothing items</p>
          
          {error && <div className="apple-error">{error}</div>}
        </div>

        {/* Add Items Button */}
        <div className="apple-wardrobe-actions">
          <button
            className="apple-form-button apple-wardrobe-add-button"
            onClick={() => navigate('/create-wardrobe', { state: { userId } })}
          >
            Add New Item
          </button>
          
          {items.length > 0 && (
            <div className="apple-wardrobe-view-toggle">
              <button
                className={`apple-wardrobe-toggle-button ${viewMode === 'grid' ? 'active' : ''}`}
                onClick={() => setViewMode('grid')}
              >
                Grid View
              </button>
              <button
                className={`apple-wardrobe-toggle-button ${viewMode === 'carousel' ? 'active' : ''}`}
                onClick={() => setViewMode('carousel')}
              >
                Carousel View
              </button>
            </div>
          )}
        </div>
        
        {items.length > 0 ? (
          <div className="apple-wardrobe-container">
            {viewMode === 'grid' ? (
              <div className="apple-wardrobe-grid">
                {items.map((item, index) => renderWardrobeItem(item, index))}
              </div>
            ) : (
              <div className="apple-wardrobe-carousel">
                <Slider {...carouselSettings}>
                  {items.map((item, index) => renderWardrobeItem(item, index))}
                </Slider>
              </div>
            )}
          </div>
        ) : (
          <div className="apple-wardrobe-empty">
            <div className="apple-wardrobe-empty-icon">👗</div>
            <h3>Your wardrobe is empty</h3>
            <p>Start building your collection by adding your first item!</p>
            <button
              className="apple-form-button"
              onClick={() => navigate('/create-wardrobe', { state: { userId } })}
            >
              Add Your First Item
            </button>
          </div>
        )}
      </div>

      {/* Item Details/Edit Modal */}
      {showModal && (
        <div className="apple-modal-overlay" onClick={closeModal}>
          <div className="apple-modal" onClick={(e) => e.stopPropagation()}>
            <div className="apple-modal-header">
              <h2>
                {editingItem ? 'Edit Item' : 'Item Details'}
              </h2>
              <button className="apple-modal-close" onClick={closeModal}>
                ×
              </button>
            </div>
            
            <div className="apple-modal-content">
              {editingItem ? (
                <div className="apple-modal-edit-form">
                  <div className="apple-form-group">
                    <label className="apple-form-label">Brand</label>
                    <input
                      type="text"
                      className="apple-form-input"
                      value={editingItem.brand || ''}
                      onChange={(e) => setEditingItem({...editingItem, brand: e.target.value})}
                    />
                  </div>
                  <div className="apple-form-group">
                    <label className="apple-form-label">Clothing Type</label>
                    <input
                      type="text"
                      className="apple-form-input"
                      value={editingItem.clothing_type || ''}
                      onChange={(e) => setEditingItem({...editingItem, clothing_type: e.target.value})}
                    />
                  </div>
                  <div className="apple-form-group">
                    <label className="apple-form-label">Color</label>
                    <input
                      type="text"
                      className="apple-form-input"
                      value={editingItem.color || ''}
                      onChange={(e) => setEditingItem({...editingItem, color: e.target.value})}
                    />
                  </div>
                  <div className="apple-form-group">
                    <label className="apple-form-label">Season</label>
                    <select
                      className="apple-form-input"
                      value={editingItem.season || ''}
                      onChange={(e) => setEditingItem({...editingItem, season: e.target.value})}
                    >
                      <option value="">Select Season</option>
                      <option value="Spring">Spring</option>
                      <option value="Summer">Summer</option>
                      <option value="Fall">Fall</option>
                      <option value="Winter">Winter</option>
                      <option value="All Season">All Season</option>
                    </select>
                  </div>
                  <div className="apple-form-group">
                    <label className="apple-form-label">Size</label>
                    <input
                      type="text"
                      className="apple-form-input"
                      value={editingItem.size || ''}
                      onChange={(e) => setEditingItem({...editingItem, size: e.target.value})}
                    />
                  </div>
                  <div className="apple-form-group">
                    <label className="apple-form-label">Description</label>
                    <textarea
                      className="apple-form-input"
                      rows="3"
                      value={editingItem.description || ''}
                      onChange={(e) => setEditingItem({...editingItem, description: e.target.value})}
                    />
                  </div>
                </div>
              ) : (
                <div className="apple-modal-details">
                  <div className="apple-modal-image">
                    {getImageUrl(selectedItem) ? (
                      <img
                        src={getImageUrl(selectedItem)}
                        alt={`${selectedItem.brand} ${selectedItem.clothing_type}`}
                        onError={(e) => {
                          if (selectedItem.original_image_path && !e.target.src.includes('original')) {
                            const originalFilename = selectedItem.original_image_path.split('/').pop();
                            e.target.src = `http://localhost:5002/original/${originalFilename}`;
                          } else {
                            e.target.style.display = 'none';
                          }
                        }}
                      />
                    ) : (
                      <div className="apple-modal-image-placeholder">
                        <span>No Image Available</span>
                      </div>
                    )}
                  </div>
                  
                  <div className="apple-modal-info">
                    <div className="apple-modal-info-item">
                      <strong>Brand:</strong> {selectedItem.brand || 'N/A'}
                    </div>
                    <div className="apple-modal-info-item">
                      <strong>Type:</strong> {selectedItem.clothing_type || 'N/A'}
                    </div>
                    <div className="apple-modal-info-item">
                      <strong>Color:</strong> {selectedItem.color || 'N/A'}
                    </div>
                    <div className="apple-modal-info-item">
                      <strong>Season:</strong> {selectedItem.season || 'N/A'}
                    </div>
                    <div className="apple-modal-info-item">
                      <strong>Size:</strong> {selectedItem.size || 'N/A'}
                    </div>
                    {selectedItem.description && (
                      <div className="apple-modal-info-item">
                        <strong>Description:</strong> {selectedItem.description}
                      </div>
                    )}
                    {selectedItem.created_at && (
                      <div className="apple-modal-info-item">
                        <strong>Added:</strong> {new Date(selectedItem.created_at).toLocaleDateString()}
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
            
            <div className="apple-modal-actions">
              {editingItem ? (
                <>
                  <button
                    className="apple-form-button"
                    onClick={handleSaveEdit}
                  >
                    Save Changes
                  </button>
                  <button
                    className="apple-form-button apple-form-button-secondary"
                    onClick={closeModal}
                  >
                    Cancel
                  </button>
                </>
              ) : (
                <>
                  <button
                    className="apple-form-button"
                    onClick={() => handleEditItem(selectedItem)}
                  >
                    Edit Item
                  </button>
                  <button
                    className="apple-form-button apple-form-button-secondary"
                    onClick={closeModal}
                  >
                    Close
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MyWardrobe;