// react-vite/src/store/axiosConfig.js

import axios from "axios";
import { getCSRFToken } from "../utils/csrf";

const instance = axios.create({
  baseURL: "/api",      // relative path → Vite will proxy this to your Flask server
  withCredentials: true // include cookies on every request
});

instance.interceptors.request.use((config) => {
  const csrfToken = getCSRFToken();
  if (csrfToken && config.method !== "get") {
    config.headers["X-CSRFToken"] = csrfToken;
  }
  return config;
});

export default instance;
