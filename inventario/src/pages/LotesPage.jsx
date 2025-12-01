// src/pages/LotesPage.jsx
import { useEffect, useMemo, useState } from "react";
import NavInventarioInventory from "../components/Menu";
import { authFetch, API_BASE } from "../utils/api";

const WARN_DAYS = 30;

export default function LotesPage() {
  const [productos, setProductos] = useState([]);
  const [lotes, setLotes] = useState([]);
  const [alerts, setAlerts] = useState([]);
  const [showAlertCenter, setShowAlertCenter] = useState(false);
  const [loading, setLoading] = useState(false);
  const [loadingInit, setLoadingInit] = useState(true);
  const [message, setMessage] = useState(null);

  const [form, setForm] = useState({
    productoId: "",
    codigoLote: "",
    fechaVencimiento: "",
    cantidad: 1,
  });

  const productosMap = useMemo(
    () =>
      Object.fromEntries(
        (productos || []).map((p) => [String(p.id ?? p.productoId ?? p.value ?? ""), p])
      ),
    [productos]
  );

  const getProductoNombre = (lote) => {
    const pid = String(lote.productoId ?? lote.producto?.id ?? "");
    const p = productosMap[pid];
    return p?.nombre ?? p?.name ?? `#${pid}`;
  };

  useEffect(() => {
    (async () => {
      try {
        const [resProd, resLotes] = await Promise.all([
          authFetch(`${API_BASE}/productos`),
          authFetch(`${API_BASE}/lotes`),
        ]);
        if (!resProd.ok) throw new Error("No se pudo cargar productos");
        if (!resLotes.ok) throw new Error("No se pudo cargar lotes");
        const dataProd = await resProd.json();
        const dataLotes = await resLotes.json();
        setProductos(Array.isArray(dataProd) ? dataProd : []);
        setLotes(Array.isArray(dataLotes) ? dataLotes : []);
        const a = computeAlerts(Array.isArray(dataLotes) ? dataLotes : []);
        setAlerts(a);
        setShowAlertCenter(a.length > 0);
      } catch (e) {
        setMessage({ type: "error", text: e.message || "Error inicial" });
      } finally {
        setLoadingInit(false);
      }
    })();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const resetForm = () =>
    setForm({ productoId: "", codigoLote: "", fechaVencimiento: "", cantidad: 1 });

  const handleChange = (e) => {
    const { name, value, type } = e.target;
    setForm((f) => ({
      ...f,
      [name]: type === "number" ? (value === "" ? "" : Number(value)) : value,
    }));
  };

  const loadLotes = async () => {
    const res = await authFetch(`${API_BASE}/lotes`);
    if (!res.ok) throw new Error("No se pudo refrescar la lista de lotes");
    const data = await res.json();
    setLotes(Array.isArray(data) ? data : []);
    const a = computeAlerts(Array.isArray(data) ? data : []);
    setAlerts(a);
  };

  const daysUntil = (dateStr) => {
    if (!dateStr) return NaN;
    const today = new Date();
    const d = new Date(dateStr);
    today.setHours(0, 0, 0, 0);
    d.setHours(0, 0, 0, 0);
    return Math.floor((d.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
  };

  const statusFromDays = (days) => {
    if (isNaN(days)) return { label: "—", cls: "bg-neutral-100 text-neutral-600" };
    if (days < 0) return { label: "Vencido", cls: "bg-red-100 text-red-700" };
    if (days <= WARN_DAYS) return { label: "Próx. a vencer", cls: "bg-amber-100 text-amber-800" };
    return { label: "OK", cls: "bg-emerald-100 text-emerald-700" };
  };

  const computeAlerts = (lotesArr) =>
    (lotesArr || []).filter((l) => {
      const fv = (l.fechaVencimiento || l.vencimiento || "").toString().slice(0, 10);
      const d = daysUntil(fv);
      const notif = l.notificacionActiva ?? true;
      return notif && (d < 0 || d <= WARN_DAYS);
    });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage(null);

    if (!form.productoId) {
      setMessage({ type: "error", text: "Debe seleccionar un producto." });
      return;
    }
    if (!form.codigoLote.trim()) {
      setMessage({ type: "error", text: "El código de lote es obligatorio." });
      return;
    }
    if (!form.fechaVencimiento) {
      setMessage({ type: "error", text: "La fecha de vencimiento es obligatoria." });
      return;
    }
    const cant = Number(form.cantidad);
    if (!Number.isFinite(cant) || cant <= 0) {
      setMessage({ type: "error", text: "La cantidad debe ser mayor a 0." });
      return;
    }

    setLoading(true);
    try {
      const payload = {
        productoId: Number(form.productoId),
        codigoLote: form.codigoLote.trim(),
        fechaVencimiento: form.fechaVencimiento, // "YYYY-MM-DD"
        cantidad: cant,
        notificacionActiva: true, // por defecto activada
      };

      const res = await authFetch(`${API_BASE}/lotes`, {
        method: "POST",
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const err = await safeJson(res);
        throw new Error(err?.message || "Error al crear lote");
      }

      await loadLotes();
      setMessage({ type: "success", text: "Lote creado (🔔 notificación activa)." });
      resetForm();
      // Si el nuevo lote entra en alerta, abrimos el Centro de Alertas
      const newAlerts = computeAlerts(lotes);
      setShowAlertCenter(newAlerts.length > 0);
    } catch (e) {
      setMessage({ type: "error", text: e.message || "Error al guardar" });
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!id) return;
    const ok = confirm("¿Eliminar este lote?");
    if (!ok) return;

    setLoading(true);
    setMessage(null);
    try {
      const res = await authFetch(`${API_BASE}/lotes/${id}`, { method: "DELETE" });
      if (!res.ok) {
        const err = await safeJson(res);
        throw new Error(err?.message || "No se pudo eliminar");
      }
      await loadLotes();
      setMessage({ type: "success", text: "Lote eliminado." });
    } catch (e) {
      setMessage({ type: "error", text: e.message || "Error al eliminar" });
    } finally {
      setLoading(false);
    }
  };

  const handleToggleNotif = async (lote) => {
    const id = lote.id ?? lote.loteId;
    if (!id) return;

    const enabled = !(lote.notificacionActiva ?? true); // invertimos
    setLoading(true);
    setMessage(null);
    try {
      const res = await authFetch(
        `${API_BASE}/lotes/${id}/toggle-notificacion?enabled=${enabled}`,
        { method: "PATCH" }
      );
      if (!res.ok) {
        const err = await safeJson(res);
        throw new Error(err?.message || "No se pudo actualizar la notificación");
      }
      await loadLotes();
      setMessage({
        type: "success",
        text: enabled ? "Notificación activada." : "Notificación silenciada.",
      });
      // re-evaluar alertas y mantener abierto si siguen existiendo
      const a = computeAlerts(lotes);
      setShowAlertCenter(a.length > 0);
    } catch (e) {
      setMessage({ type: "error", text: e.message || "Error al actualizar notificación" });
    } finally {
      setLoading(false);
    }
  };

  // ---------- UI ----------
  if (loadingInit) {
    return <div className="p-6 text-center text-sm text-neutral-600">Cargando…</div>;
  }

  // Estado visual según fecha seleccionada en el form (orientativo)
  const selDays = daysUntil(form.fechaVencimiento);
  const selStatus = statusFromDays(selDays);

  return (
    <>
    <NavInventarioInventory />
    <div className="max-w-6xl mx-auto p-6">
      <h1 className="text-2xl font-semibold mb-4">Lotes</h1>

      {/* Centro de alertas - Toast */}
      {showAlertCenter && alerts.length > 0 && (
        <AlertToast
          alerts={alerts}
          getProductoNombre={getProductoNombre}
          daysUntil={daysUntil}
          statusFromDays={statusFromDays}
          onClose={() => setShowAlertCenter(false)}
          onToggle={handleToggleNotif}
        />
      )}

      {/* Mensajes generales */}
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

      {/* FORM Crear */}
      <div className="rounded-2xl border border-neutral-200 bg-white p-5 shadow-sm mb-8">
        <h2 className="text-lg font-medium mb-4">Crear lote</h2>
        <form onSubmit={handleSubmit} className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <div>
            <label className="block text-sm mb-1">Producto</label>
            <select
              name="productoId"
              value={form.productoId}
              onChange={handleChange}
              className="w-full rounded-lg border border-neutral-300 px-3 py-2 outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Selecciona un producto…</option>
              {productos.map((p) => (
                <option key={p.id ?? p.productoId ?? p.value} value={p.id ?? p.productoId ?? p.value}>
                  {p.nombre ?? p.name ?? `Producto ${p.id ?? ""}`}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm mb-1">Código de lote</label>
            <input
              type="text"
              name="codigoLote"
              value={form.codigoLote}
              onChange={handleChange}
              className="w-full rounded-lg border border-neutral-300 px-3 py-2 outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="sbGNKeaK"
            />
          </div>

          <div>
            <label className="block text-sm mb-1">Fecha de vencimiento</label>
            <input
              type="date"
              name="fechaVencimiento"
              value={form.fechaVencimiento}
              onChange={handleChange}
              className="w-full rounded-lg border border-neutral-300 px-3 py-2 outline-none focus:ring-2 focus:ring-blue-500"
            />
            {form.fechaVencimiento && (
              <div className="mt-2 text-xs">
                <span className={`inline-flex items-center rounded-full px-2 py-0.5 ${selStatus.cls}`}>
                  {selStatus.label}{!isNaN(selDays) && ` (${selDays} día(s))`}
                </span>
                <span className="ml-2 inline-flex items-center rounded-full bg-blue-100 px-2 py-0.5 text-blue-800">
                  🔔 Notificación: Activa por defecto
                </span>
              </div>
            )}
          </div>

          <div>
            <label className="block text-sm mb-1">Cantidad</label>
            <input
              type="number"
              name="cantidad"
              min="1"
              value={form.cantidad}
              onChange={handleChange}
              className="w-full rounded-lg border border-neutral-300 px-3 py-2 outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="100"
            />
          </div>

          <div className="md:col-span-2 flex gap-3">
            <button
              type="submit"
              disabled={loading}
              className="rounded-xl bg-blue-600 px-4 py-2 text-white hover:bg-blue-700 disabled:opacity-60"
            >
              Crear lote
            </button>
            <button
              type="button"
              onClick={resetForm}
              className="rounded-xl border border-neutral-300 px-4 py-2 hover:bg-neutral-50"
            >
              Limpiar
            </button>
          </div>
        </form>
      </div>

      {/* LISTA */}
      <div id="lotes-list" className="rounded-2xl border border-neutral-200 bg-white p-5 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-medium">
            Listado
            {alerts.length > 0 && (
              <span className="ml-2 inline-flex items-center rounded-full bg-amber-100 px-2 py-0.5 text-amber-800 text-xs">
                {alerts.length} en alerta
              </span>
            )}
          </h3>
          <button
            onClick={loadLotes}
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
                <th className="px-3 py-2 text-left">Producto</th>
                <th className="px-3 py-2 text-left">Código</th>
                <th className="px-3 py-2 text-left">Vence</th>
                <th className="px-3 py-2 text-left">Estado</th>
                <th className="px-3 py-2 text-left">Notif.</th>
                <th className="px-3 py-2 text-left">Cantidad</th>
                <th className="px-3 py-2 text-left">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {lotes.length === 0 ? (
                <tr>
                  <td colSpan="8" className="px-3 py-6 text-center text-neutral-500">No hay lotes.</td>
                </tr>
              ) : (
                lotes.map((l) => {
                  const id = l.id ?? l.loteId ?? "";
                  const fv = (l.fechaVencimiento || l.vencimiento || "").toString().slice(0, 10);
                  const d = daysUntil(fv);
                  const st = statusFromDays(d);
                  const notif = l.notificacionActiva ?? true;

                  const rowBg =
                    d < 0
                      ? "bg-red-50"
                      : d <= WARN_DAYS
                      ? "bg-amber-50"
                      : "";

                  return (
                    <tr key={id} className={`border-t border-neutral-100 ${rowBg}`}>
                      <td className="px-3 py-2">{id}</td>
                      <td className="px-3 py-2">{getProductoNombre(l)}</td>
                      <td className="px-3 py-2">{l.codigoLote ?? l.codigo ?? ""}</td>
                      <td className="px-3 py-2">{fv || "—"}</td>
                      <td className="px-3 py-2">
                        <span className={`inline-flex items-center rounded-full px-2 py-0.5 ${st.cls}`}>
                          {st.label}{!isNaN(d) && ` (${d} día(s))`}
                        </span>
                      </td>
                      <td className="px-3 py-2">
                        <span
                          className={`inline-flex items-center rounded-full px-2 py-0.5 ${
                            notif ? "bg-blue-100 text-blue-800" : "bg-neutral-100 text-neutral-600"
                          }`}
                          title={notif ? "Notificación activa" : "Notificación silenciada"}
                        >
                          {notif ? "🔔 Activa" : "🔕 Silenciada"}
                        </span>
                      </td>
                      <td className="px-3 py-2">{l.cantidad ?? 0}</td>
                      <td className="px-3 py-2">
                        <div className="flex flex-wrap gap-2">
                          <button
                            onClick={() => handleToggleNotif(l)}
                            className={`rounded-lg border px-3 py-1 ${
                              notif
                                ? "border-amber-300 text-amber-700 hover:bg-amber-100/60"
                                : "border-emerald-300 text-emerald-700 hover:bg-emerald-100/60"
                            }`}
                          >
                            {notif ? "Silenciar" : "Activar"}
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

function AlertToast({ alerts, getProductoNombre, daysUntil, statusFromDays, onClose, onToggle }) {
  return (
    <div className="fixed right-4 top-4 z-50 w-[min(420px,calc(100vw-2rem))]">
      <div className="rounded-2xl border border-amber-300 bg-white shadow-xl">
        <div className="flex items-center justify-between px-4 py-3 border-b border-amber-200 bg-amber-50 rounded-t-2xl">
          <div className="flex items-center gap-2 text-amber-800">
            <span>🔔</span>
            <strong>Alertas de vencimiento</strong>
            <span className="ml-2 text-xs rounded-full bg-amber-200 px-2 py-0.5">
              {alerts.length}
            </span>
          </div>
          <button
            onClick={onClose}
            className="text-sm rounded-lg border border-neutral-300 px-2 py-1 hover:bg-neutral-50"
          >
            Cerrar
          </button>
        </div>

        <div className="max-h-[60vh] overflow-auto divide-y divide-neutral-100">
          {alerts.map((l) => {
            const id = l.id ?? l.loteId ?? "";
            const fv = (l.fechaVencimiento || l.vencimiento || "").toString().slice(0, 10);
            const d = daysUntil(fv);
            const st = statusFromDays(d);
            const prod = getProductoNombre(l);
            const notif = l.notificacionActiva ?? true;

            return (
              <div key={id} className="p-4">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="text-sm font-medium">{prod}</div>
                    <div className="text-xs text-neutral-600">
                      Lote <span className="font-mono">{l.codigoLote ?? l.codigo ?? ""}</span> • Vence {fv} •{" "}
                      <span className={`px-1 rounded ${st.cls}`}>{st.label}</span>
                      {!isNaN(d) && ` (${d} día(s))`}
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <a
                      href="#lotes-list"
                      className="text-xs rounded-lg border border-neutral-300 px-2 py-1 hover:bg-neutral-50"
                    >
                      Ver lista
                    </a>
                    <button
                      onClick={() => onToggle(l)}
                      className={`text-xs rounded-lg border px-2 py-1 ${
                        notif
                          ? "border-amber-300 text-amber-700 hover:bg-amber-100/60"
                          : "border-emerald-300 text-emerald-700 hover:bg-emerald-100/60"
                      }`}
                    >
                      {notif ? "Silenciar" : "Activar"}
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        <div className="px-4 py-3 text-xs text-neutral-600 bg-neutral-50 rounded-b-2xl">
          Las notificaciones solo se muestran si <strong>🔔 notificación</strong> está activa en el lote.
        </div>
      </div>
    </div>
  );
}

/* ---------- util ---------- */
async function safeJson(res) {
  try {
    return await res.json();
  } catch {
    return null;
  }
}
