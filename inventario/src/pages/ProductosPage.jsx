import { useEffect, useMemo, useState } from "react";
import NavInventarioInventory from "../components/Menu";

const API_BASE = "http://localhost:8081/api";

export default function ProductosPage() {
  const [marcas, setMarcas] = useState([]);
  const [productos, setProductos] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loadingInit, setLoadingInit] = useState(true);
  const [message, setMessage] = useState(null);
  const [editingId, setEditingId] = useState(null);

  const [form, setForm] = useState({
    nombre: "",
    marcaId: "",
    descripcion: "",
    activo: true,
  });

  const marcasMap = useMemo(() => {
    return Object.fromEntries(
      marcas.map((m) => [
        String(m.id ?? m.marcaId ?? m.value ?? ""),
        m,
      ])
    );
  }, [marcas]);

  const getMarcaIdFromProduct = (p) =>
    p.marcaId ?? p.marca?.id ?? p.marca?.marcaId ?? "";

  const getMarcaNombreFromProduct = (p) => {
    if (p.marca?.nombre) return p.marca.nombre;
    const mid = String(getMarcaIdFromProduct(p));
    const m = marcasMap[mid];
    return m?.nombre ?? m?.name ?? "";
  };

  useEffect(() => {
    (async () => {
      try {
        const [resMarcas, resProductos] = await Promise.all([
          fetch(`${API_BASE}/marcas`),
          fetch(`${API_BASE}/productos`),
        ]);

        if (!resMarcas.ok) throw new Error("No se pudo cargar marcas");
        if (!resProductos.ok) throw new Error("No se pudo cargar productos");

        const dataMarcas = await resMarcas.json();
        const dataProductos = await resProductos.json();

        setMarcas(Array.isArray(dataMarcas) ? dataMarcas : []);
        setProductos(Array.isArray(dataProductos) ? dataProductos : []);
      } catch (e) {
        setMessage({ type: "error", text: e.message || "Error inicial" });
      } finally {
        setLoadingInit(false);
      }
    })();
  }, []);

  const resetForm = () => {
    setEditingId(null);
    setForm({
      nombre: "",
      marcaId: "",
      descripcion: "",
      activo: true,
    });
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((f) => ({
      ...f,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const loadProductos = async () => {
    const res = await fetch(`${API_BASE}/productos`);
    if (!res.ok) throw new Error("No se pudo refrescar la lista de productos");
    const data = await res.json();
    setProductos(Array.isArray(data) ? data : []);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage(null);

    if (!form.nombre.trim()) {
      setMessage({ type: "error", text: "El nombre es obligatorio." });
      return;
    }
    if (!form.marcaId) {
      setMessage({ type: "error", text: "Debe seleccionar una marca." });
      return;
    }

    setLoading(true);
    try {
      const payload = {
        nombre: form.nombre.trim(),
        marcaId: Number(form.marcaId),
        descripcion: form.descripcion?.trim() ?? "",
        activo: Boolean(form.activo),
      };

      const url = editingId
        ? `${API_BASE}/productos/${editingId}`
        : `${API_BASE}/productos`;

      const method = editingId ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const err = await safeJson(res);
        throw new Error(err?.message || `Error al ${editingId ? "editar" : "crear"} producto`);
      }

      await loadProductos();
      setMessage({
        type: "success",
        text: editingId ? "Producto actualizado." : "Producto creado.",
      });
      resetForm();
    } catch (e) {
      setMessage({ type: "error", text: e.message || "Error al guardar" });
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (p) => {
    setEditingId(p.id ?? p.productoId ?? null);
    setForm({
      nombre: p.nombre ?? "",
      marcaId: String(getMarcaIdFromProduct(p) ?? ""),
      descripcion: p.descripcion ?? "",
      activo: Boolean(p.activo ?? true),
    });
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleDelete = async (id) => {
    if (!id) return;
    const ok = confirm("¿Eliminar este producto?");
    if (!ok) return;

    setLoading(true);
    setMessage(null);
    try {
      const res = await fetch(`${API_BASE}/productos/${id}`, { method: "DELETE" });
      if (!res.ok) {
        const err = await safeJson(res);
        throw new Error(err?.message || "No se pudo eliminar");
      }
      await loadProductos();
      if (editingId === id) resetForm();
      setMessage({ type: "success", text: "Producto eliminado." });
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
      <h1 className="text-2xl font-semibold mb-4">Productos</h1>
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
          {editingId ? "Editar producto" : "Crear producto"}
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
              placeholder="Coca Cola 1L"
            />
          </div>

          <div className="col-span-1">
            <label className="block text-sm mb-1">Marca</label>
            <select
              name="marcaId"
              value={form.marcaId}
              onChange={handleChange}
              className="w-full rounded-lg border border-neutral-300 px-3 py-2 outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Selecciona una marca…</option>
              {marcas.map((m) => (
                <option key={m.id ?? m.marcaId ?? m.value} value={m.id ?? m.marcaId ?? m.value}>
                  {m.nombre ?? m.name ?? `Marca ${m.id ?? ""}`}
                </option>
              ))}
            </select>
          </div>

          <div className="col-span-1 md:col-span-2">
            <label className="block text-sm mb-1">Descripción</label>
            <input
              type="text"
              name="descripcion"
              value={form.descripcion}
              onChange={handleChange}
              className="w-full rounded-lg border border-neutral-300 px-3 py-2 outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Descripción del producto"
            />
          </div>

          <div className="col-span-1 flex items-center gap-2">
            <input
              id="activo"
              type="checkbox"
              name="activo"
              checked={form.activo}
              onChange={handleChange}
              className="h-4 w-4 rounded border-neutral-300"
            />
            <label htmlFor="activo" className="text-sm">Activo</label>
          </div>

          <div className="col-span-1 md:col-span-2 flex gap-3">
            <button
              type="submit"
              disabled={loading}
              className="rounded-xl bg-blue-600 px-4 py-2 text-white hover:bg-blue-700 disabled:opacity-60"
            >
              {editingId ? "Guardar cambios" : "Crear producto"}
            </button>
            {editingId ? (
              <button
                type="button"
                onClick={resetForm}
                className="rounded-xl border border-neutral-300 px-4 py-2 hover:bg-neutral-50"
              >
                Cancelar
              </button>
            ) : (
              <button
                type="button"
                onClick={resetForm}
                className="rounded-xl border border-neutral-300 px-4 py-2 hover:bg-neutral-50"
              >
                Limpiar
              </button>
            )}
          </div>
        </form>
      </div>

      {/* LISTA */}
      <div className="rounded-2xl border border-neutral-200 bg-white p-5 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-medium">Listado</h3>
          <button
            onClick={loadProductos}
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
                <th className="px-3 py-2 text-left">Marca</th>
                <th className="px-3 py-2 text-left">Descripción</th>
                <th className="px-3 py-2 text-left">Activo</th>
                <th className="px-3 py-2 text-left">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {productos.length === 0 ? (
                <tr>
                  <td colSpan="6" className="px-3 py-6 text-center text-neutral-500">
                    No hay productos.
                  </td>
                </tr>
              ) : (
                productos.map((p) => {
                  const id = p.id ?? p.productoId ?? "";
                  return (
                    <tr key={id} className="border-t border-neutral-100">
                      <td className="px-3 py-2">{id}</td>
                      <td className="px-3 py-2">{p.nombre}</td>
                      <td className="px-3 py-2">
                        {getMarcaNombreFromProduct(p) || getMarcaIdFromProduct(p)}
                      </td>
                      <td className="px-3 py-2">{p.descripcion}</td>
                      <td className="px-3 py-2">
                        <span
                          className={[
                            "inline-flex items-center rounded-full px-2 py-0.5",
                            p.activo ? "bg-emerald-100 text-emerald-700" : "bg-neutral-100 text-neutral-600",
                          ].join(" ")}
                        >
                          {p.activo ? "Sí" : "No"}
                        </span>
                      </td>
                      <td className="px-3 py-2">
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleEdit(p)}
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

// Intenta parsear JSON sin romper si no hay body
async function safeJson(res) {
  try {
    return await res.json();
  } catch {
    return null;
  }
}
