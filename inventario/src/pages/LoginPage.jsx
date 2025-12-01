import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

const API_BASE = "http://localhost:8081/api";

export default function LoginPage() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null);
  const [form, setForm] = useState({
    username: "",
    password: "",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((f) => ({ ...f, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage(null);

    if (!form.username.trim()) {
      setMessage({ type: "error", text: "El usuario es obligatorio." });
      return;
    }
    if (!form.password) {
      setMessage({ type: "error", text: "La contraseña es obligatoria." });
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username: form.username.trim(),
          password: form.password,
        }),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.message || "Usuario o contraseña incorrectos");
      }

      const data = await res.json();
      
      // Guardar el token y datos del usuario en localStorage
      localStorage.setItem("token", data.token);
      localStorage.setItem("username", data.username);
      localStorage.setItem("rol", data.rol);
      
      setMessage({ type: "success", text: "Inicio de sesión exitoso." });
      // Redirigir al dashboard o página principal
      setTimeout(() => navigate("/productos"), 500);
    } catch (e) {
      setMessage({ type: "error", text: e.message || "Error al iniciar sesión" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-red-50 to-orange-50 px-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="flex flex-col items-center mb-8">
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-br from-red-500 to-orange-500 text-white text-2xl shadow-lg">
            🛒
          </div>
          <h1 className="mt-4 text-2xl font-semibold text-neutral-800">
            SuperMarket Express
          </h1>
          <p className="mt-1 text-sm text-neutral-500">
            Inicia sesión en tu cuenta
          </p>
        </div>

        {/* Card */}
        <div className="rounded-2xl border border-neutral-200 bg-white p-8 shadow-sm">
          {message && (
            <div
              className={[
                "mb-6 rounded-lg border px-4 py-3 text-sm",
                message.type === "error"
                  ? "border-red-300 bg-red-50 text-red-700"
                  : "border-emerald-300 bg-emerald-50 text-emerald-700",
              ].join(" ")}
            >
              {message.text}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label htmlFor="username" className="block text-sm font-medium text-neutral-700 mb-1">
                Usuario
              </label>
              <input
                id="username"
                type="text"
                name="username"
                value={form.username}
                onChange={handleChange}
                className="w-full rounded-lg border border-neutral-300 px-4 py-2.5 outline-none transition-all focus:ring-2 focus:ring-red-500 focus:border-red-500"
                placeholder="Tu nombre de usuario"
                autoComplete="username"
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-neutral-700 mb-1">
                Contraseña
              </label>
              <input
                id="password"
                type="password"
                name="password"
                value={form.password}
                onChange={handleChange}
                className="w-full rounded-lg border border-neutral-300 px-4 py-2.5 outline-none transition-all focus:ring-2 focus:ring-red-500 focus:border-red-500"
                placeholder="••••••••"
                autoComplete="current-password"
              />
            </div>

            <div className="flex items-center justify-between text-sm">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  className="h-4 w-4 rounded border-neutral-300 text-red-600 focus:ring-red-500"
                />
                <span className="text-neutral-600">Recordarme</span>
              </label>
              <a
                href="#"
                className="text-red-600 hover:text-red-700 font-medium"
              >
                ¿Olvidaste tu contraseña?
              </a>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-lg bg-gradient-to-r from-red-500 to-orange-500 px-4 py-2.5 text-white font-medium transition-colors hover:from-red-600 hover:to-orange-600 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                      fill="none"
                    />
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                    />
                  </svg>
                  Iniciando sesión…
                </span>
              ) : (
                "Iniciar sesión"
              )}
            </button>
          </form>

          <div className="mt-6 text-center text-sm text-neutral-600">
            ¿No tienes una cuenta?{" "}
            <Link
              to="/signup"
              className="text-red-600 hover:text-red-700 font-medium"
            >
              Regístrate
            </Link>
          </div>
        </div>

        <div className="mt-6 text-center">
          <Link to="/" className="text-sm text-neutral-500 hover:text-red-600 transition-colors">
            ← Volver al inicio
          </Link>
        </div>

        <p className="mt-4 text-center text-xs text-neutral-400">
          © 2025 SuperMarket Express. Todos los derechos reservados.
        </p>
      </div>
    </div>
  );
}
