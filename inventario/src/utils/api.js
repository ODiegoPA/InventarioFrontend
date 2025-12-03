const API_BASE = "http://localhost:8081/api";
const SERVER_URL = "http://localhost:8081";

export { SERVER_URL };

/**
 * Función fetch pública (sin Authorization) - para peticiones GET simples
 * No envía headers personalizados para evitar preflight CORS
 * @param {string} url - URL completa
 * @param {object} options - Opciones de fetch
 * @returns {Promise} - Respuesta de la API
 */
export async function publicFetch(url, options = {}) {
  // Para GET simple, no enviamos headers personalizados para evitar preflight
  return fetch(url, options);
}

/**
 * Función fetch con autenticación - reemplaza fetch nativo
 * Incluye automáticamente el token de autorización si existe
 * @param {string} url - URL completa o endpoint
 * @param {object} options - Opciones de fetch
 * @returns {Promise} - Respuesta de la API
 */
export async function authFetch(url, options = {}) {
  const token = localStorage.getItem("token");

  const headers = {
    "Content-Type": "application/json",
    ...options.headers,
  };

  // Si hay token, agregarlo al header de autorización
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  const response = await fetch(url, {
    ...options,
    headers,
  });

  // Si el token expiró o es inválido, redirigir al landing
  if (response.status === 401) {
    localStorage.removeItem("token");
    localStorage.removeItem("username");
    localStorage.removeItem("rol");
    window.location.href = "/";
    throw new Error("Sesión expirada");
  }

  return response;
}

/**
 * Función para realizar peticiones HTTP con el token de autenticación
 * @param {string} endpoint - El endpoint de la API (ej: "/productos")
 * @param {object} options - Opciones adicionales de fetch
 * @returns {Promise} - Respuesta de la API
 */
export async function apiFetch(endpoint, options = {}) {
  return authFetch(`${API_BASE}${endpoint}`, options);
}

/**
 * GET request
 */
export async function apiGet(endpoint) {
  return apiFetch(endpoint, { method: "GET" });
}

/**
 * POST request
 */
export async function apiPost(endpoint, data) {
  return apiFetch(endpoint, {
    method: "POST",
    body: JSON.stringify(data),
  });
}

/**
 * PUT request
 */
export async function apiPut(endpoint, data) {
  return apiFetch(endpoint, {
    method: "PUT",
    body: JSON.stringify(data),
  });
}

/**
 * DELETE request
 */
export async function apiDelete(endpoint) {
  return apiFetch(endpoint, { method: "DELETE" });
}

export { API_BASE };
