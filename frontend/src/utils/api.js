import axios from 'axios';

const api = axios.create({
  baseURL: '/api',
  // SHAP KernelExplainer (SVM/KNN/Naive Bayes) can take 30-60s on training-set background.
  timeout: 180000,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    let message = 'An unexpected error occurred.';

    if (error.response) {
      const data = error.response.data;
      if (typeof data === 'string') {
        message = data;
      } else if (data?.detail) {
        message = typeof data.detail === 'string'
          ? data.detail
          : JSON.stringify(data.detail);
      } else if (data?.message) {
        message = data.message;
      }
    } else if (error.request) {
      message = 'Network error. Please check your connection and try again.';
    } else {
      message = error.message;
    }

    const enrichedError = new Error(message);
    enrichedError.status = error.response?.status;
    enrichedError.originalError = error;
    return Promise.reject(enrichedError);
  }
);

export default api;
