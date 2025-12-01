import { Navigate } from "react-router-dom";

export default function ProtectedRoute({ children }) {
  const token = localStorage.getItem("token");

  if (!token) {
    // Si no hay token, redirigir al landing page
    return <Navigate to="/" replace />;
  }

  return children;
}
