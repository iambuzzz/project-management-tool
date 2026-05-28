import axios from 'axios';
import { API_BASE_URL } from '../utils/constants';

const api = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true, 
});

api.interceptors.response.use(
  (response) => {
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
