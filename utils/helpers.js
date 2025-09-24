/**
 * Funciones auxiliares para el bot de WhatsApp
 */

/**
 * Formatear fecha en español
 * @param {Date|string} fecha - Fecha a formatear
 * @returns {string} Fecha formateada
 */
function formatearFecha(fecha) {
  const date = new Date(fecha);
  const opciones = {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    timeZone: "America/Argentina/Cordoba",
  };

  return date.toLocaleDateString("es-AR", opciones);
}

/**
 * Formatear fecha solo día
 * @param {Date|string} fecha - Fecha a formatear
 * @returns {string} Fecha formateada (solo día)
 */
function formatearFechaCorta(fecha) {
  const date = new Date(fecha);
  return date.toLocaleDateString("es-AR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

/**
 * Formatear moneda en pesos argentinos
 * @param {number} monto - Monto a formatear
 * @returns {string} Monto formateado
 */
function formatearMoneda(monto) {
  return new Intl.NumberFormat("es-AR", {
    style: "currency",
    currency: "ARS",
    minimumFractionDigits: 2,
  }).format(monto);
}

/**
 * Limpiar número de teléfono para WhatsApp
 * @param {string} telefono - Número de teléfono
 * @returns {string} Número limpio
 */
function limpiarTelefono(telefono) {
  return telefono.replace(/[^\d+]/g, "").replace("@c.us", "");
}

/**
 * Validar formato de teléfono argentino
 * @param {string} telefono - Número de teléfono
 * @returns {boolean} True si es válido
 */
function validarTelefono(telefono) {
  const telefono_limpio = limpiarTelefono(telefono);
  // Formato argentino: +54 seguido de código de área y número
  const regex = /^\+?54\d{10}$/;
  return regex.test(telefono_limpio);
}

/**
 * Capitalizar primera letra de cada palabra
 * @param {string} texto - Texto a capitalizar
 * @returns {string} Texto capitalizado
 */
function capitalizarTexto(texto) {
  if (!texto) return "";
  return texto
    .toLowerCase()
    .split(" ")
    .map((palabra) => palabra.charAt(0).toUpperCase() + palabra.slice(1))
    .join(" ");
}

/**
 * Truncar texto con puntos suspensivos
 * @param {string} texto - Texto a truncar
 * @param {number} longitud - Longitud máxima
 * @returns {string} Texto truncado
 */
function truncarTexto(texto, longitud = 50) {
  if (!texto) return "";
  return texto.length > longitud ? texto.substring(0, longitud) + "..." : texto;
}

/**
 * Generar mensaje de estado de pedido con emoji
 * @param {string} estado - Estado del pedido
 * @returns {string} Estado con emoji
 */
function formatearEstadoPedido(estado) {
  const estados = {
    pending: "⏳ Pendiente",
    processing: "🔄 En proceso",
    shipped: "🚚 Enviado",
    delivered: "✅ Entregado",
    cancelled: "❌ Cancelado",
    refunded: "💸 Reembolsado",
  };

  return estados[estado] || `📋 ${capitalizarTexto(estado)}`;
}

/**
 * Formatear método de entrega
 * @param {string} metodo - Método de entrega
 * @returns {string} Método formateado
 */
function formatearMetodoEntrega(metodo) {
  const metodos = {
    delivery: "🚚 Entrega a domicilio",
    pickup: "🏪 Retiro en tienda",
    shipping: "📦 Envío postal",
  };

  return metodos[metodo] || metodo;
}

/**
 * Formatear método de pago
 * @param {string} metodo - Método de pago
 * @returns {string} Método formateado
 */
function formatearMetodoPago(metodo) {
  const metodos = {
    cash: "💵 Efectivo",
    card: "💳 Tarjeta",
    online: "🌐 Pago online",
    transfer: "🏦 Transferencia",
    mercadopago: "💙 Mercado Pago",
  };

  return metodos[metodo] || metodo;
}

/**
 * Validar formato de email
 * @param {string} email - Email a validar
 * @returns {boolean} True si es válido
 */
function validarEmail(email) {
  const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return regex.test(email);
}

/**
 * Generar ID único simple
 * @returns {string} ID único
 */
function generarId() {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
}

/**
 * Calcular tiempo transcurrido desde una fecha
 * @param {Date|string} fecha - Fecha a comparar
 * @returns {string} Tiempo transcurrido
 */
function tiempoTranscurrido(fecha) {
  const ahora = new Date();
  const fechaPasada = new Date(fecha);
  const diferencia = ahora - fechaPasada;

  const minutos = Math.floor(diferencia / (1000 * 60));
  const horas = Math.floor(diferencia / (1000 * 60 * 60));
  const dias = Math.floor(diferencia / (1000 * 60 * 60 * 24));

  if (minutos < 60) {
    return `hace ${minutos} minuto${minutos !== 1 ? "s" : ""}`;
  } else if (horas < 24) {
    return `hace ${horas} hora${horas !== 1 ? "s" : ""}`;
  } else {
    return `hace ${dias} día${dias !== 1 ? "s" : ""}`;
  }
}

/**
 * Crear mensaje de bienvenida personalizado
 * @param {string} nombre - Nombre del usuario
 * @param {string} hora - Hora actual (opcional)
 * @returns {string} Mensaje de bienvenida
 */
function crearMensajeBienvenida(nombre = null, hora = null) {
  const saludo = obtenerSaludo(hora);
  const nombreFormateado = nombre ? capitalizarTexto(nombre) : "Usuario";

  return (
    `${saludo} ${nombreFormateado}! 👋\n\n` +
    `¡Bienvenido a nuestro sistema de pedidos!\n` +
    `Estoy aquí para ayudarte con consultas sobre tus pedidos.`
  );
}

/**
 * Obtener saludo según la hora del día
 * @param {string|Date} hora - Hora actual
 * @returns {string} Saludo apropiado
 */
function obtenerSaludo(hora = null) {
  const ahora = hora ? new Date(hora) : new Date();
  const horaActual = ahora.getHours();

  if (horaActual >= 5 && horaActual < 12) {
    return "🌅 Buenos días";
  } else if (horaActual >= 12 && horaActual < 18) {
    return "☀️ Buenas tardes";
  } else {
    return "🌙 Buenas noches";
  }
}

/**
 * Escapar caracteres especiales para Markdown de WhatsApp
 * @param {string} texto - Texto a escapar
 * @returns {string} Texto escapado
 */
function escaparMarkdown(texto) {
  if (!texto) return "";
  return texto
    .replace(/\*/g, "\\*")
    .replace(/_/g, "\\_")
    .replace(/~/g, "\\~")
    .replace(/`/g, "\\`");
}

/**
 * Crear resumen de pedido para mostrar
 * @param {Object} pedido - Objeto del pedido
 * @param {Array} items - Items del pedido (opcional)
 * @returns {string} Resumen formateado del pedido
 */
function crearResumenPedido(pedido, items = null) {
  let mensaje = `📋 *Pedido #${pedido.id}*\n\n`;
  mensaje += `👤 Cliente: ${pedido.customer_name}\n`;
  mensaje += `📅 Fecha: ${formatearFechaCorta(pedido.order_date)}\n`;
  mensaje += `📋 Estado: ${formatearEstadoPedido(pedido.status)}\n`;
  mensaje += `🚚 Entrega: ${formatearMetodoEntrega(pedido.delivery_method)}\n`;
  mensaje += `💳 Pago: ${formatearMetodoPago(pedido.payment_method)}\n`;
  mensaje += `💰 Total: ${formatearMoneda(pedido.total)}\n`;

  if (pedido.delivery_address) {
    mensaje += `📍 Dirección: ${truncarTexto(pedido.delivery_address, 40)}\n`;
  }

  if (items && items.length > 0) {
    mensaje += `\n🛍️ *Productos (${items.length}):*\n`;
    items.slice(0, 3).forEach((item) => {
      mensaje += `• ${item.name} x${item.quantity}\n`;
    });
    if (items.length > 3) {
      mensaje += `• ... y ${items.length - 3} producto${
        items.length - 3 !== 1 ? "s" : ""
      } más\n`;
    }
  }

  return mensaje;
}

/**
 * Validar si un pedido pertenece a un usuario
 * @param {Object} pedido - Objeto del pedido
 * @param {number} userId - ID del usuario
 * @returns {boolean} True si el pedido pertenece al usuario
 */
function validarPropietarioPedido(pedido, userId) {
  return pedido && pedido.user_id === userId;
}

/**
 * Crear mensaje de error amigable
 * @param {string} tipo - Tipo de error
 * @param {string} detalle - Detalle adicional (opcional)
 * @returns {string} Mensaje de error formateado
 */
function crearMensajeError(tipo, detalle = null) {
  const errores = {
    pedido_no_encontrado: "❌ No encontré ese pedido",
    usuario_no_registrado:
      "❌ Usuario no registrado. Escribe *hola* para comenzar",
    sin_pedidos: "📦 No tienes pedidos registrados aún",
    error_conexion: "🔧 Error de conexión. Intenta más tarde",
    formato_invalido: "⚠️ Formato inválido. Verifica los datos",
    acceso_denegado: "🚫 No tienes acceso a esta información",
    comando_no_reconocido:
      "❓ Comando no reconocido. Escribe *ayuda* para ver opciones",
  };

  let mensaje = errores[tipo] || "❌ Error inesperado";

  if (detalle) {
    mensaje += `\n\n💡 ${detalle}`;
  }

  return mensaje;
}

/**
 * Crear lista de comandos disponibles
 * @returns {string} Lista de comandos formateada
 */
function crearListaComandos() {
  return (
    `🤖 *Comandos Disponibles:*\n\n` +
    `🛒 *mis pedidos* - Ver todos tus pedidos\n` +
    `⏳ *activos* - Ver pedidos pendientes\n` +
    `🔍 *estado* - Consultar estado de un pedido\n` +
    `🛍️ *productos* - Ver catálogo de productos\n` +
    `📞 *contacto* - Información de contacto\n` +
    `❓ *ayuda* - Ver esta ayuda\n` +
    `🏠 *hola* - Volver al menú principal\n\n` +
    `💡 También puedes escribir directamente el número de pedido para ver sus detalles.`
  );
}

/**
 * Parsear comando del usuario
 * @param {string} mensaje - Mensaje del usuario
 * @returns {Object} Objeto con comando y parámetros
 */
function parsearComando(mensaje) {
  const texto = mensaje.toLowerCase().trim();
  const palabras = texto.split(" ");
  const comando = palabras[0];
  const parametros = palabras.slice(1);

  // Detectar si es un número de pedido
  const esNumeroPedido = /^\d+$/.test(comando);

  return {
    comando: esNumeroPedido ? "pedido" : comando,
    parametros,
    numeroPedido: esNumeroPedido ? parseInt(comando) : null,
    textoCompleto: texto,
    esNumeroPedido,
  };
}

/**
 * Generar mensaje de estadísticas
 * @param {Object} stats - Objeto con estadísticas
 * @returns {string} Mensaje formateado con estadísticas
 */
function formatearEstadisticas(stats) {
  let mensaje = `📊 *Estadísticas del Sistema*\n\n`;

  if (stats.totalUsuarios !== undefined) {
    mensaje += `👥 Usuarios registrados: *${stats.totalUsuarios}*\n`;
  }

  if (stats.totalPedidos !== undefined) {
    mensaje += `📦 Total pedidos: *${stats.totalPedidos}*\n`;
  }

  if (stats.pedidosPendientes !== undefined) {
    mensaje += `⏳ Pedidos pendientes: *${stats.pedidosPendientes}*\n`;
  }

  if (stats.pedidosEntregados !== undefined) {
    mensaje += `✅ Pedidos entregados: *${stats.pedidosEntregados}*\n`;
  }

  if (stats.ventasTotales !== undefined) {
    mensaje += `💰 Ventas totales: *${formatearMoneda(stats.ventasTotales)}*\n`;
  }

  if (stats.totalConversaciones !== undefined) {
    mensaje += `💬 Conversaciones: *${stats.totalConversaciones}*\n`;
  }

  return mensaje;
}

/**
 * Crear mensaje de loading/cargando
 * @param {string} accion - Acción que se está realizando
 * @returns {string} Mensaje de loading
 */
function crearMensajeCargando(accion = "información") {
  const mensajes = [
    `🔍 Buscando tu ${accion}...`,
    `⏳ Consultando ${accion}...`,
    `🔄 Procesando ${accion}...`,
    `📡 Obteniendo ${accion}...`,
  ];

  return mensajes[Math.floor(Math.random() * mensajes.length)];
}

/**
 * Validar horario de atención
 * @param {Date} fecha - Fecha a validar (opcional, por defecto ahora)
 * @returns {Object} Objeto con información del horario
 */
function validarHorarioAtencion(fecha = null) {
  const ahora = fecha || new Date();
  const dia = ahora.getDay(); // 0 = Domingo, 1 = Lunes, etc.
  const hora = ahora.getHours();

  // Horario: Lunes a Viernes 9am-6pm
  const esDiaHabil = dia >= 1 && dia <= 5;
  const esHorarioAtencion = hora >= 9 && hora < 18;
  const estaAbierto = esDiaHabil && esHorarioAtencion;

  let proximaApertura = "";
  if (!estaAbierto) {
    if (!esDiaHabil) {
      proximaApertura =
        dia === 0 ? "mañana lunes" : dia === 6 ? "el lunes" : "mañana";
    } else if (hora < 9) {
      proximaApertura = "a las 9:00 AM";
    } else {
      proximaApertura = "mañana a las 9:00 AM";
    }
  }

  return {
    estaAbierto,
    esDiaHabil,
    esHorarioAtencion,
    proximaApertura,
    mensaje: estaAbierto
      ? "✅ Estamos disponibles ahora"
      : `⏰ Fuera del horario de atención. Volvemos ${proximaApertura}`,
  };
}

/**
 * Limpiar y normalizar texto de entrada
 * @param {string} texto - Texto a limpiar
 * @returns {string} Texto limpio y normalizado
 */
function limpiarTexto(texto) {
  if (!texto) return "";

  return texto
    .trim()
    .replace(/\s+/g, " ") // Múltiples espacios a uno solo
    .replace(/[^\w\sáéíóúüñ]/gi, "") // Mantener solo letras, números y espacios
    .toLowerCase();
}

/**
 * Crear menú de opciones con botones
 * @param {Array} opciones - Array de opciones
 * @param {string} titulo - Título del menú
 * @returns {Object} Objeto para usar con flowDynamic
 */
function crearMenu(opciones, titulo = "¿Qué te gustaría hacer?") {
  return {
    body: titulo,
    buttons: opciones.map((opcion) => ({
      body: typeof opcion === "string" ? opcion : opcion.texto,
    })),
  };
}

module.exports = {
  formatearFecha,
  formatearFechaCorta,
  formatearMoneda,
  limpiarTelefono,
  validarTelefono,
  capitalizarTexto,
  truncarTexto,
  formatearEstadoPedido,
  formatearMetodoEntrega,
  formatearMetodoPago,
  validarEmail,
  generarId,
  tiempoTranscurrido,
  crearMensajeBienvenida,
  obtenerSaludo,
  escaparMarkdown,
  crearResumenPedido,
  validarPropietarioPedido,
  crearMensajeError,
  crearListaComandos,
  parsearComando,
  formatearEstadisticas,
  crearMensajeCargando,
  validarHorarioAtencion,
  limpiarTexto,
  crearMenu,
};
