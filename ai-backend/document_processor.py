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
            # Search in document metadata
            response = self.supabase.table('documents').select('*').ilike('title', f'%{query}%').limit(limit).execute()
            documents = response.data or []
            
            # Also search in descriptions
            desc_response = self.supabase.table('documents').select('*').ilike('description', f'%{query}%').limit(limit).execute()
            desc_docs = desc_response.data or []
            
            # Combine and deduplicate
            all_docs = documents + [doc for doc in desc_docs if doc['id'] not in [d['id'] for d in documents]]
            
            return all_docs[:limit]
            
        except Exception as e:
            print(f"Error searching documents: {e}")
            return []
    
    def get_document_summary(self, document_id: str) -> Optional[Dict[str, Any]]:
        """Get a summary of document content for AI processing."""
        doc_content = self.get_document_content(document_id)
        if not doc_content or doc_content.get('error'):
            return doc_content
        
        # Create a summary for AI processing
        summary = {
            'id': doc_content['id'],
            'title': doc_content['title'],
            'description': doc_content['description'],
            'department': doc_content.get('department', ''),
            'priority': doc_content.get('priority', ''),
            'file_type': doc_content['file_type'],
            'file_name': doc_content.get('file_name', ''),
            'created_at': doc_content.get('created_at', ''),
            'content_preview': '',
            'has_file_content': bool(doc_content.get('extracted_content')),
            'file_content_length': 0
        }
        
        # Add content preview
        content = doc_content.get('content', '') or doc_content.get('extracted_content', '')
        if content:
            summary['content_preview'] = content[:500] + '...' if len(content) > 500 else content
            summary['file_content_length'] = len(content)
        
        return summary
