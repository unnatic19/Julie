# ⚠️ SECURITY NOTICE

This repository contains API keys that should be replaced before deployment:

## Files containing API keys that need attention:

1. **wardrobe_chatbot.py** - Line 11: OpenAI API key
2. **colour-service/analyse_service.py** - Line 6: OpenAI API key  
3. **backend/server.js** - Line 16: Remove.bg API key
4. **backend/server.js** - Lines 38-43: PostgreSQL database credentials

## Before deploying:

1. Replace all API keys with environment variables
2. Use a `.env` file for local development
3. Set environment variables in your hosting platform
4. Never commit real API keys to version control

## Example environment variable setup:

```bash
# .env file
OPENAI_API_KEY=your_openai_key_here
REMOVE_BG_API_KEY=your_remove_bg_key_here
DB_PASSWORD=your_db_password_here
DB_HOST=localhost
DB_NAME=Wardrobe
DB_USER=postgres
DB_PORT=5432
```

## Get API keys:
- OpenAI: https://platform.openai.com/api-keys
- Remove.bg: https://www.remove.bg/api
