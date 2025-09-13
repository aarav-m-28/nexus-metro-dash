# AI Backend for Nexus Metro Dashboard

This is the AI backend service that provides intelligent document assistance using Google's Gemini AI model.

## Setup

1. Install Python dependencies:
```bash
pip install -r requirements.txt
```

2. Create a `.env` file in the `ai-backend` directory with the following variables:
```env
GOOGLE_API_KEY=your_google_gemini_api_key_here
SUPABASE_URL=your_supabase_url_here
SUPABASE_ANON_KEY=your_supabase_anon_key_here
```

3. Run the backend:
```bash
python main.py
```

Or using uvicorn directly:
```bash
uvicorn main:app --host 0.0.0.0 --port 8000 --reload
```

## API Endpoints

- `POST /chat` - Send a message to the AI assistant
  - Request body: `{"message": "your question here"}`
  - Response: `{"response": "AI response", "documents": [...]}`

## Integration

The frontend connects to this backend via the `VITE_AI_BACKEND_URL` environment variable (defaults to `http://localhost:8000`).

## Dependencies

- FastAPI - Web framework
- Uvicorn - ASGI server
- Google Generative AI - AI model
- Supabase - Database client
- Python-dotenv - Environment variable management
