// require("dotenv").config();

// /**
//  * Configuración centralizada del bot de WhatsApp
//  */

// const config = {
//   // Configuración de la base de datos
//   database: {
//     host: process.env.DB_HOST || "localhost",
//     port: process.env.DB_PORT || 3306,
//     user: process.env.DB_USER,
//     password: process.env.DB_PASSWORD,
//     database: process.env.DB_NAME,
//     connectionLimit: 10,
//     acquireTimeout: 60000,
//     timeout: 60000,
//     charset: "utf8mb4",
//   },

//   // Información de la empresa
//   empresa: {
//     nombre: process.env.COMPANY_NAME || "ASVSystems",
//     telefono: process.env.COMPANY_PHONE || "+54 351 534631",
//     email: process.env.COMPANY_EMAIL || "asvsystems@gmail.com  ",
//     direccion: process.env.COMPANY_ADDRESS || "Av. Principal 123, Córdoba",
//     horario: process.env.COMPANY_HOURS || "Lunes a Viernes 9am-6pm",
//     website: process.env.WEBSITE_URL || "https://asvsystems.com.ar/app",
//     catalogoUrl:
//       process.env.CATALOG_URL || "https://asvsystems.com.ar/app/productos",
//     soporteUrl:
//       process.env.SUPPORT_URL || "https://asvsystems.com.ar/app/contacto",
//   },

//   // Configuración del bot
//   bot: {
//     nombre: process.env.BOT_NAME || "Bot de Pedidos",
//     version: process.env.BOT_VERSION || "1.0.0",
//     qrPort: process.env.QR_PORT || 3000,
//     logLevel: process.env.LOG_LEVEL || "info",
//     logFile: process.env.LOG_FILE || "bot.log",
//   },

//   // Límites y configuraciones operativas
//   limites: {
//     maxConversacionesPorUsuario:
//       parseInt(process.env.MAX_CONVERSACIONES_POR_USUARIO) || 100,
//     diasLimpiezaConversaciones:
//       parseInt(process.env.DIAS_LIMPIEZA_CONVERSACIONES) || 30,
//     maxProductosMostrar: 20,
//     maxPedidosMostrar: 10,
//     timeoutConsulta: 30000, // 30 segundos
//     maxIntentos: 3,
//   },

//   // Mensajes predeterminados
//   mensajes: {
//     bienvenida: {
//       principal: "🛍️ ¡Hola! Bienvenido a nuestro sistema de pedidos",
//       opciones: "🔍 ¿Qué te gustaría hacer hoy?",
//       primerUso:
//         "👋 ¡Es la primera vez que nos escribes! Te hemos registrado automáticamente.",
//     },

//     errores: {
//       conexionBD: "🔧 Tenemos problemas técnicos. Intenta más tarde.",
//       usuarioNoEncontrado:
//         "❌ No encontré tu información. Escribe *hola* para registrarte.",
//       pedidoNoEncontrado:
//         "❌ No encontré ese pedido o no pertenece a tu cuenta.",
//       sinPedidos: "📦 No tienes pedidos registrados aún.",
//       formatoInvalido: "⚠️ Formato inválido. Verifica los datos ingresados.",
//       permisosDenegados:
//         "🚫 No tienes permisos para acceder a esta información.",
//       errorGenerico: "❌ Ocurrió un error inesperado. Intenta nuevamente.",
//     },

//     ayuda: {
//       comandos:
//         "💡 *Comandos útiles:*\n• *mis pedidos* - Ver tus pedidos\n• *productos* - Ver catálogo\n• *contacto* - Información de contacto\n• *ayuda* - Ver esta ayuda",
//       noEntendido:
//         "❓ No entendí tu mensaje. Escribe *ayuda* para ver los comandos disponibles.",
//     },

//     estados: {
//       buscando: "🔍 Buscando información...",
//       procesando: "⏳ Procesando solicitud...",
//       consultando: "📡 Consultando base de datos...",
//       generando: "🔄 Generando respuesta...",
//     },
//   },

//   // Configuración de horarios de atención
//   horarios: {
//     dias: {
//       lunes: { inicio: 9, fin: 18 },
//       martes: { inicio: 9, fin: 18 },
//       miercoles: { inicio: 9, fin: 18 },
//       jueves: { inicio: 9, fin: 18 },
//       viernes: { inicio: 9, fin: 18 },
//       sabado: { activo: false },
//       domingo: { activo: false },
//     },
//     zona: "America/Argentina/Cordoba",
//   },

//   // Configuración de respuestas automáticas
//   respuestasAuto: {
//     fuera_horario:
//       "⏰ Estamos fuera del horario de atención ({horario}). Te responderemos cuando volvamos.",
//     mensaje_no_comercial:
//       "💼 Solo atendemos consultas relacionadas con pedidos durante este horario.",
//     derivacion_humano:
//       "👨‍💼 Te estoy derivando con un representante humano. Espera un momento...",
//   },

//   // Palabras clave y comandos
//   comandos: {
//     saludo: [
//       "hola",
//       "hi",
//       "hello",
//       "buenas",
//       "buenos dias",
//       "buenas tardes",
//       "buenas noches",
//       "inicio",
//       "start",
//     ],
//     pedidos: ["mis pedidos", "pedidos", "ordenes", "compras"],
//     estado: ["estado", "status", "seguimiento", "tracking"],
//     productos: ["productos", "catalogo", "artículos", "items", "que venden"],
//     contacto: [
//       "contacto",
//       "teléfono",
//       "dirección",
//       "ubicación",
//       "soporte",
//       "ayuda",
//     ],
//     activos: ["activos", "pendientes", "en proceso", "vigentes"],
//     ayuda: ["ayuda", "help", "comandos", "opciones", "?"],
//   },

//   // Emojis y símbolos utilizados
//   emojis: {
//     estados: {
//       pending: "⏳",
//       processing: "🔄",
//       shipped: "🚚",
//       delivered: "✅",
//       cancelled: "❌",
//       refunded: "💸",
//     },
//     acciones: {
//       buscar: "🔍",
//       cargar: "⏳",
//       exito: "✅",
//       error: "❌",
//       info: "ℹ️",
//       atencion: "⚠️",
//       dinero: "💰",
//       productos: "🛍️",
//       usuario: "👤",
//       fecha: "📅",
//       telefono: "📞",
//       email: "📧",
//       direccion: "📍",
//       entrega: "🚚",
//       pago: "💳",
//     },
//   },

//   // Validaciones
//   validaciones: {
//     telefono: /^\+?54\d{10}$/,
//     email: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
//     numeroPedido: /^\d+$/,
//     codigoProducto: /^[A-Za-z0-9\-_]+$/,
//   },

//   // URLs de webhooks y APIs externas (si las hay)
//   apis: {
//     // Aquí podrías agregar configuración para APIs de pago, envío, etc.
//     mercadopago: {
//       accessToken: process.env.MP_ACCESS_TOKEN,
//       sandbox: process.env.MP_SANDBOX === "true",
//     },
//   },
// };

// /**
//  * Obtener configuración de la empresa
//  * @returns {Object} Información de la empresa
//  */
// config.obtenerInfoEmpresa = function () {
//   return {
//     nombre: this.empresa.nombre,
//     contacto: `📞 ${this.empresa.telefono}\n📧 ${this.empresa.email}\n📍 ${this.empresa.direccion}\n🕐 ${this.empresa.horario}`,
//   };
// };

// /**
//  * Verificar si estamos en horario de atención
//  * @returns {boolean} True si estamos en horario
//  */
// config.enHorarioAtencion = function () {
//   const ahora = new Date();
//   const dia = ahora.toLocaleLowerCase("es").split(" ")[0]; // lunes, martes, etc.
//   const hora = ahora.getHours();

//   const configDia = this.horarios.dias[dia];

//   if (!configDia || configDia.activo === false) {
//     return false;
//   }

//   return hora >= configDia.inicio && hora < configDia.fin;
// };

// /**
//  * Obtener mensaje de horario
//  * @returns {string} Mensaje sobre el horario
//  */
// config.obtenerMensajeHorario = function () {
//   if (this.enHorarioAtencion()) {
//     return "✅ Estamos disponibles ahora";
//   }

//   return this.respuestasAuto.fuera_horario.replace(
//     "{horario}",
//     this.empresa.horario
//   );
// };

// /**
//  * Validar comando
//  * @param {string} mensaje - Mensaje del usuario
//  * @returns {string|null} Tipo de comando identificado
//  */
// config.identificarComando = function (mensaje) {
//   const textoLimpio = mensaje.toLowerCase().trim();

//   for (const [tipo, palabrasClave] of Object.entries(this.comandos)) {
//     if (palabrasClave.some((palabra) => textoLimpio.includes(palabra))) {
//       return tipo;
//     }
//   }

//   // Verificar si es un número de pedido
//   if (this.validaciones.numeroPedido.test(textoLimpio)) {
//     return "numero_pedido";
//   }

//   return null;
// };

// /**
//  * Obtener emoji para estado
//  * @param {string} estado - Estado del pedido
//  * @returns {string} Emoji correspondiente
//  */
// config.obtenerEmojiEstado = function (estado) {
//   return this.emojis.estados[estado] || "📋";
// };

// module.exports = config;

require("dotenv").config();

/**
 * Configuración centralizada del bot de WhatsApp adaptada para Heroku
 */

const config = {
  // Configuración de la base de datos - Adaptado para Heroku
  database: {
    host: process.env.DB_HOST || "localhost",
    port: process.env.DB_PORT || 3306,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    connectionLimit: parseInt(process.env.DB_CONNECTION_LIMIT) || 5, // Reducido para Heroku
    acquireTimeout: 60000,
    timeout: 60000,
    charset: "utf8mb4",
    // Configuraciones adicionales para Heroku
    ssl:
      process.env.DB_SSL === "true"
        ? {
            rejectUnauthorized: false, // Para bases de datos en la nube
          }
        : false,
    reconnect: true,
    idleTimeout: 300000, // 5 minutos
    connectTimeout: 60000,
  },

  // Información de la empresa
  empresa: {
    nombre: process.env.COMPANY_NAME || "ASVSystems",
    telefono: process.env.COMPANY_PHONE || "+54 351 534631",
    email: process.env.COMPANY_EMAIL || "asvsystems@gmail.com",
    direccion: process.env.COMPANY_ADDRESS || "Av. Principal 123, Córdoba",
    horario: process.env.COMPANY_HOURS || "Lunes a Viernes 9am-6pm",
    website: process.env.WEBSITE_URL || "https://asvsystems.com.ar/app",
    catalogoUrl:
      process.env.CATALOG_URL || "https://asvsystems.com.ar/app/productos",
    soporteUrl:
      process.env.SUPPORT_URL || "https://asvsystems.com.ar/app/contacto",
  },

  // Configuración del bot - Adaptado para Heroku
  bot: {
    nombre: process.env.BOT_NAME || "Bot de Pedidos",
    version: process.env.BOT_VERSION || "1.0.0",
    qrPort: 3001, // Usar el puerto de Heroku
    logLevel: process.env.LOG_LEVEL || "info",
    logFile: process.env.LOG_FILE || "bot.log",
    // Configuración específica para Heroku
    isProduction: process.env.NODE_ENV === "production",
    herokuAppName: process.env.HEROKU_APP_NAME || "whatsapp-bot-pedidos",
    keepAliveUrl: process.env.KEEP_ALIVE_URL, // URL para mantener la app activa
  },

  // Límites y configuraciones operativas - Optimizado para Heroku
  limites: {
    maxConversacionesPorUsuario:
      parseInt(process.env.MAX_CONVERSACIONES_POR_USUARIO) || 50, // Reducido para Heroku
    diasLimpiezaConversaciones:
      parseInt(process.env.DIAS_LIMPIEZA_CONVERSACIONES) || 15, // Más frecuente
    maxProductosMostrar: 15, // Reducido para optimizar memoria
    maxPedidosMostrar: 8, // Reducido para optimizar memoria
    timeoutConsulta: 20000, // 20 segundos (reducido)
    maxIntentos: 2, // Reducido para Heroku
    // Límites específicos para Heroku
    maxMemoryUsage: 512, // MB
    maxConcurrentConnections: 10,
  },

  // Mensajes predeterminados
  mensajes: {
    bienvenida: {
      principal: "🛍️ ¡Hola! Bienvenido a nuestro sistema de pedidos",
      opciones: "🔍 ¿Qué te gustaría hacer hoy?",
      primerUso:
        "👋 ¡Es la primera vez que nos escribes! Te hemos registrado automáticamente.",
    },

    errores: {
      conexionBD: "🔧 Tenemos problemas técnicos. Intenta más tarde.",
      usuarioNoEncontrado:
        "❌ No encontré tu información. Escribe *hola* para registrarte.",
      pedidoNoEncontrado:
        "❌ No encontré ese pedido o no pertenece a tu cuenta.",
      sinPedidos: "📦 No tienes pedidos registrados aún.",
      formatoInvalido: "⚠️ Formato inválido. Verifica los datos ingresados.",
      permisosDenegados:
        "🚫 No tienes permisos para acceder a esta información.",
      errorGenerico: "❌ Ocurrió un error inesperado. Intenta nuevamente.",
      // Errores específicos de Heroku
      servicioTemporalmenteNoDisponible:
        "⚠️ Servicio temporalmente no disponible. Reintentando...",
      limitesExcedidos:
        "⏰ Límites de uso temporalmente excedidos. Espera un momento.",
    },

    ayuda: {
      comandos:
        "💡 *Comandos útiles:*\n• *mis pedidos* - Ver tus pedidos\n• *productos* - Ver catálogo\n• *contacto* - Información de contacto\n• *ayuda* - Ver esta ayuda",
      noEntendido:
        "❓ No entendí tu mensaje. Escribe *ayuda* para ver los comandos disponibles.",
    },

    estados: {
      buscando: "🔍 Buscando información...",
      procesando: "⏳ Procesando solicitud...",
      consultando: "📡 Consultando base de datos...",
      generando: "🔄 Generando respuesta...",
      reconectando: "🔄 Reconectando servicio...", // Nuevo para Heroku
    },
  },

  // Configuración de horarios de atención
  horarios: {
    dias: {
      lunes: { inicio: 9, fin: 18 },
      martes: { inicio: 9, fin: 18 },
      miercoles: { inicio: 9, fin: 18 },
      jueves: { inicio: 9, fin: 18 },
      viernes: { inicio: 9, fin: 18 },
      sabado: { activo: false },
      domingo: { activo: false },
    },
    zona: "America/Argentina/Cordoba",
  },

  // Configuración de respuestas automáticas
  respuestasAuto: {
    fuera_horario:
      "⏰ Estamos fuera del horario de atención ({horario}). Te responderemos cuando volvamos.",
    mensaje_no_comercial:
      "💼 Solo atendemos consultas relacionadas con pedidos durante este horario.",
    derivacion_humano:
      "👨‍💼 Te estoy derivando con un representante humano. Espera un momento...",
    servicio_reiniciando: "🔄 Servicio reiniciándose. Vuelve en un momento...", // Nuevo para Heroku
  },

  // Palabras clave y comandos
  comandos: {
    saludo: [
      "hola",
      "hi",
      "hello",
      "buenas",
      "buenos dias",
      "buenas tardes",
      "buenas noches",
      "inicio",
      "start",
    ],
    pedidos: ["mis pedidos", "pedidos", "ordenes", "compras"],
    estado: ["estado", "status", "seguimiento", "tracking"],
    productos: ["productos", "catalogo", "artículos", "items", "que venden"],
    contacto: [
      "contacto",
      "teléfono",
      "dirección",
      "ubicación",
      "soporte",
      "ayuda",
    ],
    activos: ["activos", "pendientes", "en proceso", "vigentes"],
    ayuda: ["ayuda", "help", "comandos", "opciones", "\\?"],
    // Comandos específicos para debugging en Heroku
    debug: ["debug", "status", "health", "ping"],
  },

  // Emojis y símbolos utilizados
  emojis: {
    estados: {
      pending: "⏳",
      processing: "🔄",
      shipped: "🚚",
      delivered: "✅",
      cancelled: "❌",
      refunded: "💸",
    },
    acciones: {
      buscar: "🔍",
      cargar: "⏳",
      exito: "✅",
      error: "❌",
      info: "ℹ️",
      atencion: "⚠️",
      dinero: "💰",
      productos: "🛍️",
      usuario: "👤",
      fecha: "📅",
      telefono: "📞",
      email: "📧",
      direccion: "📍",
      entrega: "🚚",
      pago: "💳",
    },
  },

  // Validaciones
  validaciones: {
    telefono: /^\+?54\d{10}$/,
    email: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
    numeroPedido: /^\d+$/,
    codigoProducto: /^[A-Za-z0-9\-_]+$/,
  },

  // URLs de webhooks y APIs externas
  apis: {
    mercadopago: {
      accessToken: process.env.MP_ACCESS_TOKEN,
      sandbox: process.env.MP_SANDBOX === "true",
    },
    // Configuración de monitoreo para Heroku
    monitoring: {
      healthCheckInterval: 25 * 60 * 1000, // 25 minutos
      keepAliveUrl: process.env.KEEP_ALIVE_URL,
      uptimeRobotUrl: process.env.UPTIME_ROBOT_URL,
    },
  },

  // Configuración específica de Heroku
  heroku: {
    dynoType: process.env.DYNO || "web",
    release: process.env.HEROKU_RELEASE_VERSION,
    slug: process.env.HEROKU_SLUG_COMMIT,
    appName: process.env.HEROKU_APP_NAME,
    region: process.env.HEROKU_REGION || "us",
    // Configuración de logs
    logDrain: process.env.LOG_DRAIN_URL,
    // Configuración de memoria
    maxMemory: parseInt(process.env.WEB_MEMORY) || 512,
    // Configuración de timeout
    requestTimeout: 30000, // 30 segundos
  },
};

/**
 * Obtener configuración de la empresa
 * @returns {Object} Información de la empresa
 */
config.obtenerInfoEmpresa = function () {
  return {
    nombre: this.empresa.nombre,
    contacto: `📞 ${this.empresa.telefono}\n📧 ${this.empresa.email}\n📍 ${this.empresa.direccion}\n🕐 ${this.empresa.horario}`,
  };
};

/**
 * Verificar si estamos en horario de atención
 * @returns {boolean} True si estamos en horario
 */
config.enHorarioAtencion = function () {
  const ahora = new Date();
  const dia = ahora.toLocaleDateString("es", { weekday: "long" }).toLowerCase();
  const hora = ahora.getHours();

  const configDia = this.horarios.dias[dia];

  if (!configDia || configDia.activo === false) {
    return false;
  }

  return hora >= configDia.inicio && hora < configDia.fin;
};

/**
 * Obtener mensaje de horario
 * @returns {string} Mensaje sobre el horario
 */
config.obtenerMensajeHorario = function () {
  if (this.enHorarioAtencion()) {
    return "✅ Estamos disponibles ahora";
  }

  return this.respuestasAuto.fuera_horario.replace(
    "{horario}",
    this.empresa.horario
  );
};

/**
 * Validar comando
 * @param {string} mensaje - Mensaje del usuario
 * @returns {string|null} Tipo de comando identificado
 */
config.identificarComando = function (mensaje) {
  const textoLimpio = mensaje.toLowerCase().trim();

  for (const [tipo, palabrasClave] of Object.entries(this.comandos)) {
    if (palabrasClave.some((palabra) => textoLimpio.includes(palabra))) {
      return tipo;
    }
  }

  // Verificar si es un número de pedido
  if (this.validaciones.numeroPedido.test(textoLimpio)) {
    return "numero_pedido";
  }

  return null;
};

/**
 * Obtener emoji para estado
 * @param {string} estado - Estado del pedido
 * @returns {string} Emoji correspondiente
 */
config.obtenerEmojiEstado = function (estado) {
  return this.emojis.estados[estado] || "📋";
};

/**
 * Verificar si la app está en modo producción (Heroku)
 * @returns {boolean} True si está en producción
 */
config.esProduccion = function () {
  return process.env.NODE_ENV === "production";
};

/**
 * Obtener información de la instancia de Heroku
 * @returns {Object} Información del dyno de Heroku
 */
config.obtenerInfoHeroku = function () {
  return {
    dyno: this.heroku.dynoType,
    release: this.heroku.release,
    appName: this.heroku.appName,
    region: this.heroku.region,
    isProduction: this.esProduccion(),
  };
};

/**
 * Verificar límites de recursos para Heroku
 * @returns {Object} Estado de los recursos
 */
config.verificarRecursos = function () {
  const memoryUsage = process.memoryUsage();
  const memoryMB = memoryUsage.heapUsed / 1024 / 1024;

  return {
    memoryUsed: Math.round(memoryMB),
    memoryLimit: this.heroku.maxMemory,
    memoryPercent: Math.round((memoryMB / this.heroku.maxMemory) * 100),
    uptime: process.uptime(),
    isMemoryHigh: memoryMB > this.heroku.maxMemory * 0.8, // Alerta al 80%
  };
};

module.exports = config;
