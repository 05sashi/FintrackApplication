import axios from 'axios';

const API = axios.create({
  // baseURL: 'https://fintrackapplication.onrender.com/api',
  baseURL: 'https://fintrack-application-1drk-sashidhars-projects.vercel.app/api',
});

API.interceptors.request.use((req) => {
  const token = localStorage.getItem('token');
  if (token) {
    req.headers.Authorization = token;
  }
  return req;
});

export default API;
