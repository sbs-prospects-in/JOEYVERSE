import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'https://api.beingkind.org/v1',
  timeout: 10000,
});

// Mocking backend endpoints for contact and newsletter forms
api.interceptors.request.use(
  (config) => {
    const isMockRoute = 
      config.url.endsWith('/contact') || 
      config.url.endsWith('/newsletter') || 
      config.url.endsWith('/volunteer');

    if (isMockRoute) {
      // Use custom adapter to mock responses
      config.adapter = async () => {
        await new Promise((resolve) => setTimeout(resolve, 1000));
        return {
          data: { 
            success: true, 
            message: "Action successful! Thank you for being kind." 
          },
          status: 200,
          statusText: "OK",
          headers: {},
          config,
        };
      };
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default api;
