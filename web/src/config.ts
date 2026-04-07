export const config = {
  appUrl: import.meta.env.VITE_APP_URL || 'http://localhost:5173',
  apiUrl: import.meta.env.VITE_API_URL || 'http://localhost:3000',
  get loginUrl() {
    return `${this.appUrl}/login`
  },
  get registerUrl() {
    return `${this.appUrl}/register`
  },
  get pricingUrl() {
    return `${this.appUrl}/pricing`
  }
}
