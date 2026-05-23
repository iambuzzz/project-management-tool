import axios from 'axios';
import { API_BASE_URL } from '../utils/constants';

const api = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true, // Important for CORS and cookies if we add auth later
});

// Response interceptor to format errors globally
api.interceptors.response.use(
  (response) => {
    // Return standard axios response so we can extract .data in the services
    return response;
  },
  (error) => {
    const customError = new Error(
      error.response?.data?.message || error.response?.data?.error || 'An unexpected error occurred'
    );
    customError.status = error.response?.status;
    customError.data = error.response?.data;
    throw customError;
  }
);

export default api;
