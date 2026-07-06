import axios from 'axios';

const axiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

axiosInstance.interceptors.request.use(
  (config) => config,
  (error) => {
    console.error('[Request Error]', error);
    return Promise.reject(error);
  }
);

axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    const { response } = error;
    if (response) {
      console.error(`[Response Error] ${response.status}`, response.data);
    } else {
      console.error('[Network Error]', error.message);
    }
    return Promise.reject(error);
  }
);

export default axiosInstance;
