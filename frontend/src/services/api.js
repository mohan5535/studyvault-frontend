const API_URL = import.meta.env.VITE_API_URL || (import.meta.env.DEV ? "/api" : "http://localhost:5000/api");

export async function apiRequest(path, options = {}) {
  const token = localStorage.getItem("studyvault_token");
  const headers = {
    "Content-Type": "application/json",
    ...(options.headers || {})
  };

  if (token) headers.Authorization = `Bearer ${token}`;

  const response = await fetch(`${API_URL}${path}`, { ...options, headers });
  const contentType = response.headers.get("content-type") || "";
  const data = contentType.includes("application/json") ? await response.json() : {};

  if (!response.ok) {
    throw new Error(data?.error?.message || data?.message || "Request failed");
  }
  return data;
}

export { API_URL };