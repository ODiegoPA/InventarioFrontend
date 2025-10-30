import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import "./index.css";
import App from "./App.jsx";
import ProductosPage from "./pages/ProductosPage.jsx";
import MarcasPage from "./pages/MarcasPage.jsx";
import LotesPage from "./pages/LotesPage.jsx";
import SucursalesPage from "./pages/SucursalesPage.jsx";
import ReporteStockPage from "./pages/ReporteStockPage.jsx";
import ConteoManualPage from "./pages/ConteoManualPage.jsx";
import MovimientosPage from "./pages/MovimientosPage.jsx";
import LotesVencidosPage from "./pages/LotesVencidosPage.jsx";
import TransferirPage from "./pages/TransferirPage.jsx";

const router = createBrowserRouter([
  {
    path: "/",
    element: <App />,
  },
  {
    path: "/productos",
    element: <ProductosPage />,
  },
  {
    path: "/marcas",
    element: <MarcasPage />,
  },
  {
    path: "/lotes",
    element: <LotesPage />,
  },
  {
    path: "/sucursales",
    element: <SucursalesPage />,
  },
  {
    path: "/reporte-stock",
    element: <ReporteStockPage />,
  },
  {
    path: "/lotes-vencidos",
    element: <LotesVencidosPage />,
  },
  {
    path: "/conteo-inventario",
    element: <ConteoManualPage />,
  },
  {
    path: "/transferir",
    element: <TransferirPage />,
  },
  {
    path: "/movimientos",
    element: <MovimientosPage />,
  },
]);
createRoot(document.getElementById("root")).render(
  <StrictMode>
    <RouterProvider router={router} />
  </StrictMode>
);
