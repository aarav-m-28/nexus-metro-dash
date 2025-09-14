
import os
from dotenv import load_dotenv
load_dotenv()
import requests
from fastapi import FastAPI, Request, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import google.generativeai as genai
from supabase import create_client, Client
from document_processor import DocumentProcessor

# Initialize Supabase client
SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_ANON_KEY")

if not SUPABASE_URL or not SUPABASE_KEY:
    raise ValueError("SUPABASE_URL and SUPABASE_ANON_KEY must be set in your .env file")

supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)

# Initialize document processor
document_processor = DocumentProcessor(SUPABASE_URL, SUPABASE_KEY)

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

class DocumentAnalysisRequest(BaseModel):
    document_id: str

class DocumentSearchRequest(BaseModel):
    query: str
    limit: int = 10

# Initialize Gemini API
GOOGLE_API_KEY = os.getenv("GOOGLE_API_KEY")
genai.configure(api_key=GOOGLE_API_KEY)

if not GOOGLE_API_KEY:
    print("Warning: GOOGLE_API_KEY is not set. AI features will not work.")




@app.post("/chat")
async def chat_endpoint(request: ChatRequest):
    user_message = request.message
    
    # Fetch a limited number of recent documents for context to avoid overly large prompts
    try:
        docs_response = supabase.table('documents').select('*').order('created_at', desc=True).limit(10).execute()
        docs = docs_response.data
    except Exception as e:
        docs = []
        print(f"Could not fetch documents for chat context: {e}")

    doc_summaries = ""
    if isinstance(docs, list) and len(docs) > 0:
        doc_summaries = "\n".join([
            f"- Title: {doc.get('title', 'Untitled')} (Department: {doc.get('department', 'N/A')}, Priority: {doc.get('priority', 'N/A')})"
            for doc in docs
        ])
        prompt = f"""You are Nexus AI, an intelligent assistant for KMRL (Kochi Metro Rail Limited) document management system. 
        
Available documents:
{doc_summaries}

User message: {user_message}

Based on the available documents and the user's message, provide a helpful and concise response. If the user is asking about a specific document, you can suggest they use the analysis feature for more details. Do not list the documents again in your response unless asked."""
    else:
        prompt = f"""You are Nexus AI, an intelligent assistant for KMRL (Kochi Metro Rail Limited) document management system. 
        
No documents are currently available in the system.

User message: {user_message}

Please help the user with their query and suggest they upload documents if they need document-specific assistance."""
    
    try:
        model = genai.GenerativeModel('models/gemini-1.5-flash')
        gemini_response = model.generate_content(prompt)
        response_text = gemini_response.text if hasattr(gemini_response, 'text') else str(gemini_response)
    except Exception as e:
        response_text = f"Gemini API error: {e}"
    
    return {"response": response_text}

@app.post("/analyze-document")
async def analyze_document(request: DocumentAnalysisRequest):
    """Analyze a specific document and return its content."""
    try:
        doc_content = document_processor.get_document_content(request.document_id)
        if not doc_content:
            raise HTTPException(status_code=404, detail="Document not found")
        
        if doc_content.get('error'):
            return {"error": doc_content['error'], "document": doc_content}
        
        # Create AI analysis of the document
        analysis_prompt = f"""Analyze this KMRL document and provide insights:

Title: {doc_content['title']}
Description: {doc_content.get('description', 'No description')}
Department: {doc_content.get('department', 'Unknown')}
Priority: {doc_content.get('priority', 'Normal')}
File Type: {doc_content['file_type']}

Content:
{doc_content.get('extracted_content', doc_content.get('content', 'No content available'))}

Please provide:
1. A brief summary of the document
2. Key points and important information
3. Any action items or recommendations
4. How this document relates to metro operations
"""
        
        try:
            model = genai.GenerativeModel('models/gemini-1.5-flash')
            analysis_response = model.generate_content(analysis_prompt)
            analysis_text = analysis_response.text if hasattr(analysis_response, 'text') else str(analysis_response)
        except Exception as e:
            analysis_text = f"Analysis error: {e}"
        
        return {
            "document": doc_content,
            "analysis": analysis_text
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error analyzing document: {str(e)}")

@app.post("/search-documents")
async def search_documents(request: DocumentSearchRequest):
    """Search documents by query."""
    try:
        results = document_processor.search_documents(request.query, request.limit)
        return {"documents": results, "query": request.query}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error searching documents: {str(e)}")

@app.get("/document/{document_id}")
async def get_document(document_id: str):
    """Get document details and content."""
    try:
        doc_content = document_processor.get_document_content(document_id)
        if not doc_content:
            raise HTTPException(status_code=404, detail="Document not found")
        return doc_content
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error getting document: {str(e)}")

@app.get("/documents/summary")
async def get_documents_summary():
    """Get summary of all documents for AI processing."""
    try:
        docs = fetch_documents()
        if isinstance(docs, dict) and docs.get('error'):
            return {"error": docs['error']}
        
        summaries = []
        for doc in docs[:10]:  # Limit to first 10 documents for performance
            summary = document_processor.get_document_summary(doc['id'])
            if summary:
                summaries.append(summary)
        
        return {"documents": summaries, "total": len(docs)}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error getting documents summary: {str(e)}")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
