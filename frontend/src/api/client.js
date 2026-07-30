import axios from "axios";

const api = axios.create({
  baseURL: "/api",
});

// Attach the JWT (if we have one) to every outgoing request
api.interceptors.request.use((config) => {
  const stored = localStorage.getItem("ssf_user");
  if (stored) {
    const { token } = JSON.parse(stored);
    if (token) config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;
