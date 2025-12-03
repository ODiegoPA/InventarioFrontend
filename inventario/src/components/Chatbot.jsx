import { useState, useRef, useEffect } from "react";

const API_BASE = "http://localhost:8081/api";
const CHAT_API = "http://localhost:8082/chat";

// Respuestas predefinidas para consultas comunes
const RESPUESTAS_COMUNES = {
  saludo: [
    "¡Hola! 👋 Bienvenido a SuperMarket Express. ¿En qué puedo ayudarte hoy?",
    "¡Hola! Soy el asistente virtual de SuperMarket Express. ¿Qué necesitas?",
  ],
  horario: "🕐 Nuestros horarios son:\n• Lunes a Sábado: 7:00 - 21:00\n• Domingos: 8:00 - 14:00",
  ubicacion: "📍 Puedes encontrarnos en nuestras sucursales. ¡Visita la sección de Sucursales para ver todas las direcciones!",
  contacto: "📞 Puedes contactarnos:\n• Teléfono: +591 2 2411234\n• WhatsApp: +591 70012345\n• Email: contacto@supermarketexpress.com",
  envio: "🚚 ¡Envío GRATIS en compras mayores a Bs. 200! Entregamos el mismo día en zonas cercanas.",
  pago: "💳 Aceptamos:\n• Efectivo\n• Tarjetas de débito y crédito\n• QR\n• Transferencia bancaria",
  ofertas: "🔥 Tenemos ofertas todos los días. ¡Revisa nuestra sección de Ofertas para ver los mejores descuentos!",
  devolucion: "↩️ Aceptamos devoluciones dentro de los 7 días con el ticket de compra. Los productos deben estar en su empaque original.",
  registro: "📝 Para registrarte, haz clic en el botón 'Registrarse' en la parte superior. ¡Es gratis y obtienes un cupón de Bs. 50!",
  despedida: [
    "¡Gracias por tu visita! Si necesitas algo más, estaré aquí. 😊",
    "¡Hasta pronto! Fue un placer ayudarte. 🛒",
  ],
};

// Palabras clave para detectar intención
const KEYWORDS = {
  saludo: ["hola", "buenos dias", "buenas tardes", "buenas noches", "hey", "hi", "hello", "saludos"],
  horario: ["horario", "hora", "abierto", "cerrado", "atienden", "abren", "cierran", "cuando"],
  ubicacion: ["donde", "ubicacion", "direccion", "sucursal", "local", "tienda", "encuentro"],
  contacto: ["telefono", "llamar", "contacto", "whatsapp", "email", "correo", "numero"],
  envio: ["envio", "delivery", "domicilio", "entregan", "llevan", "pedido", "enviar"],
  pago: ["pago", "pagar", "tarjeta", "efectivo", "qr", "transferencia", "aceptan", "forma de pago"],
  ofertas: ["oferta", "descuento", "promocion", "barato", "precio", "rebaja", "ahorro"],
  devolucion: ["devolucion", "devolver", "cambio", "reclamo", "garantia", "reembolso"],
  registro: ["registrar", "cuenta", "usuario", "inscribir", "crear cuenta", "registrarse"],
  despedida: ["gracias", "adios", "chao", "bye", "hasta luego", "nos vemos"],
  producto: ["producto", "tienen", "hay", "busco", "necesito", "venden", "stock"],
  marca: ["marca", "marcas"],
};

function detectarIntencion(mensaje) {
  const msgLower = mensaje.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
  
  for (const [intencion, keywords] of Object.entries(KEYWORDS)) {
    for (const keyword of keywords) {
      if (msgLower.includes(keyword)) {
        return intencion;
      }
    }
  }
  return null;
}

function obtenerRespuesta(intencion) {
  const respuesta = RESPUESTAS_COMUNES[intencion];
  if (Array.isArray(respuesta)) {
    return respuesta[Math.floor(Math.random() * respuesta.length)];
  }
  return respuesta;
}

export default function Chatbot() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    {
      type: "bot",
      text: "¡Hola! 👋 Soy el asistente virtual de SuperMarket Express. ¿En qué puedo ayudarte?",
      time: new Date(),
    },
  ]);
  const [inputValue, setInputValue] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [productos, setProductos] = useState([]);
  const [marcas, setMarcas] = useState([]);
  const messagesEndRef = useRef(null);

  // Cargar datos para consultas
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [resProductos, resMarcas] = await Promise.all([
          fetch(`${API_BASE}/productos`),
          fetch(`${API_BASE}/marcas`),
        ]);
        if (resProductos.ok) {
          const data = await resProductos.json();
          setProductos(Array.isArray(data) ? data : []);
        }
        if (resMarcas.ok) {
          const data = await resMarcas.json();
          setMarcas(Array.isArray(data) ? data : []);
        }
      } catch (error) {
        console.error("Error cargando datos para chatbot:", error);
      }
    };
    fetchData();
  }, []);

  // Auto-scroll al último mensaje
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const buscarProductos = (query) => {
    const queryLower = query.toLowerCase();
    return productos.filter(
      (p) =>
        p.nombre?.toLowerCase().includes(queryLower) ||
        p.descripcion?.toLowerCase().includes(queryLower)
    );
  };

  const buscarMarcas = (query) => {
    const queryLower = query.toLowerCase();
    return marcas.filter((m) => m.nombre?.toLowerCase().includes(queryLower));
  };

  const procesarMensaje = async (mensaje) => {
    const intencion = detectarIntencion(mensaje);

    // Si pregunta por productos específicos
    if (intencion === "producto") {
      const palabras = mensaje.toLowerCase().split(" ");
      const productosEncontrados = [];
      
      for (const palabra of palabras) {
        if (palabra.length > 3 && !KEYWORDS.producto.includes(palabra)) {
          const encontrados = buscarProductos(palabra);
          productosEncontrados.push(...encontrados);
        }
      }

      if (productosEncontrados.length > 0) {
        const unicos = [...new Map(productosEncontrados.map((p) => [p.id, p])).values()];
        const lista = unicos.slice(0, 5).map((p) => `• ${p.nombre}`).join("\n");
        return `🛒 Encontré estos productos:\n${lista}\n\n¿Te gustaría saber más sobre alguno?`;
      } else {
        return `🔍 No encontré productos específicos. Tenemos ${productos.length} productos disponibles. ¿Podrías ser más específico?`;
      }
    }

    // Si pregunta por marcas
    if (intencion === "marca") {
      if (marcas.length > 0) {
        const lista = marcas.slice(0, 8).map((m) => `• ${m.nombre}`).join("\n");
        return `🏷️ Trabajamos con estas marcas:\n${lista}\n${marcas.length > 8 ? `\n...y ${marcas.length - 8} más!` : ""}`;
      }
      return "🏷️ Tenemos una gran variedad de marcas. ¡Visita nuestra tienda para conocerlas todas!";
    }

    // Respuestas predefinidas
    if (intencion) {
      return obtenerRespuesta(intencion);
    }

    // Respuesta por defecto
    return "🤔 No estoy seguro de entender tu pregunta. Puedo ayudarte con:\n\n• Horarios de atención\n• Ubicación de sucursales\n• Información de contacto\n• Envíos a domicilio\n• Formas de pago\n• Ofertas y promociones\n• Búsqueda de productos\n\n¿Sobre qué te gustaría saber?";
  };

  const handleSend = async () => {
    if (!inputValue.trim()) return;

    const userMessage = {
      type: "user",
      text: inputValue.trim(),
      time: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputValue("");
    setIsTyping(true);

    // Enviar al servicio de chatbot externo. Si falla, usar fallback local.
    try {
      const token = localStorage.getItem("token");
      const username = localStorage.getItem("username");
      const rol = localStorage.getItem("rol");
      const headers = { "Content-Type": "application/json" };
      if (token) {
        headers["Authorization"] = `Bearer ${token}`;
      }

      const resp = await fetch(CHAT_API, {
        method: "POST",
        headers,
        body: JSON.stringify({ 
          message: userMessage.text,
          username: username || "",
          rol: rol || ""
        }),
      });

      if (resp.ok) {
         console.log("Token de autenticación del usuario:", token)
        const data = await resp.json();
        const botText = data.response || data.reply || data.message || (await procesarMensaje(userMessage.text));
        const botMessage = { type: "bot", text: botText, time: new Date() };
        setMessages((prev) => [...prev, botMessage]);
      } else {
        // fallback local
        const respuesta = await procesarMensaje(userMessage.text);
        const botMessage = { type: "bot", text: respuesta, time: new Date() };
        setMessages((prev) => [...prev, botMessage]);
      }
    } catch (err) {
      console.error("Error conectando al chatbot externo:", err);
      const respuesta = await procesarMensaje(userMessage.text);
      const botMessage = { type: "bot", text: respuesta, time: new Date() };
      setMessages((prev) => [...prev, botMessage]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <>
      {/* Botón flotante del chatbot */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`fixed bottom-6 right-6 z-50 w-16 h-16 rounded-full shadow-2xl flex items-center justify-center transition-all duration-300 hover:scale-110 ${
          isOpen
            ? "bg-neutral-700 rotate-0"
            : "bg-gradient-to-r from-red-500 to-orange-500 animate-bounce"
        }`}
        aria-label={isOpen ? "Cerrar chat" : "Abrir chat"}
      >
        {isOpen ? (
          <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        ) : (
          <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
          </svg>
        )}
      </button>

      {/* Ventana del chat */}
      {isOpen && (
        <div className="fixed bottom-24 right-6 z-50 w-96 max-w-[calc(100vw-3rem)] bg-white rounded-2xl shadow-2xl overflow-hidden flex flex-col">
          {/* Header */}
          <div className="bg-gradient-to-r from-red-500 to-orange-500 px-5 py-4 text-white flex-shrink-0">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
                🛒
              </div>
              <div>
                <h3 className="font-semibold">SuperMarket Express</h3>
                <p className="text-xs text-white/80 flex items-center gap-1">
                  <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></span>
                  En línea
                </p>
              </div>
            </div>
          </div>

          {/* Messages */}
          <div className="overflow-y-auto p-4 space-y-4 bg-neutral-50 h-80 max-h-80">
            {messages.map((msg, idx) => (
              <div
                key={idx}
                className={`flex ${msg.type === "user" ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`max-w-[80%] rounded-2xl px-4 py-2.5 ${
                    msg.type === "user"
                      ? "bg-gradient-to-r from-red-500 to-orange-500 text-white rounded-br-md"
                      : "bg-white text-neutral-800 shadow-sm border border-neutral-100 rounded-bl-md"
                  }`}
                >
                  <p className="text-sm whitespace-pre-line">{msg.text}</p>
                  <p
                    className={`text-xs mt-1 ${
                      msg.type === "user" ? "text-white/70" : "text-neutral-400"
                    }`}
                  >
                    {msg.time.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                  </p>
                </div>
              </div>
            ))}

            {isTyping && (
              <div className="flex justify-start">
                <div className="bg-white text-neutral-800 shadow-sm border border-neutral-100 rounded-2xl rounded-bl-md px-4 py-3">
                  <div className="flex gap-1">
                    <span className="w-2 h-2 bg-neutral-400 rounded-full animate-bounce" style={{ animationDelay: "0ms" }}></span>
                    <span className="w-2 h-2 bg-neutral-400 rounded-full animate-bounce" style={{ animationDelay: "150ms" }}></span>
                    <span className="w-2 h-2 bg-neutral-400 rounded-full animate-bounce" style={{ animationDelay: "300ms" }}></span>
                  </div>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div className="p-4 bg-white border-t border-neutral-100 flex-shrink-0">
            <div className="flex gap-2">
              <input
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Escribe tu mensaje..."
                className="flex-1 px-4 py-2.5 bg-neutral-100 rounded-full text-sm outline-none focus:ring-2 focus:ring-red-500/50 transition-all"
              />
              <button
                onClick={handleSend}
                disabled={!inputValue.trim() || isTyping}
                className="w-10 h-10 bg-gradient-to-r from-red-500 to-orange-500 text-white rounded-full flex items-center justify-center hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
