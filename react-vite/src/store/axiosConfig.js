// src/store/axiosConfig.js
import axios from "axios";
import { getCSRFToken } from "../utils/csrf";

const instance = axios.create({
  baseURL: "http://localhost:5000/api",
  withCredentials: true, // 💡 super important
});

instance.interceptors.request.use((config) => {
  const csrfToken = getCSRFToken();
  if (csrfToken && config.method !== "get") {
    config.headers["X-CSRFToken"] = csrfToken;
  }
  return config;
});

export default instance;

