
import os
from dotenv import load_dotenv
load_dotenv()
import requests
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import google.generativeai as genai

# Example function to fetch documents from JS backend
def fetch_documents():
    try:
        response = requests.get('http://localhost:3000/documents')  # Update port/path as needed
        response.raise_for_status()
        return response.json()
    except Exception as e:
        return {"error": str(e)}


app = FastAPI()

# Allow CORS for frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class ChatRequest(BaseModel):
    message: str


# Initialize Gemini API
GOOGLE_API_KEY = os.getenv("GOOGLE_API_KEY")
genai.configure(api_key=GOOGLE_API_KEY)



@app.post("/chat")
async def chat_endpoint(request: ChatRequest):
    user_message = request.message
    docs = fetch_documents()
    # Prepare document info for prompt
    doc_summaries = ""
    if isinstance(docs, list) and len(docs) > 0:
        doc_summaries = "
".join([f"Title: {doc.title}, Description: {doc.description}" for doc in docs])
        prompt = f"You are an assistant. Here are some document titles and descriptions: {doc_summaries}.
User message: {user_message}"
    else:
        prompt = f"You are an assistant. No documents are available. Please answer the user's question: {user_message}"
    try:
        model = genai.GenerativeModel('models/gemini-1.5-flash')
        gemini_response = model.generate_content(prompt)
        response_text = gemini_response.text if hasattr(gemini_response, 'text') else str(gemini_response)
    except Exception as e:
        response_text = f"Gemini API error: {e}"
    return {"response": response_text, "documents": docs}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
