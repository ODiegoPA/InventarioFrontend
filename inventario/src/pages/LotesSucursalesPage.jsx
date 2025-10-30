// src/pages/LoteSucursalesPage.jsx
import { useEffect, useMemo, useState } from "react";
import NavInventarioInventory from "../components/Menu";

const API_BASE = "http://localhost:8081/api";

export default function LoteSucursalesPage() {
  const [lotes, setLotes] = useState([]);
  const [sucursales, setSucursales] = useState([]);
  const [loteDetalle, setLoteDetalle] = useState(null);
  const [productoDetalle, setProductoDetalle] = useState(null);
  const [marcaDetalle, setMarcaDetalle] = useState(null);
  const [loteSucursales, setLoteSucursales] = useState([]);

  const [productCache, setProductCache] = useState({});

  const [form, setForm] = useState({ loteId: "", sucursalId: "", cantidad: 1 });

  const [loadingInit, setLoadingInit] = useState(true);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null);

  const lotesMap = useMemo(
    () => Object.fromEntries((lotes || []).map((l) => [String(l.id ?? l.loteId ?? ""), l])),
    [lotes]
  );
  const sucursalesMap = useMemo(
    () => Object.fromEntries((sucursales || []).map((s) => [String(s.id ?? s.sucursalId ?? ""), s])),
    [sucursales]
  );

  useEffect(() => {
    (async () => {
      try {
        const [resLotes, resSuc, resLS] = await Promise.all([
          fetch(`${API_BASE}/lotes`),
          fetch(`${API_BASE}/sucursales`),
          fetch(`${API_BASE}/lote-sucursales`),
        ]);
        if (!resLotes.ok) throw new Error("No se pudo cargar lotes");
        if (!resSuc.ok) throw new Error("No se pudo cargar sucursales");
        if (!resLS.ok) throw new Error("No se pudo cargar lote-sucursales");

        setLotes(await resLotes.json());
        setSucursales(await resSuc.json());
        setLoteSucursales(await resLS.json());
      } catch (e) {
        setMessage({ type: "error", text: e.message || "Error inicial" });
      } finally {
        setLoadingInit(false);
      }
    })();
  }, []);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoteDetalle(null);
      setProductoDetalle(null);
      setMarcaDetalle(null);
      const id = form.loteId;
      if (!id) return;

      try {
        // 1) Detalle lote
        let det = null;
        const r = await fetch(`${API_BASE}/lotes/${id}`);
        if (r.ok) det = await r.json();
        if (!det) det = lotesMap[String(id)] ?? { id: Number(id) };
        if (cancelled) return;
        setLoteDetalle(det);

        // 2) Producto del lote
        const productoId =
          det?.producto?.id ??
          det?.product?.id ??
          det?.productoId ??
          det?.productId ??
          lotesMap[String(id)]?.producto?.id ??
          lotesMap[String(id)]?.productoId;

        if (productoId) {
          const rp = await fetch(`${API_BASE}/productos/${productoId}`);
          if (cancelled) return;
          if (rp.ok) {
            const prod = await rp.json();
            setProductoDetalle(prod);

            // 3) Marca
            const marcaId = prod?.marca?.id ?? prod?.marcaId;
            if (marcaId && !(prod?.marca?.nombre)) {
              const rm = await fetch(`${API_BASE}/marcas/${marcaId}`);
              if (!cancelled && rm.ok) setMarcaDetalle(await rm.json());
            } else if (prod?.marca) {
              setMarcaDetalle(prod.marca);
            }
          } else {
            setProductoDetalle({ id: Number(productoId) });
          }
        }
      } catch {
        // silencioso
      }
    })();
    return () => { cancelled = true; };
  }, [form.loteId, lotesMap]);

  const handleChange = (e) => {
    const { name, value, type } = e.target;
    setForm((f) => ({
      ...f,
      [name]: type === "number" ? (value === "" ? "" : Number(value)) : value,
    }));
  };

  const resetForm = () => setForm({ loteId: "", sucursalId: "", cantidad: 1 });

  const loadLoteSucursales = async () => {
    const res = await fetch(`${API_BASE}/lote-sucursales`);
    if (!res.ok) throw new Error("No se pudo refrescar la lista");
    setLoteSucursales(await res.json());
  };

  const dateOnly = (d) => (d ? d.toString().slice(0, 10) : "");

  const buildPayload = () => {
    const loteSel = loteDetalle ?? lotesMap[String(form.loteId)] ?? { id: Number(form.loteId) };
    const sucSel = sucursalesMap[String(form.sucursalId)] ?? { id: Number(form.sucursalId) };

    const prod = productoDetalle || {};
    const marca = marcaDetalle || prod.marca || {};

    const productoPayload = {
      id: prod.id ?? 0,
      nombre: prod.nombre ?? "string",
      marca: {
        id: marca.id ?? prod.marcaId ?? 0,
        nombre: marca.nombre ?? "string",
      },
      descripcion: prod.descripcion ?? "string",
      activo: typeof prod.activo === "boolean" ? prod.activo : true,
    };

    const lotePayload = {
      id: Number(form.loteId),
      producto: productoPayload,
      codigoLote: loteSel.codigoLote ?? loteSel.codigo ?? "string",
      fechaVencimiento: dateOnly(loteSel.fechaVencimiento || loteSel.vencimiento || "2025-10-30"),
      cantidad: Number.isFinite(loteSel.cantidad) ? loteSel.cantidad : 0,
      notificacionActiva:
        typeof loteSel.notificacionActiva === "boolean" ? loteSel.notificacionActiva : true,
      dadoDeBaja: typeof loteSel.dadoDeBaja === "boolean" ? loteSel.dadoDeBaja : false,
    };

    const sucursalPayload = {
      id: Number(form.sucursalId),
      nombre: sucSel.nombre ?? "string",
      direccion: sucSel.direccion ?? "string",
    };

    return {
      id: 0,
      lote: lotePayload,
      sucursal: sucursalPayload,
      cantidad: Number(form.cantidad),
    };
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage(null);

    if (!form.loteId) return setMessage({ type: "error", text: "Debe seleccionar un lote." });
    if (!form.sucursalId) return setMessage({ type: "error", text: "Debe seleccionar una sucursal." });
    const cant = Number(form.cantidad);
    if (!Number.isFinite(cant) || cant <= 0)
      return setMessage({ type: "error", text: "La cantidad debe ser mayor a 0." });

    const payload = buildPayload();

    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/lote-sucursales`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        const err = await safeJson(res);
        throw new Error(err?.message || "No se pudo crear la relación lote-sucursal");
      }
      await loadLoteSucursales();
      setMessage({ type: "success", text: "Lote-Sucursal creado." });
      resetForm();
      setLoteDetalle(null);
      setProductoDetalle(null);
      setMarcaDetalle(null);
    } catch (e) {
      setMessage({ type: "error", text: e.message || "Error al crear" });
    } finally {
      setLoading(false);
    }
  };

  if (loadingInit) return <div className="p-6 text-center text-sm text-neutral-600">Cargando…</div>;

  return (
    <>
    <NavInventarioInventory />
    <div className="max-w-6xl mx-auto p-6">
      <h1 className="text-2xl font-semibold mb-4">Lote-Sucursales</h1>

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
        <h2 className="text-lg font-medium mb-4">Crear Lote-Sucursal</h2>
        <form onSubmit={handleSubmit} className="grid grid-cols-1 gap-4 md:grid-cols-3">
          {/* Lote */}
          <div>
            <label className="block text-sm mb-1">Lote</label>
            <select
              name="loteId"
              value={form.loteId}
              onChange={handleChange}
              className="w-full rounded-lg border border-neutral-300 px-3 py-2 outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Selecciona un lote…</option>
              {lotes.map((l) => (
                <option key={l.id ?? l.loteId} value={l.id ?? l.loteId}>
                  {l.codigoLote ?? l.codigo ?? `Lote ${l.id ?? ""}`}
                </option>
              ))}
            </select>

            {form.loteId && (
              <div className="mt-2 space-y-1 text-xs text-neutral-700">
                <div>
                  Producto:{" "}
                  <strong>
                    {productoDetalle?.nombre ??
                      loteDetalle?.producto?.nombre ??
                      "…"}
                  </strong>
                </div>
                <div>
                  Marca:{" "}
                  <strong>
                    {marcaDetalle?.nombre ??
                      productoDetalle?.marca?.nombre ??
                      "…"}
                  </strong>
                </div>
              </div>
            )}
          </div>

          {/* Sucursal */}
          <div>
            <label className="block text-sm mb-1">Sucursal</label>
            <select
              name="sucursalId"
              value={form.sucursalId}
              onChange={handleChange}
              className="w-full rounded-lg border border-neutral-300 px-3 py-2 outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Selecciona una sucursal…</option>
              {sucursales.map((s) => (
                <option key={s.id ?? s.sucursalId} value={s.id ?? s.sucursalId}>
                  {s.nombre ?? `Sucursal ${s.id ?? ""}`}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm mb-1">Cantidad (a asignar)</label>
            <input
              type="number"
              name="cantidad"
              min="1"
              value={form.cantidad}
              onChange={handleChange}
              className="w-full rounded-lg border border-neutral-300 px-3 py-2 outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="10"
            />
          </div>

          <div className="md:col-span-3 flex gap-3">
            <button
              type="submit"
              disabled={loading}
              className="rounded-xl bg-blue-600 px-4 py-2 text-white hover:bg-blue-700 disabled:opacity-60"
            >
              Crear
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

      <div className="rounded-2xl border border-neutral-200 bg-white p-5 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-medium">Listado</h3>
          <button
            onClick={loadLoteSucursales}
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
                <th className="px-3 py-2 text-left">Lote</th>
                <th className="px-3 py-2 text-left">Producto</th>
                <th className="px-3 py-2 text-left">Sucursal</th>
                <th className="px-3 py-2 text-left">Dirección</th>
                <th className="px-3 py-2 text-left">Cantidad</th>
              </tr>
            </thead>
            <tbody>
              {(loteSucursales || []).length === 0 ? (
                <tr>
                  <td colSpan="6" className="px-3 py-6 text-center text-neutral-500">
                    No hay registros.
                  </td>
                </tr>
              ) : (
                loteSucursales.map((r) => (
                  <LoteSucursalRow
                    key={r.id ?? r.loteSucursalId ?? `${r.loteId}-${r.sucursalId}`}
                    row={r}
                    lotesMap={lotesMap}
                    sucursalesMap={sucursalesMap}
                    productCache={productCache}
                    setProductCache={setProductCache}
                  />
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
    </>
  );
}


function LoteSucursalRow({ row, lotesMap, sucursalesMap, productCache, setProductCache }) {
  const [productName, setProductName] = useState(() =>
    row?.lote?.producto?.nombre ??
    row?.lote?.product?.nombre ??
    lotesMap[String(row.loteId ?? row.lote?.id)]?.producto?.nombre ??
    "—"
  );

  const loteId = row.loteId ?? row.lote?.id ?? null;
  const sucId = row.sucursalId ?? row.sucursal?.id ?? null;
  const loteObj = lotesMap[String(loteId)];
  const sucObj = sucursalesMap[String(sucId)];

  const codigoLote =
    row.lote?.codigoLote ?? loteObj?.codigoLote ?? row.lote?.codigo ?? "—";

  const productId =
    row?.lote?.producto?.id ??
    row?.lote?.product?.id ??
    row?.lote?.productoId ??
    row?.lote?.productId ??
    loteObj?.producto?.id ??
    loteObj?.productoId ??
    null;

  useEffect(() => {
    let cancelled = false;

    if (!productId || (productName && productName !== "—")) return;

    const cached = productCache?.[productId];
    if (cached?.nombre) {
      setProductName(cached.nombre);
      return;
    }

    (async () => {
      try {
        const resp = await fetch(`${API_BASE}/productos/${productId}`);
        if (!resp.ok) return;
        const prod = await resp.json();
        if (cancelled) return;

        const nombre = prod?.nombre ?? "—";
        setProductName(nombre);

        setProductCache((prev) => ({
          ...prev,
          [productId]: { ...(prev?.[productId] || {}), ...prod },
        }));
      } catch {
        // ignore
      }
    })();

    return () => { cancelled = true; };
  }, [productId, productName, productCache, setProductCache]);

  return (
    <tr className="border-t border-neutral-100">
      <td className="px-3 py-2">{row.id ?? row.loteSucursalId ?? ""}</td>
      <td className="px-3 py-2">{codigoLote}</td>
      <td className="px-3 py-2">{productName}</td>
      <td className="px-3 py-2">{sucObj?.nombre ?? row.sucursal?.nombre ?? "—"}</td>
      <td className="px-3 py-2">{sucObj?.direccion ?? row.sucursal?.direccion ?? "—"}</td>
      <td className="px-3 py-2">{row.cantidad ?? 0}</td>
    </tr>
  );
}

async function safeJson(res) {
  try {
    return await res.json();
  } catch {
    return null;
  }
}
