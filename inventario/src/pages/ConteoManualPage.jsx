import { useEffect, useState } from "react";
import NavInventarioInventory from "../components/Menu";
import { authFetch, publicFetch } from "../utils/api";

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

export default function ConteoManualPage() {
  const [productos, setProductos] = useState([]);
  const [stock, setStock] = useState([]);
  const [sucursales, setSucursales] = useState([]);
  const [sucursalId, setSucursalId] = useState(null);
  const [counts, setCounts] = useState({}); // productoId -> cantidad contada
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    setLoading(true);
    setError(null);
    Promise.all([
      publicFetch("http://localhost:8081/api/productos").then((r) => r.json()),
      authFetch("http://localhost:8081/api/stock").then((r) => r.json()),
      publicFetch("http://localhost:8081/api/sucursales").then((r) => r.json()),
    ])
      .then(([productosData, stockData, sucursalesData]) => {
        setProductos(productosData || []);
        setStock(stockData || []);
        setSucursales(sucursalesData || []);
        if ((sucursalesData || []).length > 0)
          setSucursalId((sucursalesData[0] || {}).id);
      })
      .catch((err) => {
        console.error(err);
        setError("Error al cargar datos. Revisa el backend o CORS.");
      })
      .finally(() => setLoading(false));
  }, []);

  // stock map por sucursal -> productoId -> cantidad
  const stockMap = {};
  (stock || []).forEach((s) => {
    if (!stockMap[s.sucursalId]) stockMap[s.sucursalId] = {};
    stockMap[s.sucursalId][s.productoId] = Number(s.cantidad || 0);
  });

  const productosForSucursal = (productos || []).map((p) => ({
    ...p,
    currentCantidad: (stockMap[sucursalId] && stockMap[sucursalId][p.id]) || 0,
  }));

  function setCount(productoId, value) {
    setCounts((prev) => ({ ...prev, [productoId]: value }));
  }

  function handleExport() {
    // Construir lista de ajustes: productoId, productoNombre, actual, contado, diferencia
    const rows = [
      [
        "sucursalId",
        "sucursalNombre",
        "productoId",
        "productoNombre",
        "actual",
        "contado",
        "diferencia",
      ],
    ];
    const sucursal = (sucursales || []).find((s) => s.id === sucursalId);
    productosForSucursal.forEach((p) => {
      const contado = Number(counts[p.id] ?? "");
      if (Number.isNaN(contado)) return;
      const actual = p.currentCantidad || 0;
      const diff = contado - actual;
      rows.push([
        sucursalId,
        sucursal ? sucursal.nombre : "",
        p.id,
        p.nombre || "",
        actual,
        contado,
        diff,
      ]);
    });

    downloadCSV(`conteo-sucursal-${sucursalId || "unknown"}.csv`, rows);
    // También mostrar en consola el payload que se podría enviar al backend
    const adjustments = rows.slice(1).map((r) => ({
      sucursalId: r[0],
      productoId: r[2],
      actual: Number(r[4]),
      contado: Number(r[5]),
      diferencia: Number(r[6]),
    }));
    console.log("Ajustes preparados:", adjustments);
    alert(
      "CSV generado y ajustes registrados en la consola. Si quieres que los envíe al backend, proporciona el endpoint y lo implemento."
    );
  }

  if (loading)
    return <div className="p-6">Cargando datos para conteo manual...</div>;
  if (error) return <div className="p-6 text-red-600">{error}</div>;

  return (
    <>
      <NavInventarioInventory />
      <div className="container mx-auto p-6">
        <h1 className="text-2xl font-bold mb-4">Conteo manual de inventario</h1>

        <div className="mb-4 flex items-center gap-4">
          <label className="text-sm font-medium">Sucursal:</label>
          <select
            className="border rounded p-2"
            value={sucursalId ?? ""}
            onChange={(e) => setSucursalId(Number(e.target.value))}
          >
            {(sucursales || []).map((s) => (
              <option key={s.id} value={s.id}>
                {s.nombre}
              </option>
            ))}
          </select>
        </div>

        <div className="bg-white shadow rounded-lg p-4 overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                  Producto
                </th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                  Actual
                </th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                  Contado
                </th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                  Diferencia
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {productosForSucursal.map((p) => {
                const contado = counts[p.id] === undefined ? "" : counts[p.id];
                const actual = p.currentCantidad || 0;
                const diff = Number(countedOrZero(contado)) - actual;
                return (
                  <tr key={p.id}>
                    <td className="px-4 py-2">{p.nombre}</td>
                    <td className="px-4 py-2">{actual}</td>
                    <td className="px-4 py-2">
                      <input
                        type="number"
                        className="border rounded px-2 py-1 w-28"
                        value={contado}
                        onChange={(e) =>
                          setCount(
                            p.id,
                            e.target.value === "" ? "" : Number(e.target.value)
                          )
                        }
                      />
                    </td>
                    <td
                      className={`px-4 py-2 ${
                        diff === 0
                          ? "text-gray-600"
                          : diff > 0
                          ? "text-green-600"
                          : "text-red-600"
                      }`}
                    >
                      {Number.isNaN(diff) ? "-" : diff}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        <div className="mt-4 flex gap-3">
          <button
            className="bg-blue-600 text-white px-4 py-2 rounded"
            onClick={handleExport}
          >
            Exportar ajustes (CSV)
          </button>
          <button
            className="bg-gray-200 px-4 py-2 rounded"
            onClick={() => {
              setCounts({});
              alert("Conteos reiniciados en la sesión.");
            }}
          >
            Reiniciar
          </button>
        </div>
      </div>
    </>
  );
}

function countedOrZero(v) {
  if (v === "" || v === null || v === undefined) return 0;
  const n = Number(v);
  return Number.isNaN(n) ? 0 : n;
}
