import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import './index.css'
import App from './App.jsx'
import ProductosPage from './pages/ProductosPage.jsx';
import MarcasPage from './pages/MarcasPage.jsx';
import LotesPage from './pages/LotesPage.jsx';
import SucursalesPage from './pages/SucursalesPage.jsx';

const router = createBrowserRouter([
  {
    path: '/',
    element : <App />,
  },
  {
    path: '/productos',
    element : <ProductosPage />,
  },
  {
    path: '/marcas',
    element: <MarcasPage />,
  },
  {
    path: '/lotes',
    element: <LotesPage />,
  },
  {
    path: '/sucursales',
    element: <SucursalesPage />,
  }
]);
createRoot(document.getElementById('root')).render(
  <StrictMode>
    <RouterProvider router={router} />
  </StrictMode>,
)
