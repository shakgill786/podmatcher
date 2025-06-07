// react-vite/src/utils/csrf.js

// Extract CSRF token from cookies
export function getCSRFToken() {
  return document.cookie
    .split("; ")
    .find((row) => row.startsWith("csrf_token="))
    ?.split("=")[1];
}
