// src/pages/SucursalesPage.jsx
import { useEffect, useState } from "react";
import NavInventarioInventory from "../components/Menu";
import { authFetch, API_BASE } from "../utils/api";

export default function SucursalesPage() {
  const [sucursales, setSucursales] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loadingInit, setLoadingInit] = useState(true);
  const [message, setMessage] = useState(null);
  const [editingId, setEditingId] = useState(null);

  const [form, setForm] = useState({
    nombre: "",
    direccion: "",
  });

  useEffect(() => {
    (async () => {
      try {
        const res = await authFetch(`${API_BASE}/sucursales`);
        if (!res.ok) throw new Error("No se pudo cargar sucursales");
        const data = await res.json();
        setSucursales(Array.isArray(data) ? data : []);
      } catch (e) {
        setMessage({ type: "error", text: e.message || "Error inicial" });
      } finally {
        setLoadingInit(false);
      }
    })();
  }, []);

  const resetForm = () => {
    setEditingId(null);
    setForm({ nombre: "", direccion: "" });
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((f) => ({ ...f, [name]: value }));
  };

  const loadSucursales = async () => {
    const res = await authFetch(`${API_BASE}/sucursales`);
    if (!res.ok) throw new Error("No se pudo refrescar la lista");
    const data = await res.json();
    setSucursales(Array.isArray(data) ? data : []);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage(null);

    if (!form.nombre.trim()) {
      setMessage({ type: "error", text: "El nombre es obligatorio." });
      return;
    }
    if (!form.direccion.trim()) {
      setMessage({ type: "error", text: "La dirección es obligatoria." });
      return;
    }

    setLoading(true);
    try {
      const payload = {
        nombre: form.nombre.trim(),
        direccion: form.direccion.trim(),
      };

      const url = editingId
        ? `${API_BASE}/sucursales/${editingId}`
        : `${API_BASE}/sucursales`;
      const method = editingId ? "PUT" : "POST";

      const res = await authFetch(url, {
        method,
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const err = await safeJson(res);
        throw new Error(err?.message || `Error al ${editingId ? "editar" : "crear"} sucursal`);
      }

      await loadSucursales();
      setMessage({
        type: "success",
        text: editingId ? "Sucursal actualizada." : "Sucursal creada.",
      });
      resetForm();
    } catch (e) {
      setMessage({ type: "error", text: e.message || "Error al guardar" });
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (s) => {
    const id = s.id ?? s.sucursalId ?? s.value ?? null;
    setEditingId(id);
    setForm({
      nombre: s.nombre ?? s.name ?? "",
      direccion: s.direccion ?? s.address ?? "",
    });
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleDelete = async (id) => {
    if (!id) return;
    const ok = confirm("¿Eliminar esta sucursal?");
    if (!ok) return;

    setLoading(true);
    setMessage(null);
    try {
      const res = await authFetch(`${API_BASE}/sucursales/${id}`, { method: "DELETE" });
      if (!res.ok) {
        const err = await safeJson(res);
        throw new Error(err?.message || "No se pudo eliminar");
      }
      await loadSucursales();
      if (editingId === id) resetForm();
      setMessage({ type: "success", text: "Sucursal eliminada." });
    } catch (e) {
      setMessage({ type: "error", text: e.message || "Error al eliminar" });
    } finally {
      setLoading(false);
    }
  };

  if (loadingInit) {
    return (
      <div className="p-6 text-center text-sm text-neutral-600">
        Cargando…
      </div>
    );
  }

  return (
    <>
    <NavInventarioInventory />
    <div className="max-w-5xl mx-auto p-6">
      <h1 className="text-2xl font-semibold mb-4">Sucursales</h1>

      {/* Mensajes */}
      {message && (
        <div
          className={[
            "mb-4 rounded-lg border px-4 py-3 text-sm",
            message.type === "error"
              ? "border-red-300 bg-red-50 text-red-700"
              : "border-emerald-300 bg-emerald-50 text-emerald-700",
          ].join(" ")}
        >
          {message.text}
        </div>
      )}

      {/* FORM */}
      <div className="rounded-2xl border border-neutral-200 bg-white p-5 shadow-sm mb-8">
        <h2 className="text-lg font-medium mb-4">
          {editingId ? "Editar sucursal" : "Crear sucursal"}
        </h2>
        <form onSubmit={handleSubmit} className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <div className="col-span-1">
            <label className="block text-sm mb-1">Nombre</label>
            <input
              type="text"
              name="nombre"
              value={form.nombre}
              onChange={handleChange}
              className="w-full rounded-lg border border-neutral-300 px-3 py-2 outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Sucursal Central"
            />
          </div>

          <div className="col-span-1 md:col-span-2">
            <label className="block text-sm mb-1">Dirección</label>
            <input
              type="text"
              name="direccion"
              value={form.direccion}
              onChange={handleChange}
              className="w-full rounded-lg border border-neutral-300 px-3 py-2 outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Av. Siempre Viva 742"
            />
          </div>

          <div className="col-span-1 md:col-span-2 flex gap-3">
            <button
              type="submit"
              disabled={loading}
              className="rounded-xl bg-blue-600 px-4 py-2 text-white hover:bg-blue-700 disabled:opacity-60"
            >
              {editingId ? "Guardar cambios" : "Crear sucursal"}
            </button>
            <button
              type="button"
              onClick={resetForm}
              className="rounded-xl border border-neutral-300 px-4 py-2 hover:bg-neutral-50"
            >
              {editingId ? "Cancelar" : "Limpiar"}
            </button>
          </div>
        </form>
      </div>

      {/* LISTA */}
      <div className="rounded-2xl border border-neutral-200 bg-white p-5 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-medium">Listado</h3>
          <button
            onClick={loadSucursales}
            className="rounded-xl border border-neutral-300 px-3 py-1.5 text-sm hover:bg-neutral-50"
            disabled={loading}
          >
            Refrescar
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead className="bg-neutral-50 text-neutral-600">
              <tr>
                <th className="px-3 py-2 text-left">ID</th>
                <th className="px-3 py-2 text-left">Nombre</th>
                <th className="px-3 py-2 text-left">Dirección</th>
                <th className="px-3 py-2 text-left">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {sucursales.length === 0 ? (
                <tr>
                  <td colSpan="4" className="px-3 py-6 text-center text-neutral-500">
                    No hay sucursales.
                  </td>
                </tr>
              ) : (
                sucursales.map((s) => {
                  const id = s.id ?? s.sucursalId ?? s.value ?? "";
                  const nombre = s.nombre ?? s.name ?? "";
                  const direccion = s.direccion ?? s.address ?? "";
                  return (
                    <tr key={id} className="border-t border-neutral-100">
                      <td className="px-3 py-2">{id}</td>
                      <td className="px-3 py-2">{nombre}</td>
                      <td className="px-3 py-2">{direccion}</td>
                      <td className="px-3 py-2">
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleEdit(s)}
                            className="rounded-lg border border-neutral-300 px-3 py-1 hover:bg-neutral-50"
                          >
                            Editar
                          </button>
                          <button
                            onClick={() => handleDelete(id)}
                            className="rounded-lg border border-red-300 px-3 py-1 text-red-600 hover:bg-red-50"
                          >
                            Eliminar
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
    </>
  );
}

async function safeJson(res) {
  try {
    return await res.json();
  } catch {
    return null;
  }
}
