import axios from 'axios';

const baseURL = import.meta.env.VITE_API_URL || 'https://task-manager-production-b4b3.up.railway.app/';
const API = axios.create({ baseURL });

// Automatically attach the JWT token to every request if it exists
API.interceptors.request.use((req) => {
  const profile = localStorage.getItem('userInfo');
  if (profile) {
    const { token } = JSON.parse(profile);
    req.headers.Authorization = `Bearer ${token}`;
  }
  return req;
});

export default API;