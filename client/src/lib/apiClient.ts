// API client to replace Supabase client calls
const API_BASE_URL = '/api';

interface ApiResponse<T = any> {
  success?: boolean;
  data?: T;
  error?: string;
}

class ApiClient {
  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${API_BASE_URL}${endpoint}`;
    
    const response = await fetch(url, {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ error: 'Request failed' }));
      throw new Error(errorData.error || `HTTP ${response.status}`);
    }

    return response.json();
  }

  // Auth methods
  async register(email: string, password: string) {
    return this.request('/auth/register', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
  }

  async login(email: string, password: string) {
    return this.request('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
  }

  // Business Profile methods
  async getBusinessProfiles(userId: string) {
    return this.request(`/business-profiles/${userId}`);
  }

  async createBusinessProfile(data: any) {
    return this.request('/business-profiles', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  // Posts methods
  async getPosts(userId: string, limit?: number) {
    const params = limit ? `?limit=${limit}` : '';
    return this.request(`/posts/${userId}${params}`);
  }

  async createPost(data: any) {
    return this.request('/posts', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updatePost(id: string, data: any) {
    return this.request(`/posts/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async deletePost(id: string) {
    return this.request(`/posts/${id}`, {
      method: 'DELETE',
    });
  }

  // Calendar methods
  async getCalendarEvents(userId: string, startDate?: string, endDate?: string) {
    const params = new URLSearchParams();
    if (startDate) params.append('startDate', startDate);
    if (endDate) params.append('endDate', endDate);
    const queryString = params.toString() ? `?${params.toString()}` : '';
    return this.request(`/calendar-events/${userId}${queryString}`);
  }

  async createCalendarEvent(data: any) {
    return this.request('/calendar-events', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateCalendarEvent(id: string, data: any) {
    return this.request(`/calendar-events/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  // Blog methods
  async getBlogPosts(published?: boolean, limit?: number) {
    const params = new URLSearchParams();
    if (published !== undefined) params.append('published', published.toString());
    if (limit) params.append('limit', limit.toString());
    const queryString = params.toString() ? `?${params.toString()}` : '';
    return this.request(`/blog-posts${queryString}`);
  }

  async getBlogPostBySlug(slug: string) {
    return this.request(`/blog-posts/slug/${slug}`);
  }

  async createBlogPost(data: any) {
    return this.request('/blog-posts', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  // Content Ideas methods
  async getContentIdeas(userId: string, limit?: number) {
    const params = limit ? `?limit=${limit}` : '';
    return this.request(`/content-ideas/${userId}${params}`);
  }

  async createContentIdea(data: any) {
    return this.request('/content-ideas', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  // Content Generation methods
  async generateContent(data: any) {
    return this.request('/generate-content', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  // Analytics methods
  async getAnalytics(userId: string, platform?: string) {
    const params = platform ? `?platform=${platform}` : '';
    return this.request(`/analytics/${userId}${params}`);
  }

  async recordAnalytics(data: any) {
    return this.request('/analytics', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  // Competitor Analysis methods
  async analyzeCompetitor(data: any) {
    return this.request('/analyze-competitor', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }
}

export const apiClient = new ApiClient();
export default apiClient;