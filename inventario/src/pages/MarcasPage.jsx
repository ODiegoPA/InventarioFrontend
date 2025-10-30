// src/pages/MarcasPage.jsx
import { useEffect, useState } from "react";
import NavInventarioInventory from "../components/Menu";

const API_BASE = "http://localhost:8081/api";

export default function MarcasPage() {
  const [marcas, setMarcas] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loadingInit, setLoadingInit] = useState(true);
  const [message, setMessage] = useState(null);
  const [editingId, setEditingId] = useState(null);

  const [form, setForm] = useState({ nombre: "" });

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch(`${API_BASE}/marcas`);
        if (!res.ok) throw new Error("No se pudo cargar marcas");
        const data = await res.json();
        setMarcas(Array.isArray(data) ? data : []);
      } catch (e) {
        setMessage({ type: "error", text: e.message || "Error inicial" });
      } finally {
        setLoadingInit(false);
      }
    })();
  }, []);

  const resetForm = () => {
    setEditingId(null);
    setForm({ nombre: "" });
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((f) => ({ ...f, [name]: value }));
  };

  const loadMarcas = async () => {
    const res = await fetch(`${API_BASE}/marcas`);
    if (!res.ok) throw new Error("No se pudo refrescar la lista de marcas");
    const data = await res.json();
    setMarcas(Array.isArray(data) ? data : []);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage(null);

    if (!form.nombre.trim()) {
      setMessage({ type: "error", text: "El nombre es obligatorio." });
      return;
    }

    setLoading(true);
    try {
      const payload = { nombre: form.nombre.trim() };
      const url = editingId
        ? `${API_BASE}/marcas/${editingId}`
        : `${API_BASE}/marcas`;
      const method = editingId ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const err = await safeJson(res);
        throw new Error(err?.message || `Error al ${editingId ? "editar" : "crear"} marca`);
      }

      await loadMarcas();
      setMessage({
        type: "success",
        text: editingId ? "Marca actualizada." : "Marca creada.",
      });
      resetForm();
    } catch (e) {
      setMessage({ type: "error", text: e.message || "Error al guardar" });
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (m) => {
    const id = m.id ?? m.marcaId ?? m.value ?? null;
    setEditingId(id);
    setForm({ nombre: m.nombre ?? m.name ?? "" });
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleDelete = async (id) => {
    if (!id) return;
    const ok = confirm("¿Eliminar esta marca?");
    if (!ok) return;

    setLoading(true);
    setMessage(null);
    try {
      const res = await fetch(`${API_BASE}/marcas/${id}`, { method: "DELETE" });
      if (!res.ok) {
        const err = await safeJson(res);
        throw new Error(err?.message || "No se pudo eliminar");
      }
      await loadMarcas();
      if (editingId === id) resetForm();
      setMessage({ type: "success", text: "Marca eliminada." });
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
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-2xl font-semibold mb-4">Marcas</h1>

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

      <div className="rounded-2xl border border-neutral-200 bg-white p-5 shadow-sm mb-8">
        <h2 className="text-lg font-medium mb-4">
          {editingId ? "Editar marca" : "Crear marca"}
        </h2>
        <form onSubmit={handleSubmit} className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <div className="col-span-1 md:col-span-2">
            <label className="block text-sm mb-1">Nombre</label>
            <input
              type="text"
              name="nombre"
              value={form.nombre}
              onChange={handleChange}
              className="w-full rounded-lg border border-neutral-300 px-3 py-2 outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Coca-Cola, Pepsi, etc."
            />
          </div>

          <div className="col-span-1 md:col-span-2 flex gap-3">
            <button
              type="submit"
              disabled={loading}
              className="rounded-xl bg-blue-600 px-4 py-2 text-white hover:bg-blue-700 disabled:opacity-60"
            >
              {editingId ? "Guardar cambios" : "Crear marca"}
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

      <div className="rounded-2xl border border-neutral-200 bg-white p-5 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-medium">Listado</h3>
          <button
            onClick={loadMarcas}
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
                <th className="px-3 py-2 text-left">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {marcas.length === 0 ? (
                <tr>
                  <td colSpan="3" className="px-3 py-6 text-center text-neutral-500">
                    No hay marcas.
                  </td>
                </tr>
              ) : (
                marcas.map((m) => {
                  const id = m.id ?? m.marcaId ?? m.value ?? "";
                  const nombre = m.nombre ?? m.name ?? "";
                  return (
                    <tr key={id} className="border-t border-neutral-100">
                      <td className="px-3 py-2">{id}</td>
                      <td className="px-3 py-2">{nombre}</td>
                      <td className="px-3 py-2">
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleEdit(m)}
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
