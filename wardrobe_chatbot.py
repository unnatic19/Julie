import os
import json
import requests
from typing import Dict, List, Any
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from openai import OpenAI

# Initialize OpenAI client
openai_api_key = os.getenv("OPENAI_API_KEY")
if not openai_api_key:
    raise ValueError("OPENAI_API_KEY environment variable is required")

client = OpenAI(api_key=openai_api_key)

app = FastAPI(title="Wardrobe Chatbot Service")

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:5174", "http://localhost:5175"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Backend API base URL
BACKEND_URL = "http://localhost:5001"

class ChatMessage(BaseModel):
    text: str
    isBot: bool
    timestamp: str

class ChatRequest(BaseModel):
    message: str
    userId: int
    chatHistory: List[ChatMessage] = []

class ChatResponse(BaseModel):
    response: str

def get_user_wardrobe(user_id: int) -> List[Dict]:
    """Fetch user's wardrobe items from backend API"""
    try:
        response = requests.get(f"{BACKEND_URL}/wardrobe_items", params={"userId": user_id})
        if response.status_code == 200:
            return response.json()
        return []
    except Exception as e:
        print(f"Wardrobe API error: {e}")
        return []

def get_user_profile(user_id: int) -> Dict:
    """Fetch user's profile information from backend API"""
    try:
        response = requests.get(f"{BACKEND_URL}/profile", params={"userId": user_id})
        if response.status_code == 200:
            return response.json()
        return {}
    except Exception as e:
        print(f"Profile API error: {e}")
        return {}

def create_wardrobe_context(wardrobe_items: List[Dict], profile: Dict) -> str:
    """Create a context string about the user's wardrobe and profile"""
    context = "User's Wardrobe and Style Profile:\n\n"
    
    # Add profile information
    if profile:
        context += "PERSONAL PROFILE:\n"
        if profile.get('gender'):
            context += f"- Gender: {profile['gender']}\n"
        if profile.get('age'):
            context += f"- Age: {profile['age']}\n"
        if profile.get('height'):
            context += f"- Height: {profile['height']}\n"
        if profile.get('season'):
            context += f"- Color Season: {profile['season']}\n"
        if profile.get('undertone'):
            context += f"- Undertone: {profile['undertone']}\n"
        if profile.get('palette'):
            colors = ', '.join(profile['palette'][:6]) if isinstance(profile['palette'], list) else str(profile['palette'])
            context += f"- Personal Color Palette: {colors}\n"
        context += "\n"
    
    # Add wardrobe items
    if wardrobe_items:
        context += f"WARDROBE ITEMS ({len(wardrobe_items)} items):\n"
        for i, item in enumerate(wardrobe_items, 1):
            context += f"{i}. {item.get('clothing_type', 'Item')} by {item.get('brand', 'Unknown')}\n"
            context += f"   - Color: {item.get('color', 'Not specified')}\n"
            context += f"   - Size: {item.get('size', 'Not specified')}\n"
            context += f"   - Season: {item.get('season', 'Not specified')}\n"
            if item.get('description'):
                context += f"   - Description: {item['description']}\n"
            context += "\n"
    else:
        context += "WARDROBE: No items found. User may need to add clothing items to their wardrobe.\n\n"
    
    return context

@app.post("/chat", response_model=ChatResponse)
async def chat_with_wardrobe(request: ChatRequest):
    """Chat endpoint that provides style advice based on user's wardrobe"""
    try:
        # Get user's wardrobe and profile data
        wardrobe_items = get_user_wardrobe(request.userId)
        profile = get_user_profile(request.userId)
        
        # Create context about the user's wardrobe
        wardrobe_context = create_wardrobe_context(wardrobe_items, profile)
        
        # System prompt for the style assistant
        system_prompt = """You are Julie, a professional personal style assistant and wardrobe consultant. You have access to the user's complete wardrobe inventory and personal style profile.

Your expertise includes:
- Personal styling and outfit coordination
- Color theory and seasonal color analysis
- Fashion trends and style advice
- Wardrobe organization and planning
- Shopping recommendations
- Occasion-appropriate dressing

Guidelines:
- Be friendly, helpful, and enthusiastic about fashion
- Reference specific items from their wardrobe when giving advice
- Consider their personal color palette and season when making suggestions
- Provide practical, actionable advice
- Ask clarifying questions when needed
- Suggest outfit combinations using their existing pieces
- Recommend additions to fill wardrobe gaps
- Be encouraging and positive about their style journey
- IMPORTANT: Keep responses to 1-2 lines maximum. Be concise but helpful.
- When suggesting outfits, mention specific items from their wardrobe by brand and type (e.g., "your blue Zara dress", "that black Nike top")

If the user has no wardrobe items, encourage them to start building their digital wardrobe and offer general style advice."""

        # Prepare messages for ChatGPT with history
        messages = [
            {"role": "system", "content": system_prompt},
            {"role": "system", "content": wardrobe_context}
        ]
        
        # Add chat history (keep last 10 messages for context)
        recent_history = request.chatHistory[-10:] if len(request.chatHistory) > 10 else request.chatHistory
        for msg in recent_history:
            role = "assistant" if msg.isBot else "user"
            messages.append({"role": role, "content": msg.text})
        
        # Add current message
        messages.append({"role": "user", "content": request.message})
        
        # Call OpenAI API
        response = client.chat.completions.create(
            model="gpt-4o-mini",
            messages=messages,
            max_tokens=100,  # Limit tokens for shorter responses
            temperature=0.7
        )
        
        bot_response = response.choices[0].message.content
        
        return ChatResponse(response=bot_response)
        
    except Exception as e:
        print(f"Chat error: {e}")
        raise HTTPException(status_code=500, detail="Chat service error")

@app.get("/health")
async def health_check():
    """Health check endpoint"""
    return {"status": "healthy", "service": "wardrobe_chatbot"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="127.0.0.1", port=8002)