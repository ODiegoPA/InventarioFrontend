// Utilidades de autenticación

const API_BASE = "http://localhost:8081/api";

// Verificar si el usuario está autenticado
export const isAuthenticated = () => {
  const token = localStorage.getItem("token");
  return !!token;
};

// Obtener el token
export const getToken = () => {
  return localStorage.getItem("token");
};

// Obtener datos del usuario
export const getUser = () => {
  return {
    username: localStorage.getItem("username"),
    rol: localStorage.getItem("rol"),
  };
};

// Cerrar sesión
export const logout = () => {
  localStorage.removeItem("token");
  localStorage.removeItem("username");
  localStorage.removeItem("rol");
};

// Fetch con autenticación automática
export const authFetch = async (url, options = {}) => {
  const token = getToken();
  
  const headers = {
    "Content-Type": "application/json",
    ...options.headers,
  };

  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  const response = await fetch(url.startsWith("http") ? url : `${API_BASE}${url}`, {
    ...options,
    headers,
  });

  // Si el token expiró o es inválido, cerrar sesión
  if (response.status === 401 || response.status === 403) {
    logout();
    window.location.href = "/login";
    throw new Error("Sesión expirada. Por favor, inicia sesión nuevamente.");
  }

  return response;
};

// Helper para GET
export const authGet = (url) => authFetch(url, { method: "GET" });

// Helper para POST
export const authPost = (url, body) => 
  authFetch(url, { 
    method: "POST", 
    body: JSON.stringify(body) 
  });

// Helper para PUT
export const authPut = (url, body) => 
  authFetch(url, { 
    method: "PUT", 
    body: JSON.stringify(body) 
  });

// Helper para DELETE
export const authDelete = (url) => 
  authFetch(url, { method: "DELETE" });

export { API_BASE };
