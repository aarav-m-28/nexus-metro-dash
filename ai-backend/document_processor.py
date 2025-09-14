import os
import io
import requests
from typing import Optional, Dict, Any
import PyPDF2
import pypdf
from supabase import create_client, Client

class DocumentProcessor:
    def __init__(self, supabase_url: str, supabase_key: str):
        self.supabase: Client = create_client(supabase_url, supabase_key)
    
    def extract_text_from_pdf(self, file_content: bytes) -> str:
        """Extract text content from PDF file."""
        try:
            # Try with pypdf first (more modern)
            pdf_reader = pypdf.PdfReader(io.BytesIO(file_content))
            text = ""
            for page in pdf_reader.pages:
                text += page.extract_text() + "\n"
            return text.strip()
        except Exception as e:
            try:
                # Fallback to PyPDF2
                pdf_reader = PyPDF2.PdfReader(io.BytesIO(file_content))
                text = ""
                for page in pdf_reader.pages:
                    text += page.extract_text() + "\n"
                return text.strip()
            except Exception as e2:
                print(f"Error extracting PDF text: {e2}")
                return f"Error extracting PDF content: {str(e2)}"
    
    def extract_text_from_txt(self, file_content: bytes) -> str:
        """Extract text content from plain text file."""
        try:
            # Try different encodings
            for encoding in ['utf-8', 'latin-1', 'cp1252']:
                try:
                    return file_content.decode(encoding)
                except UnicodeDecodeError:
                    continue
            return "Error: Could not decode text file"
        except Exception as e:
            return f"Error extracting text content: {str(e)}"
    
    def get_document_content(self, document_id: str) -> Optional[Dict[str, Any]]:
        """Get document content from Supabase storage."""
        try:
            # Get document metadata
            doc_response = self.supabase.table('documents').select('*').eq('id', document_id).execute()
            if not doc_response.data:
                return None
            
            document = doc_response.data[0]
            storage_path = document.get('storage_path')
            file_type = document.get('file_type', '')
            
            if not storage_path:
                return {
                    'id': document['id'],
                    'title': document['title'],
                    'description': document.get('description', ''),
                    'content': document.get('content', ''),
                    'file_type': file_type,
                    'extracted_content': None,
                    'error': 'No file attached'
                }
            
            # Download file from storage
            file_response = self.supabase.storage.from_('documents').download(storage_path)
            if not file_response:
                return {
                    'id': document['id'],
                    'title': document['title'],
                    'description': document.get('description', ''),
                    'content': document.get('content', ''),
                    'file_type': file_type,
                    'extracted_content': None,
                    'error': 'Could not download file'
                }
            
            # Extract content based on file type
            extracted_content = None
            if file_type == 'application/pdf':
                extracted_content = self.extract_text_from_pdf(file_response)
            elif file_type.startswith('text/'):
                extracted_content = self.extract_text_from_txt(file_response)
            elif file_type in ['application/json', 'application/xml']:
                extracted_content = self.extract_text_from_txt(file_response)
            else:
                extracted_content = f"File type {file_type} not supported for content extraction"
            
            return {
                'id': document['id'],
                'title': document['title'],
                'description': document.get('description', ''),
                'content': document.get('content', ''),
                'file_type': file_type,
                'extracted_content': extracted_content,
                'department': document.get('department', ''),
                'priority': document.get('priority', ''),
                'created_at': document.get('created_at', ''),
                'file_name': document.get('file_name', '')
            }
            
        except Exception as e:
            print(f"Error processing document {document_id}: {e}")
            return {
                'id': document_id,
                'error': f"Error processing document: {str(e)}"
            }
    
    def search_documents(self, query: str, limit: int = 10) -> list:
        """Search documents by title, description, or content."""
        try:
            # Use a single query with an 'or' filter for efficiency.
            # This searches for the query in either the title or the description.
            response = (
                self.supabase.table('documents')
                .select('*')
                .or_(f'title.ilike.%{query}%,description.ilike.%{query}%')
                .limit(limit)
                .execute()
            )
            return response.data or []
            
        except Exception as e:
            print(f"Error searching documents: {e}")
            return []
    
    def get_document_summary(self, document_id: str) -> Optional[Dict[str, Any]]:
        """
        Fetches a brief summary of a document by its ID directly from the database.
        This is a lightweight and efficient alternative to get_document_content.
        """
        try:
            # Select only the fields needed for a summary to avoid downloading files.
            result = self.supabase.table('documents').select(
                'id, title, description, department, priority, file_type, file_name, created_at, storage_path'
            ).eq('id', document_id).single().execute()

            if result.data:
                doc = result.data
                # Create a summary object matching the frontend's expectations.
                summary = {
                    **doc,
                    'content_preview': (doc.get('description') or 'No description available.')[:200] + '...',
                    'has_file_content': bool(doc.get('storage_path')),
                    'file_content_length': 0  # This can't be determined without downloading.
                }
                return summary
            else:
                return None
        except Exception as e:
            print(f"Error fetching document summary for {document_id}: {e}")
            return None
