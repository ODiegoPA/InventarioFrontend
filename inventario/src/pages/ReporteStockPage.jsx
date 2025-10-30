import { useEffect, useState } from "react";

export default function ReporteStockPage() {
  const [productos, setProductos] = useState([]);
  const [stock, setStock] = useState([]);
  const [sucursales, setSucursales] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    setLoading(true);
    setError(null);
    Promise.all([
      fetch("http://localhost:8081/api/productos").then((r) => r.json()),
      fetch("http://localhost:8081/api/stock").then((r) => r.json()),
      fetch("http://localhost:8081/api/sucursales").then((r) => r.json()),
    ])
      .then(([productosData, stockData, sucursalesData]) => {
        setProductos(productosData || []);
        setStock(stockData || []);
        setSucursales(sucursalesData || []);
      })
      .catch((err) => {
        console.error(err);
        setError("Error al cargar datos. Revisa el backend o CORS.");
      })
      .finally(() => setLoading(false));
  }, []);

  // Construir mapas para acceso rápido
  const productosMap = Object.fromEntries(
    (productos || []).map((p) => [p.id, p])
  );

  // Agrupar stock por sucursal
  const stockPorSucursal = {};
  (stock || []).forEach((s) => {
    const sid = s.sucursalId;
    if (!stockPorSucursal[sid]) stockPorSucursal[sid] = [];
    stockPorSucursal[sid].push(s);
  });

  if (loading) return <div className="p-6">Cargando reporte de stock...</div>;
  if (error) return <div className="p-6 text-red-600">{error}</div>;

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-2xl font-bold mb-4">Reporte de stock por sucursal</h1>
      <p className="text-sm text-gray-600 mb-6">
        Lista de productos y sus cantidades por sucursal.
      </p>

      <div className="grid gap-6">
        {sucursales.length === 0 && (
          <div className="text-gray-600">No hay sucursales registradas.</div>
        )}

        {sucursales.map((sucursal) => (
          <div key={sucursal.id} className="bg-white shadow rounded-lg p-4">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-lg font-semibold">{sucursal.nombre}</h2>
                <p className="text-sm text-gray-500">{sucursal.direccion}</p>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Producto
                    </th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Cantidad
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {(stockPorSucursal[sucursal.id] || []).length === 0 && (
                    <tr>
                      <td colSpan={2} className="px-4 py-3 text-gray-500">
                        Sin stock registrado en esta sucursal.
                      </td>
                    </tr>
                  )}

                  {(stockPorSucursal[sucursal.id] || []).map((item) => {
                    const producto = productosMap[item.productoId];
                    return (
                      <tr key={item.id}>
                        <td className="px-4 py-3 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">
                            {producto
                              ? producto.nombre
                              : `Producto #${item.productoId}`}
                          </div>
                          {producto && producto.marcaId && (
                            <div className="text-xs text-gray-500">
                              ID marca: {producto.marcaId}
                            </div>
                          )}
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap">
                          <div className="text-sm text-gray-900">
                            {item.cantidad}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
