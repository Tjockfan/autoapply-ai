import { config } from 'dotenv';
config();

export const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

export interface ApiResponse<T> {
  data?: T;
  error?: string;
  message?: string;
}

class ApiClient {
  private baseUrl: string;
  private token: string | null;

  constructor() {
    this.baseUrl = API_URL;
    this.token = null;
    
    // Load token from localStorage on client side
    if (typeof window !== 'undefined') {
      this.token = localStorage.getItem('token');
    }
  }

  setToken(token: string | null) {
    this.token = token;
    if (typeof window !== 'undefined') {
      if (token) {
        localStorage.setItem('token', token);
      } else {
        localStorage.removeItem('token');
      }
    }
  }

  getToken(): string | null {
    return this.token;
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    const url = `${this.baseUrl}${endpoint}`;
    
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...options.headers as Record<string, string>,
    };

    if (this.token) {
      headers['Authorization'] = `Bearer ${this.token}`;
    }

    try {
      const response = await fetch(url, {
        ...options,
        headers,
      });

      const data = await response.json();

      if (!response.ok) {
        // Handle 401 - clear token
        if (response.status === 401) {
          this.setToken(null);
        }
        throw new Error(data.error || data.message || 'Request failed');
      }

      return { data };
    } catch (error: any) {
      return { error: error.message || 'Network error' };
    }
  }

  // Auth endpoints
  async register(userData: {
    email: string;
    password: string;
    firstName?: string;
    lastName?: string;
  }) {
    return this.request<{ user: any; token: string; message: string }>('/api/auth/register', {
      method: 'POST',
      body: JSON.stringify(userData),
    });
  }

  async login(credentials: { email: string; password: string }) {
    return this.request<{ user: any; token: string; message: string }>('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
    });
  }

  async getMe() {
    return this.request<{ user: any }>('/api/auth/me');
  }

  // Jobs endpoints
  async getJobs(params?: { status?: string; search?: string; page?: number; limit?: number }) {
    const query = new URLSearchParams();
    if (params?.status) query.append('status', params.status);
    if (params?.search) query.append('search', params.search);
    if (params?.page) query.append('page', params.page.toString());
    if (params?.limit) query.append('limit', params.limit.toString());
    
    return this.request<{
      jobs: any[];
      pagination: { page: number; limit: number; total: number; totalPages: number };
    }>(`/api/jobs?${query.toString()}`);
  }

  async getJob(id: string) {
    return this.request<{ job: any }>(`/api/jobs/${id}`);
  }

  async createJob(jobData: any) {
    return this.request<{ job: any; message: string }>('/api/jobs', {
      method: 'POST',
      body: JSON.stringify(jobData),
    });
  }

  async updateJob(id: string, jobData: any) {
    return this.request<{ job: any; message: string }>(`/api/jobs/${id}`, {
      method: 'PUT',
      body: JSON.stringify(jobData),
    });
  }

  async deleteJob(id: string) {
    return this.request<{ message: string }>(`/api/jobs/${id}`, {
      method: 'DELETE',
    });
  }

  // Applications endpoints
  async getApplications(params?: { status?: string; page?: number; limit?: number }) {
    const query = new URLSearchParams();
    if (params?.status) query.append('status', params.status);
    if (params?.page) query.append('page', params.page.toString());
    if (params?.limit) query.append('limit', params.limit.toString());
    
    return this.request<{
      applications: any[];
      pagination: { page: number; limit: number; total: number; totalPages: number };
    }>(`/api/applications?${query.toString()}`);
  }

  async getApplication(id: string) {
    return this.request<{ application: any }>(`/api/applications/${id}`);
  }

  async createApplication(applicationData: { jobId: string; resumeId?: string; coverLetter?: string }) {
    return this.request<{ application: any; message: string }>('/api/applications', {
      method: 'POST',
      body: JSON.stringify(applicationData),
    });
  }

  async updateApplication(id: string, applicationData: any) {
    return this.request<{ application: any; message: string }>(`/api/applications/${id}`, {
      method: 'PUT',
      body: JSON.stringify(applicationData),
    });
  }

  async deleteApplication(id: string) {
    return this.request<{ message: string }>(`/api/applications/${id}`, {
      method: 'DELETE',
    });
  }

  // Resumes endpoints
  async getResumes() {
    return this.request<{ resumes: any[] }>('/api/resumes');
  }

  async getResume(id: string) {
    return this.request<{ resume: any }>(`/api/resumes/${id}`);
  }

  async createResume(resumeData: any) {
    return this.request<{ resume: any; message: string }>('/api/resumes', {
      method: 'POST',
      body: JSON.stringify(resumeData),
    });
  }

  async updateResume(id: string, resumeData: any) {
    return this.request<{ resume: any; message: string }>(`/api/resumes/${id}`, {
      method: 'PUT',
      body: JSON.stringify(resumeData),
    });
  }

  async deleteResume(id: string) {
    return this.request<{ message: string }>(`/api/resumes/${id}`, {
      method: 'DELETE',
    });
  }

  // AI endpoints
  async generateCoverLetter(data: { jobId: string; resumeId?: string; tone?: string; maxLength?: number }) {
    return this.request<{ coverLetter: string; job: any; message: string }>('/api/ai/generate-cover-letter', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async improveCoverLetter(data: { coverLetter: string; improvementType: string }) {
    return this.request<{ coverLetter: string; originalCoverLetter: string; message: string }>('/api/ai/improve-cover-letter', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async analyzeJobFit(data: { jobId: string; resumeId?: string }) {
    return this.request<{ analysis: any; job: any; message: string }>('/api/ai/analyze-job-fit', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }
}

export const api = new ApiClient();
export default api;
