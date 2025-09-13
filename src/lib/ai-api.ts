interface ChatRequest {
  message: string;
}

interface ChatResponse {
  response: string;
  documents: any[];
}

interface DocumentAnalysisRequest {
  document_id: string;
}

interface DocumentAnalysisResponse {
  document: any;
  analysis: string;
  error?: string;
}

interface DocumentSearchRequest {
  query: string;
  limit?: number;
}

interface DocumentSearchResponse {
  documents: any[];
  query: string;
}

interface DocumentSummary {
  id: string;
  title: string;
  description: string;
  department: string;
  priority: string;
  file_type: string;
  file_name: string;
  created_at: string;
  content_preview: string;
  has_file_content: boolean;
  file_content_length: number;
}

interface DocumentsSummaryResponse {
  documents: DocumentSummary[];
  total: number;
  error?: string;
}

const AI_BACKEND_URL = import.meta.env.VITE_AI_BACKEND_URL || 'http://localhost:8000';

export class AIApiService {
  private static instance: AIApiService;
  private baseUrl: string;

  private constructor() {
    this.baseUrl = AI_BACKEND_URL;
  }

  public static getInstance(): AIApiService {
    if (!AIApiService.instance) {
      AIApiService.instance = new AIApiService();
    }
    return AIApiService.instance;
  }

  async sendMessage(message: string): Promise<ChatResponse> {
    try {
      const response = await fetch(`${this.baseUrl}/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ message } as ChatRequest),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data as ChatResponse;
    } catch (error) {
      console.error('Error sending message to AI backend:', error);
      throw new Error('Failed to communicate with AI assistant. Please try again.');
    }
  }

  async testConnection(): Promise<boolean> {
    try {
      const response = await fetch(`${this.baseUrl}/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ message: 'test' } as ChatRequest),
      });
      return response.ok;
    } catch (error) {
      console.error('AI backend connection test failed:', error);
      return false;
    }
  }

  async analyzeDocument(documentId: string): Promise<DocumentAnalysisResponse> {
    try {
      const response = await fetch(`${this.baseUrl}/analyze-document`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ document_id: documentId } as DocumentAnalysisRequest),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data as DocumentAnalysisResponse;
    } catch (error) {
      console.error('Error analyzing document:', error);
      throw new Error('Failed to analyze document. Please try again.');
    }
  }

  async searchDocuments(query: string, limit: number = 10): Promise<DocumentSearchResponse> {
    try {
      const response = await fetch(`${this.baseUrl}/search-documents`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ query, limit } as DocumentSearchRequest),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data as DocumentSearchResponse;
    } catch (error) {
      console.error('Error searching documents:', error);
      throw new Error('Failed to search documents. Please try again.');
    }
  }

  async getDocument(documentId: string): Promise<any> {
    try {
      const response = await fetch(`${this.baseUrl}/document/${documentId}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error getting document:', error);
      throw new Error('Failed to get document. Please try again.');
    }
  }

  async getDocumentsSummary(): Promise<DocumentsSummaryResponse> {
    try {
      const response = await fetch(`${this.baseUrl}/documents/summary`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data as DocumentsSummaryResponse;
    } catch (error) {
      console.error('Error getting documents summary:', error);
      throw new Error('Failed to get documents summary. Please try again.');
    }
  }
}

export const aiApi = AIApiService.getInstance();
