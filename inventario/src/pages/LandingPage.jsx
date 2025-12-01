import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import Chatbot from "../components/Chatbot";

const API_BASE = "http://localhost:8081/api";

// Configuración del Hero - Puedes cambiar esta imagen
const HERO_CONFIG = {
  backgroundImage: "https://images.unsplash.com/photo-1604719312566-8912e9227c6a?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&q=80",
  title: "Tu Supermercado de Confianza",
  subtitle: "Los mejores productos, las mejores ofertas y la mejor calidad. Todo lo que necesitas para tu hogar en un solo lugar.",
};

// Imágenes por defecto para productos sin imagen
const IMAGENES_PRODUCTOS = [
  "https://images.unsplash.com/photo-1629203851122-3726ecdf080e?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80",
  "https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80",
  "https://images.unsplash.com/photo-1586201375761-83865001e31c?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80",
  "https://images.unsplash.com/photo-1563636619-e9143da7973b?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80",
  "https://images.unsplash.com/photo-1549931319-a545dcf3bc73?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80",
  "https://images.unsplash.com/photo-1582722872445-44dc5f7e3c8f?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80",
];

// Información base del supermercado
const SUPERMARKET_INFO = {
  nombre: "SuperMarket Express",
  slogan: "Calidad y ahorro para tu familia",
  telefono: "+591 2 2411234",
  whatsapp: "+591 70012345",
  email: "contacto@supermarketexpress.com",
};

export default function LandingPage() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [productos, setProductos] = useState([]);
  const [marcas, setMarcas] = useState([]);
  const [sucursales, setSucursales] = useState([]);
  const [loading, setLoading] = useState(true);

  // Cargar datos de la API
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [resProductos, resMarcas, resSucursales] = await Promise.all([
          fetch(`${API_BASE}/productos`),
          fetch(`${API_BASE}/marcas`),
          fetch(`${API_BASE}/sucursales`),
        ]);

        if (resProductos.ok) {
          const dataProductos = await resProductos.json();
          setProductos(Array.isArray(dataProductos) ? dataProductos : []);
        }

        if (resMarcas.ok) {
          const dataMarcas = await resMarcas.json();
          setMarcas(Array.isArray(dataMarcas) ? dataMarcas : []);
        }

        if (resSucursales.ok) {
          const dataSucursales = await resSucursales.json();
          setSucursales(Array.isArray(dataSucursales) ? dataSucursales : []);
        }
      } catch (error) {
        console.error("Error cargando datos:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Crear mapa de marcas para obtener nombre por ID
  const marcasMap = Object.fromEntries(
    marcas.map((m) => [String(m.id ?? m.marcaId ?? ""), m])
  );

  // Obtener nombre de marca de un producto
  const getMarcaNombre = (producto) => {
    if (producto.marca?.nombre) return producto.marca.nombre;
    const marcaId = String(producto.marcaId ?? producto.marca?.id ?? "");
    const marca = marcasMap[marcaId];
    return marca?.nombre ?? "Sin marca";
  };

  // Obtener imagen para un producto (usa imagen del producto o una por defecto)
  const getProductoImagen = (producto, index) => {
    return producto.imagen || IMAGENES_PRODUCTOS[index % IMAGENES_PRODUCTOS.length];
  };

  // Productos destacados (primeros 6 productos activos)
  const productosDestacados = productos
    .filter((p) => p.activo !== false)
    .slice(0, 6);

  const scrollToSection = (sectionId) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
    }
    setMobileMenuOpen(false);
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Top Bar - Promoción */}
      <div className="bg-red-600 text-white py-2 text-center text-sm font-medium">
        🎉 ¡Envío GRATIS en compras mayores a Bs. 200! | Usa el código: SUPER20 para 20% de descuento
      </div>

      {/* Navbar */}
      <header className="sticky top-0 left-0 right-0 z-50 bg-white shadow-sm">
        <nav className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-red-500 to-orange-500 text-white text-xl font-bold shadow-md">
              🛒
            </div>
            <div>
              <span className="text-xl font-bold text-neutral-800 block leading-tight">
                {SUPERMARKET_INFO.nombre}
              </span>
              <span className="text-xs text-neutral-500">{SUPERMARKET_INFO.slogan}</span>
            </div>
          </div>

          {/* Desktop Navigation */}
          <ul className="hidden items-center gap-6 lg:flex">
            <li>
              <button
                onClick={() => scrollToSection("hero")}
                className="text-sm font-medium text-neutral-600 hover:text-red-600 transition-colors"
              >
                Inicio
              </button>
            </li>
            <li>
              <button
                onClick={() => scrollToSection("ofertas")}
                className="text-sm font-medium text-neutral-600 hover:text-red-600 transition-colors"
              >
                Ofertas
              </button>
            </li>
            <li>
              <button
                onClick={() => scrollToSection("categorias")}
                className="text-sm font-medium text-neutral-600 hover:text-red-600 transition-colors"
              >
                Categorías
              </button>
            </li>
            <li>
              <button
                onClick={() => scrollToSection("about")}
                className="text-sm font-medium text-neutral-600 hover:text-red-600 transition-colors"
              >
                Nosotros
              </button>
            </li>
            <li>
              <button
                onClick={() => scrollToSection("sucursales")}
                className="text-sm font-medium text-neutral-600 hover:text-red-600 transition-colors"
              >
                Sucursales
              </button>
            </li>
          </ul>

          {/* Auth Buttons */}
          <div className="hidden lg:flex items-center gap-3">
            <Link
              to="/login"
              className="px-4 py-2 text-sm font-medium text-neutral-700 hover:text-red-600 transition-colors"
            >
              Iniciar Sesión
            </Link>
            <Link
              to="/signup"
              className="px-5 py-2.5 text-sm font-medium text-white bg-gradient-to-r from-red-500 to-orange-500 rounded-full hover:from-red-600 hover:to-orange-600 transition-all shadow-md hover:shadow-lg"
            >
              Registrarse
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="inline-flex h-10 w-10 items-center justify-center rounded-lg border border-neutral-300 lg:hidden"
            aria-label="Abrir menú"
          >
            <svg
              viewBox="0 0 24 24"
              className="h-5 w-5"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              {mobileMenuOpen ? (
                <path d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path d="M3 6h18M3 12h18M3 18h18" />
              )}
            </svg>
          </button>
        </nav>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="border-t border-neutral-200 bg-white lg:hidden">
            <ul className="flex flex-col gap-1 px-4 py-3">
              <li>
                <button
                  onClick={() => scrollToSection("hero")}
                  className="w-full text-left px-3 py-2 text-sm font-medium text-neutral-700 hover:bg-red-50 hover:text-red-600 rounded-md"
                >
                  Inicio
                </button>
              </li>
              <li>
                <button
                  onClick={() => scrollToSection("ofertas")}
                  className="w-full text-left px-3 py-2 text-sm font-medium text-neutral-700 hover:bg-red-50 hover:text-red-600 rounded-md"
                >
                  Ofertas
                </button>
              </li>
              <li>
                <button
                  onClick={() => scrollToSection("categorias")}
                  className="w-full text-left px-3 py-2 text-sm font-medium text-neutral-700 hover:bg-red-50 hover:text-red-600 rounded-md"
                >
                  Categorías
                </button>
              </li>
              <li>
                <button
                  onClick={() => scrollToSection("about")}
                  className="w-full text-left px-3 py-2 text-sm font-medium text-neutral-700 hover:bg-red-50 hover:text-red-600 rounded-md"
                >
                  Nosotros
                </button>
              </li>
              <li>
                <button
                  onClick={() => scrollToSection("sucursales")}
                  className="w-full text-left px-3 py-2 text-sm font-medium text-neutral-700 hover:bg-red-50 hover:text-red-600 rounded-md"
                >
                  Sucursales
                </button>
              </li>
              <li className="border-t border-neutral-200 mt-2 pt-2">
                <Link
                  to="/login"
                  className="block px-3 py-2 text-sm font-medium text-neutral-700 hover:bg-neutral-100 rounded-md"
                >
                  Iniciar Sesión
                </Link>
              </li>
              <li>
                <Link
                  to="/signup"
                  className="block px-3 py-2 text-sm font-medium text-white bg-gradient-to-r from-red-500 to-orange-500 rounded-md text-center"
                >
                  Registrarse
                </Link>
              </li>
            </ul>
          </div>
        )}
      </header>

      {/* Hero Section */}
      <section
        id="hero"
        className="relative min-h-[80vh] flex items-center"
        style={{
          backgroundImage: `linear-gradient(to right, rgba(0,0,0,0.7) 0%, rgba(0,0,0,0.3) 50%, rgba(0,0,0,0.1) 100%), url(${HERO_CONFIG.backgroundImage})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      >
        <div className="max-w-7xl mx-auto px-4 py-20 w-full">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-red-500/20 backdrop-blur-sm rounded-full border border-red-400/30 mb-6">
              <span className="text-2xl">🛒</span>
              <span className="text-sm text-white font-medium">¡Ofertas de la semana!</span>
            </div>

            <h1 className="text-4xl md:text-6xl font-bold text-white mb-6 leading-tight">
              {HERO_CONFIG.title}
            </h1>

            <p className="text-lg md:text-xl text-white/90 mb-8">
              {HERO_CONFIG.subtitle}
            </p>

            <div className="flex flex-col sm:flex-row gap-4">
              <button
                onClick={() => scrollToSection("ofertas")}
                className="px-8 py-4 bg-gradient-to-r from-red-500 to-orange-500 text-white font-semibold rounded-full hover:from-red-600 hover:to-orange-600 transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 text-lg"
              >
                Ver Ofertas 🔥
              </button>
              <Link
                to="/signup"
                className="px-8 py-4 bg-white text-neutral-800 font-semibold rounded-full hover:bg-neutral-100 transition-all shadow-lg text-lg text-center"
              >
                Crear Cuenta
              </Link>
            </div>

            {/* Trust Badges */}
            <div className="flex flex-wrap gap-6 mt-12">
              <div className="flex items-center gap-2 text-white/80">
                <span className="text-2xl">🚚</span>
                <span className="text-sm">Envío a domicilio</span>
              </div>
              <div className="flex items-center gap-2 text-white/80">
                <span className="text-2xl">💳</span>
                <span className="text-sm">Pago seguro</span>
              </div>
              <div className="flex items-center gap-2 text-white/80">
                <span className="text-2xl">✅</span>
                <span className="text-sm">Productos frescos</span>
              </div>
            </div>
          </div>
        </div>

        {/* Floating Card */}
        <div className="hidden xl:block absolute right-20 bottom-20 bg-white rounded-2xl p-6 shadow-2xl max-w-xs">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center text-2xl">
              ✨
            </div>
            <div>
              <div className="font-semibold text-neutral-800">Producto del día</div>
              <div className="text-sm text-neutral-500">Oferta especial</div>
            </div>
          </div>
          <img
            src="https://images.unsplash.com/photo-1553279768-865429fa0078?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&q=80"
            alt="Producto destacado"
            className="w-full h-32 object-cover rounded-xl mb-4"
          />
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm text-neutral-500 line-through">Bs. 25.00</div>
              <div className="text-xl font-bold text-red-600">Bs. 19.90</div>
            </div>
            <span className="px-3 py-1 bg-red-100 text-red-600 text-sm font-medium rounded-full">
              -20%
            </span>
          </div>
        </div>
      </section>

      {/* Categories Section - Ahora usando marcas de la API */}
      <section id="categorias" className="py-16 bg-neutral-50">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-neutral-800 mb-3">
              Nuestras Marcas
            </h2>
            <p className="text-neutral-600">
              Las mejores marcas del mercado
            </p>
          </div>

          {loading ? (
            <div className="flex justify-center items-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-500"></div>
            </div>
          ) : marcas.length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-4">
              {marcas.slice(0, 12).map((marca, index) => (
                <div
                  key={marca.id || marca.marcaId || index}
                  className="group flex flex-col items-center p-4 bg-white rounded-2xl border border-neutral-200 hover:border-red-300 hover:shadow-lg transition-all"
                >
                  <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-red-100 to-orange-100 text-red-600 flex items-center justify-center text-2xl font-bold mb-3 group-hover:scale-110 transition-transform">
                    {(marca.nombre || "M").charAt(0).toUpperCase()}
                  </div>
                  <span className="text-sm font-medium text-neutral-700 text-center">
                    {marca.nombre || "Sin nombre"}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-center text-neutral-500">No hay marcas disponibles</p>
          )}
        </div>
      </section>

      {/* Productos Section - Ahora usando productos de la API */}
      <section id="ofertas" className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-12">
            <div>
              <span className="inline-block px-4 py-1 bg-red-100 text-red-600 text-sm font-semibold rounded-full mb-3">
                🔥 Productos Destacados
              </span>
              <h2 className="text-3xl md:text-4xl font-bold text-neutral-800 mb-2">
                Nuestros Productos
              </h2>
              <p className="text-neutral-600">
                Descubre nuestra variedad de productos de calidad
              </p>
            </div>
            <div className="mt-4 md:mt-0 flex items-center gap-2 text-sm text-neutral-500">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
              </svg>
              {productos.length} productos disponibles
            </div>
          </div>

          {loading ? (
            <div className="flex justify-center items-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-500"></div>
            </div>
          ) : productosDestacados.length > 0 ? (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {productosDestacados.map((producto, index) => (
                <div
                  key={producto.id || producto.productoId || index}
                  className="group bg-white rounded-2xl border border-neutral-200 overflow-hidden hover:shadow-xl transition-all duration-300"
                >
                  <div className="relative">
                    <img
                      src={getProductoImagen(producto, index)}
                      alt={producto.nombre}
                      className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <div className="absolute top-3 left-3">
                      <span className="inline-flex items-center px-3 py-1 bg-red-500 text-white text-sm font-bold rounded-full shadow-lg">
                        ⭐ Destacado
                      </span>
                    </div>
                    <div className="absolute top-3 right-3">
                      <button className="w-10 h-10 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center shadow-md hover:bg-red-50 hover:text-red-500 transition-colors">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                        </svg>
                      </button>
                    </div>
                  </div>
                  <div className="p-5">
                    <div className="text-xs font-medium text-red-500 mb-1">
                      {getMarcaNombre(producto)}
                    </div>
                    <h3 className="text-lg font-semibold text-neutral-800 mb-2">
                      {producto.nombre || "Producto sin nombre"}
                    </h3>
                    {producto.descripcion && (
                      <p className="text-sm text-neutral-500 mb-3 line-clamp-2">
                        {producto.descripcion}
                      </p>
                    )}
                    <div className="flex items-center justify-between">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        producto.activo !== false 
                          ? "bg-green-100 text-green-600" 
                          : "bg-neutral-100 text-neutral-500"
                      }`}>
                        {producto.activo !== false ? "Disponible" : "No disponible"}
                      </span>
                      <button className="w-10 h-10 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600 transition-colors shadow-md">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                        </svg>
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-center text-neutral-500 py-12">No hay productos disponibles</p>
          )}

          <div className="text-center mt-12">
            <Link
              to="/login"
              className="inline-flex items-center gap-2 px-8 py-3 bg-gradient-to-r from-red-500 to-orange-500 text-white font-semibold rounded-full hover:from-red-600 hover:to-orange-600 transition-all shadow-lg"
            >
              Ver todas las ofertas
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
            </Link>
          </div>
        </div>
      </section>

      {/* About Section */}
      <section id="about" className="py-20 bg-gradient-to-br from-red-50 to-orange-50">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <span className="inline-block px-4 py-1 bg-red-100 text-red-600 text-sm font-semibold rounded-full mb-4">
                Sobre Nosotros
              </span>
              <h2 className="text-3xl md:text-4xl font-bold text-neutral-800 mb-6">
                Más de 20 años llevando calidad a tu hogar
              </h2>
              <p className="text-neutral-600 mb-6 text-lg">
                En <strong>{SUPERMARKET_INFO.nombre}</strong> nos dedicamos a ofrecer los mejores productos 
                al mejor precio. Trabajamos directamente con productores locales para garantizar 
                frescura y calidad en cada compra.
              </p>

              <div className="grid sm:grid-cols-2 gap-6 mb-8">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center text-2xl shrink-0">
                    🌱
                  </div>
                  <div>
                    <h4 className="font-semibold text-neutral-800 mb-1">Productos Frescos</h4>
                    <p className="text-sm text-neutral-600">Frutas y verduras recibidas diariamente</p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center text-2xl shrink-0">
                    💰
                  </div>
                  <div>
                    <h4 className="font-semibold text-neutral-800 mb-1">Mejores Precios</h4>
                    <p className="text-sm text-neutral-600">Ofertas y descuentos todos los días</p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center text-2xl shrink-0">
                    🚚
                  </div>
                  <div>
                    <h4 className="font-semibold text-neutral-800 mb-1">Delivery Rápido</h4>
                    <p className="text-sm text-neutral-600">Entrega el mismo día en tu zona</p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-amber-100 rounded-xl flex items-center justify-center text-2xl shrink-0">
                    ⭐
                  </div>
                  <div>
                    <h4 className="font-semibold text-neutral-800 mb-1">Calidad Garantizada</h4>
                    <p className="text-sm text-neutral-600">Satisfacción 100% o te devolvemos tu dinero</p>
                  </div>
                </div>
              </div>

              <Link
                to="/signup"
                className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-red-500 to-orange-500 text-white font-semibold rounded-full hover:from-red-600 hover:to-orange-600 transition-all shadow-lg"
              >
                Únete a nuestra familia
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
              </Link>
            </div>

            <div className="relative">
              <div className="grid grid-cols-2 gap-4">
                <img
                  src="https://images.unsplash.com/photo-1542838132-92c53300491e?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80"
                  alt="Supermercado"
                  className="rounded-2xl shadow-lg w-full h-48 object-cover"
                />
                <img
                  src="https://images.unsplash.com/photo-1608686207856-001b95cf60ca?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80"
                  alt="Productos frescos"
                  className="rounded-2xl shadow-lg w-full h-48 object-cover mt-8"
                />
                <img
                  src="https://images.unsplash.com/photo-1579113800032-c38bd7635818?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80"
                  alt="Frutas"
                  className="rounded-2xl shadow-lg w-full h-48 object-cover"
                />
                <img
                  src="https://images.unsplash.com/photo-1604719312566-8912e9227c6a?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80"
                  alt="Compras"
                  className="rounded-2xl shadow-lg w-full h-48 object-cover mt-8"
                />
              </div>

              {/* Stats Card */}
              <div className="absolute -bottom-6 left-1/2 transform -translate-x-1/2 bg-white rounded-2xl p-6 shadow-xl flex gap-8">
                <div className="text-center">
                  <div className="text-3xl font-bold text-red-600">10K+</div>
                  <div className="text-sm text-neutral-500">Clientes</div>
                </div>
                <div className="text-center border-l border-neutral-200 pl-8">
                  <div className="text-3xl font-bold text-red-600">5K+</div>
                  <div className="text-sm text-neutral-500">Productos</div>
                </div>
                <div className="text-center border-l border-neutral-200 pl-8">
                  <div className="text-3xl font-bold text-red-600">20+</div>
                  <div className="text-sm text-neutral-500">Años</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Sucursales Section - Ahora usando sucursales de la API */}
      <section id="sucursales" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-12">
            <span className="inline-block px-4 py-1 bg-red-100 text-red-600 text-sm font-semibold rounded-full mb-3">
              📍 Encuéntranos
            </span>
            <h2 className="text-3xl md:text-4xl font-bold text-neutral-800 mb-3">
              Nuestras Sucursales
            </h2>
            <p className="text-neutral-600 max-w-2xl mx-auto">
              Visítanos en cualquiera de nuestras ubicaciones y descubre la experiencia de compra que te mereces
            </p>
          </div>

          {loading ? (
            <div className="flex justify-center items-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-500"></div>
            </div>
          ) : sucursales.length > 0 ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {sucursales.map((sucursal, index) => (
                <div
                  key={sucursal.id || sucursal.sucursalId || index}
                  className={`rounded-2xl p-6 ${
                    index === 0
                      ? "bg-gradient-to-br from-red-500 to-orange-500 text-white"
                      : "bg-white border border-neutral-200 hover:shadow-lg transition-shadow"
                  }`}
                >
                  {index === 0 && (
                    <div className="flex items-center gap-2 mb-4">
                      <span className="px-3 py-1 bg-white/20 rounded-full text-sm font-medium">
                        ⭐ Principal
                      </span>
                    </div>
                  )}
                  <h3 className={`text-xl font-bold mb-4 ${index === 0 ? "text-white" : "text-neutral-800"}`}>
                    {sucursal.nombre || "Sucursal sin nombre"}
                  </h3>
                  <ul className={`space-y-3 ${index === 0 ? "text-white/90" : "text-neutral-600"}`}>
                    <li className="flex items-start gap-3">
                      <span className="text-lg">📍</span>
                      <span>{sucursal.direccion || "Dirección no disponible"}</span>
                    </li>
                    <li className="flex items-center gap-3">
                      <span className="text-lg">📞</span>
                      <span>{SUPERMARKET_INFO.telefono}</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <span className="text-lg">🕐</span>
                      <span className="text-sm">Lun-Sáb: 7:00-21:00<br/>Dom: 8:00-14:00</span>
                    </li>
                  </ul>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-center text-neutral-500 py-12">No hay sucursales disponibles</p>
          )}
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-gradient-to-r from-red-600 to-orange-500">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            ¿Listo para ahorrar en tus compras?
          </h2>
          <p className="text-lg text-white/90 mb-8 max-w-2xl mx-auto">
            Regístrate ahora y recibe un cupón de Bs. 50 de descuento en tu primera compra. 
            ¡Además accede a ofertas exclusivas para miembros!
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/signup"
              className="px-8 py-4 bg-white text-red-600 font-semibold rounded-full hover:bg-neutral-100 transition-colors shadow-lg text-lg"
            >
              🎁 Obtener mi cupón
            </Link>
            <a
              href={`https://wa.me/${SUPERMARKET_INFO.whatsapp.replace(/\D/g, '')}`}
              target="_blank"
              rel="noopener noreferrer"
              className="px-8 py-4 bg-green-500 text-white font-semibold rounded-full hover:bg-green-600 transition-colors shadow-lg text-lg flex items-center justify-center gap-2"
            >
              <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
              </svg>
              Pedir por WhatsApp
            </a>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-neutral-900 text-white py-16">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid md:grid-cols-4 gap-12">
            {/* Brand */}
            <div className="md:col-span-2">
              <div className="flex items-center gap-3 mb-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-red-500 to-orange-500 text-white text-xl">
                  🛒
                </div>
                <div>
                  <span className="text-xl font-bold block">{SUPERMARKET_INFO.nombre}</span>
                  <span className="text-sm text-neutral-400">{SUPERMARKET_INFO.slogan}</span>
                </div>
              </div>
              <p className="text-neutral-400 mb-6 max-w-md">
                Tu supermercado de confianza. Más de 20 años llevando calidad, frescura 
                y los mejores precios a las familias bolivianas.
              </p>
              <div className="flex gap-4">
                <a href="#" className="w-10 h-10 bg-neutral-800 rounded-full flex items-center justify-center hover:bg-red-500 transition-colors">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                  </svg>
                </a>
                <a href="#" className="w-10 h-10 bg-neutral-800 rounded-full flex items-center justify-center hover:bg-red-500 transition-colors">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                  </svg>
                </a>
                <a href="#" className="w-10 h-10 bg-neutral-800 rounded-full flex items-center justify-center hover:bg-red-500 transition-colors">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-5.2 1.74 2.89 2.89 0 012.31-4.64 2.93 2.93 0 01.88.13V9.4a6.84 6.84 0 00-1-.05A6.33 6.33 0 005 20.1a6.34 6.34 0 0010.86-4.43v-7a8.16 8.16 0 004.77 1.52v-3.4a4.85 4.85 0 01-1-.1z"/>
                  </svg>
                </a>
              </div>
            </div>

            {/* Quick Links */}
            <div>
              <h4 className="text-sm font-semibold uppercase tracking-wider text-neutral-400 mb-4">
                Enlaces
              </h4>
              <ul className="space-y-3">
                <li>
                  <button onClick={() => scrollToSection("ofertas")} className="text-neutral-300 hover:text-white transition-colors">
                    Ofertas
                  </button>
                </li>
                <li>
                  <button onClick={() => scrollToSection("categorias")} className="text-neutral-300 hover:text-white transition-colors">
                    Categorías
                  </button>
                </li>
                <li>
                  <button onClick={() => scrollToSection("sucursales")} className="text-neutral-300 hover:text-white transition-colors">
                    Sucursales
                  </button>
                </li>
                <li>
                  <Link to="/login" className="text-neutral-300 hover:text-white transition-colors">
                    Mi cuenta
                  </Link>
                </li>
              </ul>
            </div>

            {/* Contact */}
            <div>
              <h4 className="text-sm font-semibold uppercase tracking-wider text-neutral-400 mb-4">
                Contacto
              </h4>
              <ul className="space-y-3 text-neutral-300">
                <li className="flex items-center gap-3">
                  <span>📞</span>
                  {SUPERMARKET_INFO.telefono}
                </li>
                <li className="flex items-center gap-3">
                  <span>💬</span>
                  {SUPERMARKET_INFO.whatsapp}
                </li>
                <li className="flex items-center gap-3">
                  <span>✉️</span>
                  {SUPERMARKET_INFO.email}
                </li>
              </ul>
            </div>
          </div>

          {/* Bottom */}
          <div className="border-t border-neutral-800 mt-12 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-sm text-neutral-500">
              © 2025 {SUPERMARKET_INFO.nombre}. Todos los derechos reservados.
            </p>
            <div className="flex gap-6 text-sm">
              <a href="#" className="text-neutral-500 hover:text-neutral-300 transition-colors">
                Términos
              </a>
              <a href="#" className="text-neutral-500 hover:text-neutral-300 transition-colors">
                Privacidad
              </a>
            </div>
          </div>
        </div>
      </footer>

      {/* Chatbot */}
      <Chatbot />
    </div>
  );
}
