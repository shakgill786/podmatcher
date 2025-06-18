// src/store/csrf.js

export default async function csrfFetch(url, options = {}) {
    options.method = options.method || "GET";
    options.headers = options.headers || {};
  
    if (options.method.toUpperCase() !== "GET") {
      options.headers["Content-Type"] = "application/json";
      options.headers["X-CSRFToken"] = getCSRFToken();
    }
  
    options.credentials = "include";
    return fetch(url, options);
  }
  
  function getCSRFToken() {
    const match = document.cookie.match(/csrf_token=([^;]+)/);
    return match ? match[1] : null;
  }
  