import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import NavInventarioInventory from "../components/Menu";
import { authFetch } from "../utils/api";

export default function LotesVencidosPage() {
  const [lotes, setLotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    setLoading(true);
    setError(null);
    authFetch("http://localhost:8081/api/lotes")
      .then((r) => r.json())
      .then((data) => setLotes(data || []))
      .catch((err) => {
        console.error(err);
        setError("No se pudieron cargar los lotes. Revisa backend/CORS.");
      })
      .finally(() => setLoading(false));
  }, []);

  const hoy = new Date();
  const vencidos = (lotes || []).filter((l) => {
    if (!l || !l.fechaVencimiento) return false;
    const fv = new Date(l.fechaVencimiento);
    return fv < hoy && !l.dadoDeBaja;
  });

  if (loading) return <div className="p-6">Cargando lotes...</div>;
  if (error) return <div className="p-6 text-red-600">{error}</div>;

  return (
    <>
      <NavInventarioInventory />
      <div className="container mx-auto p-6">
        <h1 className="text-2xl font-bold mb-4">Lotes vencidos</h1>
        <p className="text-sm text-gray-600 mb-6">
          Lista de lotes cuya fecha de vencimiento ya pasó y no están dados de
          baja.
        </p>

        <div className="bg-white shadow rounded-lg overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                  Código lote
                </th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                  Producto
                </th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                  Vencimiento
                </th>
                <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase">
                  Cantidad
                </th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {vencidos.length === 0 && (
                <tr>
                  <td
                    colSpan={5}
                    className="px-4 py-6 text-center text-gray-500"
                  >
                    No hay lotes vencidos.
                  </td>
                </tr>
              )}
              {vencidos.map((l) => (
                <tr key={l.id}>
                  <td className="px-4 py-3 text-sm">{l.codigoLote}</td>
                  <td className="px-4 py-3 text-sm">
                    {l.producto?.nombre ?? `#${l.producto?.id ?? ""}`}
                  </td>
                  <td className="px-4 py-3 text-sm">
                    {new Date(l.fechaVencimiento).toLocaleDateString()}
                  </td>
                  <td className="px-4 py-3 text-right text-sm font-semibold">
                    {l.cantidad}
                  </td>
                  <td className="px-4 py-3">
                    <button
                      className="bg-yellow-500 text-white px-3 py-1 rounded mr-2"
                      onClick={() =>
                        navigate("/transferir", {
                          state: { lote: l, producto: l.producto },
                        })
                      }
                    >
                      Transferir
                    </button>
                    <button
                      className="bg-gray-200 px-3 py-1 rounded"
                      onClick={() =>
                        alert(
                          "Acción de baja/descartar no implementada en esta UI."
                        )
                      }
                    >
                      Marcar baja
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}
