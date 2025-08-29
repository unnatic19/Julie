/***************************
 * Stylist.jsx
 ***************************/
import React, { useState, useRef, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios';
import '../App.css';

const Stylist = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const userId = location.state?.userId || 1;
  const messagesEndRef = useRef(null);

  const [messages, setMessages] = useState([
    {
      id: 1,
      text: "Welcome to your personal styling session! I'm here to help you create amazing outfits from your wardrobe. What occasion are you dressing for today?",
      isBot: true,
      timestamp: new Date(),
      mentionedItems: []
    }
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [wardrobeItems, setWardrobeItems] = useState([]);

  // Fetch user's wardrobe items
  useEffect(() => {
    const fetchWardrobe = async () => {
      try {
        const response = await axios.get(`http://localhost:5001/wardrobe_items?userId=${userId}`);
        setWardrobeItems(response.data);
      } catch (error) {
        console.error('Error fetching wardrobe:', error);
      }
    };
    fetchWardrobe();
  }, [userId]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Parse GPT response to extract mentioned items
  const parseMessageForItems = (messageText) => {
    const mentionedItems = [];
    
    wardrobeItems.forEach(item => {
      const itemDescriptors = [
        `${item.color} ${item.brand}`.toLowerCase(),
        `${item.color} ${item.clothing_type}`.toLowerCase(),
        `${item.brand} ${item.clothing_type}`.toLowerCase(),
        item.brand?.toLowerCase(),
        `${item.color}`.toLowerCase()
      ].filter(Boolean);

      const hasMatch = itemDescriptors.some(descriptor => 
        messageText.toLowerCase().includes(descriptor) && descriptor.length > 3
      );

      if (hasMatch && !mentionedItems.find(mi => mi.item_id === item.item_id)) {
        mentionedItems.push(item);
      }
    });

    return mentionedItems;
  };

  const getImageUrl = (item) => {
    if (item.processed_image_path) {
      const processedFilename = item.processed_image_path.split('/').pop();
      return `http://localhost:5001/processed/${processedFilename}`;
    } else if (item.original_image_path) {
      const originalFilename = item.original_image_path.split('/').pop();
      return `http://localhost:5001/uploads/${originalFilename}`;
    }
    return null;
  };

  const sendMessage = async () => {
    if (!inputMessage.trim() || isLoading) return;

    const userMessage = {
      id: Date.now(),
      text: inputMessage,
      isBot: false,
      timestamp: new Date(),
      mentionedItems: []
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setIsLoading(true);

    try {
      const response = await axios.post('http://localhost:8002/chat', {
        message: inputMessage,
        userId: userId,
        chatHistory: messages.map(msg => ({
          text: msg.text,
          isBot: msg.isBot,
          timestamp: msg.timestamp.toISOString()
        }))
      });

      const botResponseText = response.data.response;
      const mentionedItems = parseMessageForItems(botResponseText);

      const botMessage = {
        id: Date.now() + 1,
        text: botResponseText,
        isBot: true,
        timestamp: new Date(),
        mentionedItems: mentionedItems
      };

      setMessages(prev => [...prev, botMessage]);
    } catch (error) {
      console.error('Chat error:', error);
      const errorMessage = {
        id: Date.now() + 1,
        text: "Sorry, I'm having trouble connecting right now. Please try again later.",
        isBot: true,
        timestamp: new Date(),
        mentionedItems: []
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      sendMessage();
    }
  };

  return (
    <div className="stylist-page">
      {/* Header */}
      <div className="stylist-header">
        <button 
          className="apple-back-button"
          onClick={() => navigate('/profile', { state: { userId } })}
        >
          ← Back to Profile
        </button>
        <h1>Personal Stylist</h1>
      </div>

      {/* Main Chat Area */}
      <div className="stylist-container">
        {/* Messages */}
        <div className="stylist-messages">
          {messages.map((message) => (
            <div key={message.id} className="stylist-message-container">
              <div 
                className={`stylist-message ${message.isBot ? 'bot-message' : 'user-message'}`}
              >
                <div className="message-bubble">
                  {message.text}
                </div>
                <div className="message-time">
                  {message.timestamp.toLocaleTimeString([], { 
                    hour: '2-digit', 
                    minute: '2-digit' 
                  })}
                </div>
              </div>

              {/* Display mentioned items */}
              {message.mentionedItems && message.mentionedItems.length > 0 && (
                <div className="mentioned-items">
                  <h4>Suggested Items:</h4>
                  <div className="mentioned-items-grid">
                    {message.mentionedItems.map((item) => (
                      <div key={item.item_id} className="mentioned-item">
                        <div className="mentioned-item-image">
                          {getImageUrl(item) ? (
                            <img 
                              src={getImageUrl(item)} 
                              alt={`${item.brand} ${item.clothing_type}`}
                              onError={(e) => {
                                e.target.style.display = 'none';
                                e.target.nextSibling.style.display = 'flex';
                              }}
                            />
                          ) : null}
                          <div className="image-placeholder" style={{display: getImageUrl(item) ? 'none' : 'flex'}}>
                            👕
                          </div>
                        </div>
                        <div className="mentioned-item-details">
                          <h5>{item.brand} {item.clothing_type}</h5>
                          <p>{item.color} • {item.size}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ))}
          
          {isLoading && (
            <div className="stylist-message bot-message">
              <div className="message-bubble typing-indicator">
                <span></span>
                <span></span>
                <span></span>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <div className="stylist-input">
          <input
            type="text"
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Ask me about styling your outfits..."
            disabled={isLoading}
            className="stylist-chat-input"
          />
          <button 
            onClick={sendMessage}
            disabled={isLoading || !inputMessage.trim()}
            className="stylist-send-button"
          >
            {isLoading ? '⏳' : '➤'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default Stylist;