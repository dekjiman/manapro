const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000'

interface RequestOptions {
  method?: string
  body?: any
  headers?: Record<string, string>
}

class ApiService {
  private baseUrl: string

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl
  }

  private getHeaders(): Record<string, string> {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    }

    const token = localStorage.getItem('manapro_token')
    if (token) {
      headers['Authorization'] = `Bearer ${token}`
    }

    const tenantId = localStorage.getItem('manapro_tenant')
    if (tenantId) {
      headers['X-Tenant-ID'] = tenantId
    }

    return headers
  }

  private async request<T>(endpoint: string, options: RequestOptions = {}): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`
    const headers = { ...this.getHeaders(), ...options.headers }

    const config: RequestInit = {
      method: options.method || 'GET',
      headers,
    }

    if (options.body) {
      config.body = JSON.stringify(options.body)
    }

    const response = await fetch(url, config)

    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: 'Network error' }))
      throw new Error(error.message || `HTTP ${response.status}`)
    }

    return response.json()
  }

  get<T>(endpoint: string) {
    return this.request<T>(endpoint, { method: 'GET' })
  }

  post<T>(endpoint: string, body?: any) {
    return this.request<T>(endpoint, { method: 'POST', body })
  }

  patch<T>(endpoint: string, body?: any) {
    return this.request<T>(endpoint, { method: 'PATCH', body })
  }

  delete<T>(endpoint: string) {
    return this.request<T>(endpoint, { method: 'DELETE' })
  }
}

export const api = new ApiService(API_URL)
export default api
