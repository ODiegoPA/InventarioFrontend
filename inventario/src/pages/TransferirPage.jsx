import { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";

export default function TransferirPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const prefill = useMemo(() => location.state || {}, [location.state]);

  const [productos, setProductos] = useState([]);
  const [sucursales, setSucursales] = useState([]);
  const [lotes, setLotes] = useState([]);

  const [productoId, setProductoId] = useState(prefill.producto?.id ?? "");
  const [loteId, setLoteId] = useState(prefill.lote?.id ?? "");
  const [origenId, setOrigenId] = useState("");
  const [destinoId, setDestinoId] = useState("");
  const [cantidad, setCantidad] = useState(0);
  const [motivo, setMotivo] = useState("Transferencia entre sucursales");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    Promise.all([
      fetch("http://localhost:8081/api/productos").then((r) => r.json()),
      fetch("http://localhost:8081/api/sucursales").then((r) => r.json()),
      fetch("http://localhost:8081/api/lotes")
        .then((r) => r.json())
        .catch(() => []),
    ])
      .then(([prodData, sucData, lotData]) => {
        setProductos(prodData || []);
        setSucursales(sucData || []);
        setLotes(lotData || []);
        // Prefill origen if lote provided (some backends tie lote to sucursal via stock endpoint; we leave empty)
        if (prefill.lote && prefill.lote.cantidad)
          setCantidad(prefill.lote.cantidad);
      })
      .catch((err) => {
        console.error(err);
        setError("Error cargando datos. Revisa backend/CORS.");
      });
  }, [prefill]);

  function buildPayload() {
    const prod = productos.find((p) => String(p.id) === String(productoId));
    const lote = lotes.find((l) => String(l.id) === String(loteId));
    const origen = sucursales.find((s) => String(s.id) === String(origenId));
    const destino = sucursales.find((s) => String(s.id) === String(destinoId));

    return {
      id: 0,
      lote: lote
        ? {
            id: lote.id,
            producto: prod ? { id: prod.id, nombre: prod.nombre } : null,
            codigoLote: lote.codigoLote,
            fechaVencimiento: lote.fechaVencimiento,
            cantidad: lote.cantidad,
            notificacionActiva: lote.notificacionActiva,
            dadoDeBaja: lote.dadoDeBaja,
          }
        : null,
      producto: prod ? { id: prod.id, nombre: prod.nombre } : null,
      origen: origen
        ? { id: origen.id, nombre: origen.nombre, direccion: origen.direccion }
        : null,
      destino: destino
        ? {
            id: destino.id,
            nombre: destino.nombre,
            direccion: destino.direccion,
          }
        : null,
      cantidad: Number(cantidad),
      fechaMovimiento: new Date().toISOString(),
      tipoMovimiento: "TRANSFERENCIA",
      motivo: motivo,
    };
  }

  function handleSubmit(e) {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    const payload = buildPayload();

    fetch("http://localhost:8081/api/movimientos", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    })
      .then(async (r) => {
        if (!r.ok) throw new Error(await r.text());
        return r.json();
      })
      .then(() => {
        alert("Transferencia registrada correctamente.");
        navigate("/movimientos");
      })
      .catch((err) => {
        console.error(err);
        setError(
          "Error al registrar la transferencia: " + (err.message || err)
        );
      })
      .finally(() => setSubmitting(false));
  }

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-2xl font-bold mb-4">
        Transferir productos entre sucursales
      </h1>
      {error && <div className="mb-4 text-red-600">{error}</div>}

      <form
        onSubmit={handleSubmit}
        className="bg-white shadow rounded-lg p-4 grid gap-4"
      >
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm text-gray-600">Producto</label>
            <select
              className="border rounded p-2 w-full"
              value={productoId}
              onChange={(e) => setProductoId(e.target.value)}
              required
            >
              <option value="">-- selecciona --</option>
              {productos.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.nombre}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm text-gray-600">
              Lote (opcional)
            </label>
            <select
              className="border rounded p-2 w-full"
              value={loteId}
              onChange={(e) => setLoteId(e.target.value)}
            >
              <option value="">Ninguno</option>
              {lotes
                .filter((l) => !l.dadoDeBaja)
                .map((l) => (
                  <option key={l.id} value={l.id}>
                    {l.codigoLote} — {l.producto?.nombre ?? ""} — {l.cantidad}
                  </option>
                ))}
            </select>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm text-gray-600">
              Origen (sucursal)
            </label>
            <select
              className="border rounded p-2 w-full"
              value={origenId}
              onChange={(e) => setOrigenId(e.target.value)}
              required
            >
              <option value="">-- selecciona --</option>
              {sucursales.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.nombre}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm text-gray-600">
              Destino (sucursal)
            </label>
            <select
              className="border rounded p-2 w-full"
              value={destinoId}
              onChange={(e) => setDestinoId(e.target.value)}
              required
            >
              <option value="">-- selecciona --</option>
              {sucursales.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.nombre}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-4 items-end">
          <div>
            <label className="block text-sm text-gray-600">Cantidad</label>
            <input
              type="number"
              min="1"
              className="border rounded p-2 w-full"
              value={cantidad}
              onChange={(e) => setCantidad(e.target.value)}
              required
            />
          </div>
          <div className="col-span-2">
            <label className="block text-sm text-gray-600">Motivo</label>
            <input
              type="text"
              className="border rounded p-2 w-full"
              value={motivo}
              onChange={(e) => setMotivo(e.target.value)}
            />
          </div>
        </div>

        <div className="flex gap-3">
          <button
            type="submit"
            className="bg-green-600 text-white px-4 py-2 rounded"
            disabled={submitting}
          >
            Enviar transferencia
          </button>
          <button
            type="button"
            className="bg-gray-200 px-4 py-2 rounded"
            onClick={() => navigate(-1)}
          >
            Cancelar
          </button>
        </div>
      </form>
    </div>
  );
}
