# Nexus Metro Dashboard

A comprehensive document management system for KMRL (Kochi Metro Rail Limited) with AI-powered assistance.

## Features

- 📄 Document Management with Supabase
- 🤖 AI-Powered Document Assistant (Gemini AI)
- 🔐 User Authentication & Authorization
- 📱 Responsive Design
- 🎨 Modern UI with Tailwind CSS & shadcn/ui
- 📊 Document Analytics & Search
- 🔄 Real-time Updates

## Tech Stack

### Frontend
- React 18 + TypeScript
- Vite
- Tailwind CSS
- shadcn/ui components
- Supabase client
- React Router

### Backend
- FastAPI (Python)
- Google Gemini AI
- Supabase (Database)
- Uvicorn (ASGI server)

## Quick Start

### Prerequisites
- Node.js 18+
- Python 3.8+
- Supabase account
- Google AI API key

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd nexus-metro-dash
```

2. Install frontend dependencies:
```bash
npm install
```

3. Install AI backend dependencies:
```bash
npm run ai:install
```

4. Set up environment variables:
   - Copy `.env.example` to `.env` in the root directory
   - Copy `ai-backend/.env.example` to `ai-backend/.env`
   - Fill in your Supabase and Google AI API credentials

5. Start the development servers:
```bash
# Start both frontend and AI backend
npm run dev:full

# Or start them separately:
npm run dev          # Frontend only
npm run start:ai     # AI backend only
```

## Environment Variables

### Frontend (.env)
```env
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
VITE_AI_BACKEND_URL=http://localhost:8000
```

### AI Backend (ai-backend/.env)
```env
GOOGLE_API_KEY=your_google_gemini_api_key
SUPABASE_URL=your_supabase_url
SUPABASE_ANON_KEY=your_supabase_anon_key
```

## Project Structure

```
nexus-metro-dash/
├── src/                    # Frontend React app
│   ├── components/         # React components
│   │   ├── ai/            # AI chatbot components
│   │   ├── dashboard/     # Dashboard components
│   │   ├── documents/     # Document management
│   │   └── ui/            # shadcn/ui components
│   ├── hooks/             # Custom React hooks
│   ├── lib/               # Utilities and API services
│   └── pages/             # Page components
├── ai-backend/            # Python FastAPI backend
│   ├── main.py            # FastAPI application
│   ├── requirements.txt   # Python dependencies
│   └── README.md          # Backend documentation
└── supabase/              # Database migrations
```

## Available Scripts

- `npm run dev` - Start frontend development server
- `npm run build` - Build frontend for production
- `npm run ai:dev` - Start AI backend
- `npm run ai:install` - Install AI backend dependencies
- `npm run dev:full` - Start both frontend and AI backend
- `npm run start:ai` - Start AI backend with hot reload

## AI Assistant

The AI assistant is powered by Google's Gemini AI model and can:
- Answer questions about your documents
- Help find specific documents
- Provide document summaries
- Suggest relevant actions
- Analyze document content

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

This project is licensed under the MIT License.