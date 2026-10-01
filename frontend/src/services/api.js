function getBaseUrl() {
  const envUrl = import.meta.env.VITE_API_URL;
  if (!envUrl) {
    return import.meta.env.DEV ? "/api" : "/api";
  }

  let url = envUrl.trim().replace(/\/+$/, "");
  // If the user provided the base domain without /api (e.g. https://my-backend.onrender.com)
  if (/^https?:\/\//i.test(url) && !url.endsWith("/api")) {
    url = `${url}/api`;
  }
  return url;
}

const API_URL = getBaseUrl();

export async function apiRequest(path, options = {}) {
  const token = localStorage.getItem("studyvault_token");
  const headers = {
    "Content-Type": "application/json",
    ...(options.headers || {})
  };

  if (token) headers.Authorization = `Bearer ${token}`;

  const normalizedPath = path.startsWith("/") ? path : `/${path}`;

  let response;
  try {
    response = await fetch(`${API_URL}${normalizedPath}`, { ...options, headers });
  } catch (err) {
    if (err.message && err.message.toLowerCase().includes("failed to fetch")) {
      throw new Error(
        "Failed to connect to backend server. If using Render free tier, the server may take ~30-50 seconds to wake up from sleep. Please wait a moment and try again."
      );
    }
    throw err;
  }

  const contentType = response.headers.get("content-type") || "";
  const data = contentType.includes("application/json") ? await response.json() : {};

  if (!response.ok) {
    throw new Error(data?.error?.message || data?.message || `Request failed (${response.status})`);
  }
  return data;
}

export { API_URL };