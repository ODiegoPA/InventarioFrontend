import { useEffect, useMemo, useState } from "react";

function downloadCSV(filename, rows) {
  const csvContent = rows
    .map((r) => r.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(","))
    .join("\n");
  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

export default function MovimientosPage() {
  const [movimientos, setMovimientos] = useState([]);
  const [productos, setProductos] = useState([]);
  const [sucursales, setSucursales] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [fProducto, setFProducto] = useState("");
  const [fTipo, setFTipo] = useState("");

  useEffect(() => {
    setLoading(true);
    setError(null);
    Promise.all([
      fetch("http://localhost:8081/api/movimientos").then((r) => r.json()),
      fetch("http://localhost:8081/api/productos").then((r) => r.json()),
      fetch("http://localhost:8081/api/sucursales").then((r) => r.json()),
    ])
      .then(([movData, prodData, sucData]) => {
        setMovimientos(movData || []);
        setProductos(prodData || []);
        setSucursales(sucData || []);
      })
      .catch((err) => {
        console.error(err);
        setError("Error cargando movimientos. Revisa backend/CORS.");
      })
      .finally(() => setLoading(false));
  }, []);

  const productosMap = useMemo(
    () => Object.fromEntries((productos || []).map((p) => [p.id, p])),
    [productos]
  );
  const sucursalesMap = useMemo(
    () => Object.fromEntries((sucursales || []).map((s) => [s.id, s])),
    [sucursales]
  );

  const tipos = useMemo(() => {
    const set = new Set((movimientos || []).map((m) => m.tipo));
    return Array.from(set).sort();
  }, [movimientos]);

  const filtered = useMemo(() => {
    return (movimientos || [])
      .filter((m) => {
        if (fProducto && String(m.productoId) !== String(fProducto))
          return false;
        if (fTipo && m.tipo !== fTipo) return false;
        return true;
      })
      .sort(
        (a, b) => new Date(b.fechaMovimiento) - new Date(a.fechaMovimiento)
      );
  }, [movimientos, fProducto, fTipo]);

  function handleExport() {
    const header = [
      "id",
      "fechaMovimiento",
      "tipo",
      "productoId",
      "productoNombre",
      "loteId",
      "origenId",
      "origenNombre",
      "destinoId",
      "destinoNombre",
      "cantidad",
      "motivo",
    ];
    const rows = [header];
    filtered.forEach((m) => {
      const prod = productosMap[m.productoId];
      const origen = m.origenId
        ? sucursalesMap[m.origenId]
          ? sucursalesMap[m.origenId].nombre
          : String(m.origenId)
        : "";
      const destino = m.destinoId
        ? sucursalesMap[m.destinoId]
          ? sucursalesMap[m.destinoId].nombre
          : String(m.destinoId)
        : "";
      rows.push([
        m.id,
        m.fechaMovimiento,
        m.tipo,
        m.productoId,
        prod ? prod.nombre : "",
        m.loteId,
        m.origenId ?? "",
        origen,
        m.destinoId ?? "",
        destino,
        m.cantidad,
        m.motivo || "",
      ]);
    });
    downloadCSV("movimientos.csv", rows);
  }

  if (loading) return <div className="p-6">Cargando movimientos...</div>;
  if (error) return <div className="p-6 text-red-600">{error}</div>;

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-2xl font-bold mb-4">Reporte de movimientos</h1>

      <div className="mb-4 flex flex-wrap gap-3 items-center">
        <div>
          <label className="block text-sm text-gray-600">Producto</label>
          <select
            value={fProducto}
            onChange={(e) => setFProducto(e.target.value)}
            className="border rounded p-2"
          >
            <option value="">Todos</option>
            {(productos || []).map((p) => (
              <option key={p.id} value={p.id}>
                {p.nombre}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm text-gray-600">Tipo</label>
          <select
            value={fTipo}
            onChange={(e) => setFTipo(e.target.value)}
            className="border rounded p-2"
          >
            <option value="">Todos</option>
            {tipos.map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </select>
        </div>

        <div className="ml-auto">
          <button
            className="bg-blue-600 text-white px-4 py-2 rounded mr-2"
            onClick={handleExport}
          >
            Exportar CSV
          </button>
        </div>
      </div>

      <div className="bg-white shadow rounded-lg overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                Fecha
              </th>
              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                Tipo
              </th>
              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                Producto
              </th>
              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                Lote
              </th>
              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                Origen
              </th>
              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                Destino
              </th>
              <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase">
                Cantidad
              </th>
              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                Motivo
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filtered.map((m) => {
              const prod = productosMap[m.productoId];
              const origen = m.origenId
                ? sucursalesMap[m.origenId]
                  ? sucursalesMap[m.origenId].nombre
                  : `#${m.origenId}`
                : "-";
              const destino = m.destinoId
                ? sucursalesMap[m.destinoId]
                  ? sucursalesMap[m.destinoId].nombre
                  : `#${m.destinoId}`
                : "-";
              return (
                <tr key={m.id}>
                  <td className="px-4 py-2 text-sm text-gray-700">
                    {new Date(m.fechaMovimiento).toLocaleString()}
                  </td>
                  <td className="px-4 py-2 text-sm font-medium">{m.tipo}</td>
                  <td className="px-4 py-2 text-sm">
                    {prod ? prod.nombre : `#${m.productoId}`}
                  </td>
                  <td className="px-4 py-2 text-sm">{m.loteId ?? "-"}</td>
                  <td className="px-4 py-2 text-sm">{origen}</td>
                  <td className="px-4 py-2 text-sm">{destino}</td>
                  <td className="px-4 py-2 text-right text-sm font-semibold">
                    {m.cantidad}
                  </td>
                  <td className="px-4 py-2 text-sm text-gray-600">
                    {m.motivo ?? ""}
                  </td>
                </tr>
              );
            })}
            {filtered.length === 0 && (
              <tr>
                <td colSpan={8} className="px-4 py-6 text-center text-gray-500">
                  No hay movimientos que coincidan con el filtro.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
