# Julie - AI-Powered Personal Wardrobe Assistant

Julie is a comprehensive wardrobe management and personal styling application that combines AI-powered color analysis, outfit recommendations, and intelligent chatbot assistance to help users curate and manage their personal style.

## 🌟 Features

### 📱 Core Functionality
- **Digital Wardrobe Management**: Upload and organize clothing items with automatic background removal
- **AI Color Analysis**: Personalized color palette generation based on skin tone, undertone, and seasonal analysis
- **Smart Styling Assistant**: ChatGPT-powered chatbot that provides outfit recommendations using your wardrobe
- **User Profiles**: Complete style profiles with measurements, preferences, and color analysis
- **Multi-page Application**: Landing, login, profile creation, wardrobe management, and styling pages

### 🤖 AI-Powered Features
- **Intelligent Chatbot**: Get personalized style advice based on your actual wardrobe items
- **Color Season Analysis**: AI determines your color season (Spring, Summer, Autumn, Winter)
- **Undertone Detection**: Identifies warm/cool undertones for better color matching
- **Personalized Palette**: Custom color recommendations that complement your features

### 🖼️ Image Processing
- **Background Removal**: Automatic background removal for clothing items using Remove.bg API
- **Image Upload**: Support for various image formats with secure file handling
- **Processed Image Storage**: Organized storage of original and processed images

## 🏗️ Architecture

### Frontend (React + Vite)
- **Framework**: React 18 with modern hooks and functional components
- **Routing**: React Router DOM for multi-page navigation
- **UI Library**: Material-UI (MUI) for consistent design
- **Styling**: CSS modules with responsive design
- **Build Tool**: Vite for fast development and optimized builds

### Backend Services

#### 1. Main Backend (Node.js/Express)
- **Framework**: Express.js with RESTful API design
- **Database**: PostgreSQL with connection pooling
- **Authentication**: Bcrypt for secure password hashing
- **File Upload**: Multer for multipart form handling
- **Image Processing**: Remove.bg integration for background removal

#### 2. AI Chatbot Service (Python/FastAPI)
- **Framework**: FastAPI for high-performance API
- **AI Integration**: OpenAI GPT-4 for intelligent conversations
- **Context Awareness**: Wardrobe-aware responses using user's actual items
- **CORS Support**: Cross-origin requests for frontend integration

#### 3. Color Analysis Service (Python/FastAPI)
- **AI Vision**: OpenAI GPT-4 Vision for image analysis
- **Color Theory**: Professional color analysis algorithms
- **JSON Responses**: Structured color palette and season data

## 🚀 Getting Started

### Prerequisites
- Node.js (v16 or higher)
- Python (v3.8 or higher)
- PostgreSQL database
- OpenAI API key
- Remove.bg API key

### Database Setup
Create a PostgreSQL database named `Wardrobe` with the following tables:
- `users` - User authentication and basic info
- `profile` - User profiles with measurements and color analysis
- `wardrobe_items` - Clothing items with metadata

### Installation

1. **Clone the repository**
   ```bash
   git clone git@github.com:unnatic19/Julie.git
   cd Julie
   ```

2. **Frontend Setup**
   ```bash
   npm install
   npm run dev
   ```

3. **Backend Setup**
   ```bash
   cd backend
   npm install
   # Update database credentials in server.js
   node server.js
   ```

4. **Chatbot Service**
   ```bash
   pip install -r chatbot_requirements.txt
   # Update OpenAI API key in wardrobe_chatbot.py
   python wardrobe_chatbot.py
   ```

5. **Color Analysis Service**
   ```bash
   cd colour-service
   pip install -r requirements.txt
   # Update OpenAI API key in analyse_service.py
   python analyse_service.py
   ```

### Environment Configuration
- **OpenAI API Key**: Required for AI chatbot and color analysis
- **Remove.bg API Key**: Required for background removal
- **Database Credentials**: PostgreSQL connection details
- **CORS Origins**: Configure allowed frontend URLs

## 📡 API Endpoints

### Authentication
- `POST /signup` - User registration
- `POST /login` - User authentication

### Profile Management
- `POST /profile` - Create/update user profile
- `GET /profile` - Retrieve user profile
- `POST /profile/photo` - Upload profile photo
- `POST /profile/colour` - Generate color analysis

### Wardrobe Management
- `POST /wardrobe` - Add new clothing item
- `GET /wardrobe_items` - Retrieve user's wardrobe
- `GET /wardrobe/:userId` - Get wardrobe by user ID

### AI Services
- `POST /chat` - Chatbot conversation endpoint
- `POST /analyze` - Color analysis endpoint

## 🎨 Technology Stack

### Frontend
- React 18
- React Router DOM
- Material-UI (MUI)
- Axios for API calls
- Vite build tool

### Backend
- Node.js with Express
- PostgreSQL database
- Multer for file uploads
- Bcrypt for authentication
- Remove.bg for image processing

### AI Services
- Python with FastAPI
- OpenAI GPT-4 & GPT-4 Vision
- PIL for image processing
- JSON response formatting

## 🔧 Development

### Running in Development Mode
```bash
# Frontend (runs on localhost:5173)
npm run dev

# Backend (runs on localhost:5001)
cd backend && node server.js

# Chatbot Service (runs on localhost:8002)
python wardrobe_chatbot.py

# Color Service (runs on localhost:8001)
cd colour-service && python analyse_service.py
```

### Building for Production
```bash
npm run build
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🙏 Acknowledgments

- OpenAI for GPT-4 and vision capabilities
- Remove.bg for background removal API
- Material-UI for the component library
- FastAPI for the high-performance Python framework
