
import os
from dotenv import load_dotenv
load_dotenv()
import requests
<<<<<<< HEAD
from fastapi import FastAPI, Request, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import google.generativeai as genai
from supabase import create_client, Client
from document_processor import DocumentProcessor

# Initialize Supabase client
SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_ANON_KEY")
supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)

# Initialize document processor
document_processor = DocumentProcessor(SUPABASE_URL, SUPABASE_KEY)

# Function to fetch documents from Supabase
def fetch_documents():
    try:
        response = supabase.table('documents').select('*').execute()
        return response.data
=======
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
>>>>>>> cfd1ebe2a973c94df3d5a452d6505f2168c6e4e0
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

<<<<<<< HEAD
class DocumentAnalysisRequest(BaseModel):
    document_id: str

class DocumentSearchRequest(BaseModel):
    query: str
    limit: int = 10

=======
>>>>>>> cfd1ebe2a973c94df3d5a452d6505f2168c6e4e0

# Initialize Gemini API
GOOGLE_API_KEY = os.getenv("GOOGLE_API_KEY")
genai.configure(api_key=GOOGLE_API_KEY)



@app.post("/chat")
async def chat_endpoint(request: ChatRequest):
    user_message = request.message
    docs = fetch_documents()
<<<<<<< HEAD
    
    # Prepare document info for prompt with content previews
    doc_summaries = ""
    if isinstance(docs, list) and len(docs) > 0:
        doc_summaries = "\n".join([
            f"Title: {doc.get('title', 'Untitled')}, "
            f"Department: {doc.get('department', 'Unknown')}, "
            f"Priority: {doc.get('priority', 'Normal')}, "
            f"File Type: {doc.get('file_type', 'Unknown')}, "
            f"Description: {doc.get('description', 'No description')}, "
            f"Content Preview: {doc.get('content', 'No content available')[:200]}..."
            for doc in docs
        ])
        prompt = f"""You are Nexus AI, an intelligent assistant for KMRL (Kochi Metro Rail Limited) document management system. 
        
Available documents:
{doc_summaries}

User message: {user_message}

Please provide helpful responses about these documents, help users find relevant information, and assist with document management tasks. Be specific about document titles, departments, and priorities when relevant. You can reference document content and help users understand what's in their documents."""
    else:
        prompt = f"""You are Nexus AI, an intelligent assistant for KMRL (Kochi Metro Rail Limited) document management system. 
        
No documents are currently available in the system.

User message: {user_message}

Please help the user with their query and suggest they upload documents if they need document-specific assistance."""
    
=======
    # Prepare document info for prompt
    doc_summaries = ""
    if isinstance(docs, list) and len(docs) > 0:
        doc_summaries = "
".join([f"Title: {doc.title}, Description: {doc.description}" for doc in docs])
        prompt = f"You are an assistant. Here are some document titles and descriptions: {doc_summaries}.
User message: {user_message}"
    else:
        prompt = f"You are an assistant. No documents are available. Please answer the user's question: {user_message}"
>>>>>>> cfd1ebe2a973c94df3d5a452d6505f2168c6e4e0
    try:
        model = genai.GenerativeModel('models/gemini-1.5-flash')
        gemini_response = model.generate_content(prompt)
        response_text = gemini_response.text if hasattr(gemini_response, 'text') else str(gemini_response)
    except Exception as e:
        response_text = f"Gemini API error: {e}"
<<<<<<< HEAD
    
    return {"response": response_text, "documents": docs}

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

=======
    return {"response": response_text, "documents": docs}

>>>>>>> cfd1ebe2a973c94df3d5a452d6505f2168c6e4e0
if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
