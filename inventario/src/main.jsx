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
import LoteSucursalesPage from './pages/LotesSucursalesPage.jsx';
import LoginPage from "./pages/LoginPage.jsx";
import SignUpPage from "./pages/SignUpPage.jsx";
import LandingPage from "./pages/LandingPage.jsx";
import ProtectedRoute from "./components/ProtectedRoute.jsx";

const router = createBrowserRouter([
  {
    path: "/",
    element: <LandingPage />,
  },
  {
    path: "/productos",
    element: <ProtectedRoute><ProductosPage /></ProtectedRoute>,
  },
  {
    path: "/marcas",
    element: <ProtectedRoute><MarcasPage /></ProtectedRoute>,
  },
  {
    path: "/lotes",
    element: <ProtectedRoute><LotesPage /></ProtectedRoute>,
  },
  {
    path: "/sucursales",
    element: <ProtectedRoute><SucursalesPage /></ProtectedRoute>,
  },
  {
    path: '/lotes-sucursales',
    element: <ProtectedRoute><LoteSucursalesPage /></ProtectedRoute>,

  },
  {
    path: "/reporte-stock",
    element: <ProtectedRoute><ReporteStockPage /></ProtectedRoute>,
  },
  {
    path: "/lotes-vencidos",
    element: <ProtectedRoute><LotesVencidosPage /></ProtectedRoute>,
  },
  {
    path: "/conteo-inventario",
    element: <ProtectedRoute><ConteoManualPage /></ProtectedRoute>,
  },
  {
    path: "/transferir",
    element: <ProtectedRoute><TransferirPage /></ProtectedRoute>,
  },
  {
    path: "/movimientos",
    element: <ProtectedRoute><MovimientosPage /></ProtectedRoute>,
  },
  {
    path: "/login",
    element: <LoginPage />,
  },
  {
    path: "/signup",
    element: <SignUpPage />,
  },
]);
createRoot(document.getElementById("root")).render(
  <StrictMode>
    <RouterProvider router={router} />
  </StrictMode>
);
