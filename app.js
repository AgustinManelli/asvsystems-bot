const express = require("express");
const cors = require("cors");

const {
  createBot,
  createProvider,
  createFlow,
  addKeyword,
  EVENTS,
} = require("@bot-whatsapp/bot");
const QRPortalWeb = require("@bot-whatsapp/portal");
const BaileysProvider = require("@bot-whatsapp/provider/baileys");
const MySQLAdapter = require("@bot-whatsapp/database/mysql");

// Configuración e imports locales
const config = require("./config/config");
const { testConnection } = require("./database");
const Usuario = require("./models/usuario");
const Conversacion = require("./models/conversacion");
const Pedido = require("./models/pedido");
const {
  formatearFecha,
  formatearMoneda,
  crearResumenPedido,
  crearMensajeError,
  crearListaComandos,
  parsearComando,
  crearMensajeCargando,
  validarHorarioAtencion,
} = require("./utils/helpers");

const PORT = process.env.PORT || 3000;

console.log(`🚀 Iniciando ${config.bot.nombre} v${config.bot.version}`);
console.log(`🌐 Puerto configurado: ${PORT}`);

// Configurar Express para mantener Heroku activo
const app = express();
app.use(cors());
app.use(express.json());

// Ruta de health check para Heroku
app.get("/", (req, res) => {
  res.json({
    status: "active",
    service: "WhatsApp Bot Pedidos",
    version: config.bot.version,
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
  });
});

// Ruta para obtener información del bot
app.get("/status", (req, res) => {
  res.json({
    bot: config.bot.nombre,
    version: config.bot.version,
    empresa: config.empresa.nombre,
    horario: config.empresa.horario,
    activo: true,
  });
});

// Ruta para webhooks (si necesitas recibir datos externos)
app.post("/webhook", (req, res) => {
  console.log("📡 Webhook recibido:", req.body);
  res.json({ received: true });
});

// Mantener la aplicación activa (ping cada 25 minutos)
setInterval(() => {
  console.log("💓 Keep alive ping");
}, 25 * 60 * 1000);

// Flujo principal de bienvenida (sin cambios en la lógica)
const flowPrincipal = addKeyword(config.comandos.saludo).addAnswer(
  config.mensajes.bienvenida.principal,
  null,
  async (ctx, { flowDynamic, gotoFlow }) => {
    try {
      await Usuario.crear(ctx.from, ctx.pushName);

      await Conversacion.guardar(
        ctx.from,
        ctx.body,
        config.mensajes.bienvenida.principal
      );

      console.log(`✅ Usuario conectado: ${ctx.from} - ${ctx.pushName}`);

      return gotoFlow(flowMenu);
    } catch (error) {
      console.error("❌ Error en flowPrincipal:", error);
      await flowDynamic(config.mensajes.errores.errorGenerico);
    }
  }
);

const flowMenu = addKeyword("menu").addAnswer(
  `Te dejo el menú rápido:\n\n` +
    `1️⃣  Mis pedidos\n` +
    `2️⃣  Ver catálogo / Productos\n` +
    `3️⃣  Consultar estado de un pedido\n` +
    `4️⃣  Modificar un pedido\n` +
    `5️⃣  Pedidos activos / pendientes\n` +
    `6️⃣  Contacto / Soporte\n` +
    `7️⃣  Ayuda / Comandos\n\n` +
    `Responde con el *número* (ej: 1) o escribe el *comando* (ej: mis pedidos).`,
  { capture: true },
  async (ctx, { flowDynamic, gotoFlow }) => {
    try {
      const texto = (ctx.body || "").toString().trim().toLowerCase();

      // Guardar en historial
      await Conversacion.guardar(ctx.from, ctx.body, "Menú principal");

      // Mapeo por número
      if (
        /^1\b/.test(texto) ||
        texto.includes("mis pedidos") ||
        texto === "mis pedidos"
      ) {
        return gotoFlow(flowMisPedidos);
      }

      if (
        /^2\b/.test(texto) ||
        texto.includes("producto") ||
        texto.includes("catálogo") ||
        texto.includes("catalogo")
      ) {
        return gotoFlow(flowProductos);
      }

      if (/^3\b/.test(texto) || texto.includes("estado")) {
        return gotoFlow(flowEstadoPedido);
      }

      if (
        /^4\b/.test(texto) ||
        texto.includes("modificar") ||
        texto.includes("editar") ||
        texto.includes("cambiar")
      ) {
        return gotoFlow(flowModificarPedido);
      }

      if (
        /^5\b/.test(texto) ||
        texto.includes("activos") ||
        texto.includes("pendiente")
      ) {
        return gotoFlow(flowPedidosActivos);
      }

      if (
        /^6\b/.test(texto) ||
        texto.includes("contacto") ||
        texto.includes("soporte")
      ) {
        return gotoFlow(flowContacto);
      }

      if (
        /^7\b/.test(texto) ||
        texto.includes("ayuda") ||
        texto.includes("comandos")
      ) {
        return gotoFlow(flowAyuda);
      }

      // Si el usuario respondió un número pero fuera de rango
      if (/^\d+$/.test(texto)) {
        await flowDynamic(
          "❌ Opción no válida. Por favor, elegí un número del 1 al 7 o escribe el comando.\n\n" +
            "Ej: *1* para Mis pedidos o *productos* para ver el catálogo."
        );
        return gotoFlow(flowMenu);
      }

      // Si viene un texto libre, intentamos mapear por palabra clave
      if (texto.includes("pedido") && texto.includes("mis")) {
        return gotoFlow(flowMisPedidos);
      }

      // Si no matchea nada, pedimos que reintente
      await flowDynamic(
        "No entendí tu elección. Responde con un número (1-7) o escribe lo que querés hacer. Ej: *productos* o *modificar 123*."
      );
    } catch (error) {
      console.error("❌ Error en flowMenu:", error);
      await flowDynamic(config.mensajes.errores.errorGenerico);
    }
  }
);

// Flujo para consultar pedidos del usuario
const flowMisPedidos = addKeyword([
  // formas explícitas cortas
  "mis pedidos",
  "pedidos",
  "🛒 Mis Pedidos",

  // variantes naturales — expresiones completas (RegExp)
  // Ej: "quiero ver mis pedidos", "me gustaría ver mis órdenes", "mostrarme pedidos", "dame mis pedidos"
  /^\s*(?:quiero|quieres|puedo|necesito|dame|mostrarme|mostrar|ver|consultar|me gustaría|me gustaria|quisiera|quisiese)\b.*\b(?:mis\s+)?(?:pedidos|ordenes|órdenes)\b.*$/i,

  // Ej: "ver pedidos", "mostrar pedidos", "consultar ordenes"
  /^\s*\b(?:ver|mostrar|consultar)\b.*\b(?:pedidos|ordenes|órdenes)\b.*$/i,

  // fallback que captura "pedido(s)" u "orden(es)" con alguna palabra alrededor (evita ser extremadamente broad)
  /\b(?:mis\s+)?(?:pedidos|ordenes|órdenes)\b/i,
]).addAnswer(
  crearMensajeCargando("pedidos"),
  null,
  async (ctx, { flowDynamic }) => {
    try {
      const usuario = await Usuario.obtenerPorTelefono(ctx.from);

      if (!usuario) {
        await flowDynamic(crearMensajeError("usuario_no_registrado"));
        return;
      }

      const pedidos = await Pedido.obtenerPorUsuario(usuario.id);
      if (pedidos.length === 0) {
        await flowDynamic(
          crearMensajeError(
            "sin_pedidos",
            "¿Te gustaría ver nuestros productos? Escribe *productos*"
          )
        );
      } else {
        let mensaje = `📦 *Tus Pedidos (${pedidos.length}):*\n\n`;

        pedidos
          .slice(0, config.limites.maxPedidosMostrar)
          .forEach((pedido, index) => {
            const fecha = formatearFecha(pedido.order_date);
            const estado = config.obtenerEmojiEstado(pedido.status);

            mensaje += `*${index + 1}.* Pedido #${pedido.id}\n`;
            mensaje += `   📅 ${fecha}\n`;
            mensaje += `   💰 ${formatearMoneda(pedido.total)}\n`;
            mensaje += `   📋 ${estado} ${pedido.status.toUpperCase()}\n\n`;
          });

        if (pedidos.length > config.limites.maxPedidosMostrar) {
          mensaje += `... y ${
            pedidos.length - config.limites.maxPedidosMostrar
          } pedidos más\n\n`;
        }

        mensaje +=
          "💡Puedes ver los detalles de un pedido escribiendo *ver* y el *número de tu pedido*. Por ejemplo: ver 39\n";
        mensaje += "📞 Escribe *contacto* si necesitas ayuda.";

        await flowDynamic(mensaje);
      }

      await Conversacion.guardar(
        ctx.from,
        ctx.body,
        "Consulta de pedidos realizada"
      );
    } catch (error) {
      console.error("❌ Error en flowMisPedidos:", error);
      await flowDynamic(config.mensajes.errores.conexionBD);
    }
  }
);

// Flujo para ver detalles de un pedido específico
const flowDetallePedido = addKeyword(
  [/^\s*(ver|detalle|mostrar)(?:\s+pedido)?\s+(\d+)\s*$/i],
  {
    regex: true,
  }
).addAnswer(
  "🔍 Buscando detalles de tu pedido...",
  null,
  async (ctx, { flowDynamic }) => {
    try {
      const matches = ctx.body.match(/(\d+)/);
      const numeroPedido = matches ? parseInt(matches[0]) : NaN;
      if (isNaN(numeroPedido)) {
        await flowDynamic("❌ No reconozco el número. Ej: *ver 123*");
        return;
      }

      const usuario = await Usuario.obtenerPorTelefono(ctx.from);
      if (!usuario) {
        await flowDynamic(crearMensajeError("usuario_no_registrado"));
        return;
      }

      const pedido = await Pedido.obtenerDetalle(numeroPedido, usuario.id);
      if (!pedido) {
        await flowDynamic(
          crearMensajeError("pedido_no_encontrado", "Verifica el número.")
        );
        return;
      }

      const items = await Pedido.obtenerItems(numeroPedido);
      let mensaje = `📋 *Detalle del Pedido #${pedido.id}*\n\n`;
      mensaje += `👤 Cliente: ${pedido.customer_name}\n`;
      mensaje += `📅 Fecha: ${formatearFecha(pedido.order_date)}\n`;
      mensaje += `📋 Estado: ${config.obtenerEmojiEstado(
        pedido.status
      )} ${pedido.status.toUpperCase()}\n`;
      mensaje += `💰 Total: ${formatearMoneda(pedido.total)}\n\n`;
      if (items.length > 0) {
        mensaje += `🛍️ Productos:\n`;
        items.forEach((it, i) => {
          mensaje += `${i + 1}. ${it.name} — ${it.quantity} x ${formatearMoneda(
            it.product_price
          )} = ${formatearMoneda(it.line_total)}\n`;
        });
      }
      mensaje += `\n💡Si querés modificarlo escribe *modificar ${pedido.id}*`;
      await flowDynamic(mensaje);
    } catch (error) {
      console.error("❌ Error en flowDetalleInline:", error);
      await flowDynamic(config.mensajes.errores.conexionBD);
    }
  }
);

// Flujo para consultar estado específico de pedido
const flowEstadoPedido = addKeyword(config.comandos.estado).addAnswer(
  "🔍 Escribe el número de tu pedido para consultar su estado o consulta tus pedidos con *Mis pedidos*:",
  null,
  async (ctx, { flowDynamic, gotoFlow }) => {
    await Conversacion.guardar(
      ctx.from,
      ctx.body,
      "Solicitud de estado de pedido"
    );
  }
);

const flowModificarPedido = addKeyword(
  [/^\s*(modificar|editar|cambiar)(?:\s+pedido)?\s+(\d+)\s*$/i],
  {
    regex: true,
  }
).addAnswer(
  "🔧 Buscando pedido...",
  null,
  async (ctx, { flowDynamic, state }) => {
    try {
      const matches = ctx.body.match(/(\d+)/);
      const numeroPedido = matches ? parseInt(matches[0]) : NaN;
      if (isNaN(numeroPedido)) {
        await flowDynamic("❌ No reconozco el número. Ej: *modificar 123*");
        return;
      }

      const usuario = await Usuario.obtenerPorTelefono(ctx.from);
      if (!usuario) {
        await flowDynamic(crearMensajeError("usuario_no_registrado"));
        return;
      }

      const pedido = await Pedido.obtenerDetalle(numeroPedido, usuario.id);
      if (!pedido) {
        await flowDynamic(
          crearMensajeError("pedido_no_encontrado", "Verifica el número.")
        );
        return;
      }

      if (!Pedido.puedeModificarse(pedido.status)) {
        await flowDynamic(
          `❌ No puedes modificar este pedido.\n📋 Estado: ${pedido.status.toUpperCase()}`
        );
        return;
      }

      // Guardar en estado para continuar el flujo de modificación
      await state.update({
        pedidoAModificar: pedido,
        pendingAction: "modificar",
      });

      // Mostrar opciones para modificar (puedes reutilizar tu código existente)
      const opcionesModificacion =
        `🔧 *Pedido #${pedido.id} - Opciones:*\n\n` +
        `• Cambiar dirección\n` +
        `• Cambiar productos\n` +
        `• Cancelar pedido\n\n` +
        `Escribe la opción que deseas (por ejemplo: "direccion", "productos", "cancelar").`;

      await flowDynamic(opcionesModificacion);
    } catch (error) {
      console.error("❌ Error en flowModificarPedidoInline:", error);
      await flowDynamic(config.mensajes.errores.conexionBD);
    }
  }
);

// Flujo para mostrar productos/catálogo
const flowProductos = addKeyword([
  ...config.comandos.productos,
  "📋 Nuevo Pedido",
]).addAnswer(
  crearMensajeCargando("catálogo de productos"),
  null,
  async (ctx, { flowDynamic }) => {
    try {
      const productos = await Pedido.obtenerProductosDisponibles(
        config.limites.maxProductosMostrar
      );

      if (productos.length === 0) {
        await flowDynamic(
          "❌ No hay productos disponibles en este momento.\n\n📞 Contacta con nosotros para más información."
        );
        return;
      }

      let mensaje = `🛍️ *Catálogo de Productos Destacados:*\n\n`;

      const productosAgrupados = productos.reduce((grupos, producto) => {
        const categoria = producto.category || "Otros";
        if (!grupos[categoria]) grupos[categoria] = [];
        grupos[categoria].push(producto);
        return grupos;
      }, {});

      Object.keys(productosAgrupados).forEach((categoria) => {
        if (categoria !== "Otros") {
          mensaje += `📂 *${categoria}:*\n`;
        }

        productosAgrupados[categoria].forEach((producto, index) => {
          mensaje += `• ${producto.name}\n`;
          mensaje += `  💰 ${formatearMoneda(producto.price)}`;

          if (producto.sku) {
            mensaje += ` (${producto.sku})`;
          }

          mensaje += `\n  📦 ${producto.in_stock ? "Disponible" : "Agotado"}\n`;

          if (producto.description) {
            const descripcionCorta = producto.description.substring(0, 60);
            mensaje += `  📝 ${descripcionCorta}${
              producto.description.length > 60 ? "..." : ""
            }\n`;
          }
          mensaje += "\n";
        });
      });

      mensaje += `💡 Para hacer un pedido:\n`;
      mensaje += `📞 Escribe *contacto* para hablar con nuestro equipo\n`;
      mensaje += `🌐 Visita: ${config.empresa.catalogoUrl}`;

      await flowDynamic(mensaje);
      await Conversacion.guardar(
        ctx.from,
        ctx.body,
        "Catálogo de productos consultado"
      );
    } catch (error) {
      console.error("❌ Error en flowProductos:", error);
      await flowDynamic(config.mensajes.errores.conexionBD);
    }
  }
);

// Flujo de información de contacto
const flowContacto = addKeyword([
  ...config.comandos.contacto,
  "📞 Contacto",
]).addAnswer(
  `📞 *Información de Contacto:*\n\n${
    config.obtenerInfoEmpresa().contacto
  }\n\n${config.obtenerMensajeHorario()}`,
  null,
  async (ctx, { flowDynamic }) => {
    try {
      const horario = validarHorarioAtencion();

      let mensajeAdicional = "\n💡 *Comandos útiles:*\n";
      mensajeAdicional += "• *mis pedidos* - Ver tus pedidos\n";
      mensajeAdicional += "• *productos* - Ver catálogo\n";
      mensajeAdicional += "• *estado* - Consultar estado de pedido\n";
      mensajeAdicional += "• *activos* - Ver pedidos pendientes\n";
      mensajeAdicional += "• *hola* - Volver al menú principal";

      if (!horario.estaAbierto) {
        mensajeAdicional +=
          "\n\n⏰ Puedes dejar tu consulta y te responderemos cuando volvamos.";
      }

      await flowDynamic(mensajeAdicional);
      await Conversacion.guardar(
        ctx.from,
        ctx.body,
        "Información de contacto consultada"
      );
    } catch (error) {
      console.error("❌ Error en flowContacto:", error);
    }
  }
);

// Flujo para pedidos activos/pendientes
const flowPedidosActivos = addKeyword(config.comandos.activos).addAnswer(
  crearMensajeCargando("pedidos activos"),
  null,
  async (ctx, { flowDynamic }) => {
    try {
      const usuario = await Usuario.obtenerPorTelefono(ctx.from);

      if (!usuario) {
        await flowDynamic(crearMensajeError("usuario_no_registrado"));
        return;
      }

      const pedidosActivos = await Pedido.obtenerPedidosActivos(usuario.id);

      if (pedidosActivos.length === 0) {
        await flowDynamic(
          "📦 No tienes pedidos activos en este momento.\n\n" +
            "✨ ¿Te gustaría ver todos tus pedidos? Escribe *mis pedidos*\n" +
            "🛍️ ¿O prefieres ver nuestros productos? Escribe *productos*"
        );
      } else {
        let mensaje = `🔄 *Pedidos Activos (${pedidosActivos.length}):*\n\n`;

        pedidosActivos.forEach((pedido, index) => {
          mensaje += `*${index + 1}.* Pedido #${pedido.id}\n`;
          mensaje += `   📅 ${formatearFecha(pedido.order_date)}\n`;
          mensaje += `   💰 ${formatearMoneda(pedido.total)}\n`;
          mensaje += `   📋 ⏳ PENDIENTE\n\n`;
        });

        mensaje +=
          "💡 Escribe el *número del pedido* para ver detalles completos\n";
        mensaje += "📞 ¿Necesitas hacer cambios? Escribe *contacto*";

        await flowDynamic(mensaje);
      }

      await Conversacion.guardar(
        ctx.from,
        ctx.body,
        "Consulta de pedidos activos"
      );
    } catch (error) {
      console.error("❌ Error en flowPedidosActivos:", error);
      await flowDynamic(config.mensajes.errores.conexionBD);
    }
  }
);

// Flujo de ayuda y comandos
const flowAyuda = addKeyword(config.comandos.ayuda).addAnswer(
  crearListaComandos(),
  null,
  async (ctx, { flowDynamic }) => {
    try {
      const infoEmpresa = config.obtenerInfoEmpresa();
      const mensajeAdicional = `\n📞 *¿Necesitas ayuda personal?*\n${infoEmpresa.contacto}`;

      await flowDynamic(mensajeAdicional);
      await Conversacion.guardar(
        ctx.from,
        ctx.body,
        "Ayuda y comandos consultados"
      );
    } catch (error) {
      console.error("❌ Error en flowAyuda:", error);
    }
  }
);

// Flujo para estadísticas (solo administradores)
const flowEstadisticas = addKeyword([
  "stats",
  "estadisticas",
  "admin123",
]).addAnswer(
  crearMensajeCargando("estadísticas del sistema"),
  null,
  async (ctx, { flowDynamic }) => {
    try {
      const usuario = await Usuario.obtenerPorTelefono(ctx.from);

      if (!usuario || usuario.user_type !== "admin") {
        await flowDynamic("🚫 Acceso restringido.");
        return;
      }

      const stats = await Pedido.obtenerEstadisticas();

      let mensaje = `📊 *Estadísticas del Sistema*\n\n`;
      mensaje += `👥 Usuarios registrados: *${stats.totalUsuarios}*\n`;
      mensaje += `📦 Total pedidos: *${stats.totalPedidos}*\n`;
      mensaje += `⏳ Pedidos pendientes: *${stats.pedidosPendientes}*\n`;
      mensaje += `✅ Pedidos entregados: *${stats.pedidosEntregados}*\n`;
      mensaje += `❌ Pedidos cancelados: *${stats.pedidosCancelados || 0}*\n`;
      mensaje += `💰 Ventas totales: *${formatearMoneda(
        stats.ventasTotales
      )}*\n`;
      mensaje += `💬 Conversaciones: *${stats.totalConversaciones}*\n\n`;
      mensaje += `📈 Promedio por pedido: *${formatearMoneda(
        stats.ventasTotales / (stats.pedidosEntregados || 1)
      )}*`;

      await flowDynamic(mensaje);
      await Conversacion.guardar(
        ctx.from,
        ctx.body,
        "Estadísticas consultadas"
      );
    } catch (error) {
      console.error("❌ Error en estadísticas:", error);
      await flowDynamic(config.mensajes.errores.conexionBD);
    }
  }
);

// Flujo para mensajes no reconocidos
const flowNoReconocido = addKeyword(EVENTS.ACTION).addAnswer(
  null,
  null,
  async (ctx, { flowDynamic }) => {
    try {
      const comandoParsed = parsearComando(ctx.body);

      if (comandoParsed.esNumeroPedido) {
        return;
      }

      let respuesta = config.mensajes.ayuda.noEntendido;

      const texto = ctx.body.toLowerCase();
      if (
        texto.includes("pedido") ||
        texto.includes("orden") ||
        texto.includes("compra")
      ) {
        respuesta += "\n\n💡 ¿Quizás buscabas *mis pedidos*?";
      } else if (
        texto.includes("producto") ||
        texto.includes("catalogo") ||
        texto.includes("precio")
      ) {
        respuesta += "\n\n💡 ¿Quizás buscabas *productos*?";
      } else if (
        texto.includes("contacto") ||
        texto.includes("telefono") ||
        texto.includes("ayuda")
      ) {
        respuesta += "\n\n💡 ¿Quizás buscabas *contacto*?";
      }

      await flowDynamic(respuesta);
      await Conversacion.guardar(ctx.from, ctx.body, "Comando no reconocido");
    } catch (error) {
      console.error("❌ Error en flowNoReconocido:", error);
    }
  }
);

const adapterProvider = createProvider(BaileysProvider);

app.post("/send-message", async (req, res) => {
  const { to, text } = req.body;
  try {
    await adapterProvider.sendText(to, text);
    res.json({ success: true, message: "Mensaje enviado" });
  } catch (error) {
    console.error("Error al enviar mensaje:", error);
    res
      .status(500)
      .json({ success: false, message: "Error al enviar mensaje" });
  }
});

// Función principal del bot
const initBot = async () => {
  try {
    console.log("🔗 Probando conexión a la base de datos...");
    const dbConnected = await testConnection();

    if (!dbConnected) {
      console.error("❌ No se pudo conectar a la base de datos");
      console.log("⚠️ Continuando sin base de datos para diagnóstico...");
    } else {
      console.log("✅ Conexión a base de datos establecida");
    }

    console.log(`🏢 Empresa: ${config.empresa.nombre}`);
    console.log(`📞 Contacto: ${config.empresa.telefono}`);
    console.log(`⏰ Horario: ${config.empresa.horario}`);

    // const adapterDB = new MockAdapter();
    const adapterDB = new MySQLAdapter(config.database);
    const adapterFlow = createFlow([
      flowPrincipal,
      flowMenu,
      flowMisPedidos,
      flowEstadoPedido,
      flowModificarPedido,
      flowProductos,
      flowContacto,
      flowPedidosActivos,
      flowAyuda,
      flowEstadisticas,
      flowDetallePedido,
      flowNoReconocido,
    ]);

    createBot({
      flow: adapterFlow,
      provider: adapterProvider,
      database: adapterDB,
    });

    console.log("🚀 Bot de WhatsApp iniciado correctamente!");

    // Solo mostrar QR en desarrollo local
    if (process.env.NODE_ENV !== "production") {
      console.log(`🌐 Iniciando portal web en puerto ${config.bot.qrPort}`);
      QRPortalWeb({ port: config.bot.qrPort });
    }
  } catch (error) {
    console.error("❌ Error al iniciar el bot:", error);
    // No salir en producción para permitir diagnóstico
    if (process.env.NODE_ENV !== "production") {
      process.exit(1);
    }
  }
};

// Manejo de errores globales para Heroku
process.on("unhandledRejection", (reason, promise) => {
  console.error("❌ Unhandled Rejection at:", promise, "reason:", reason);
  // No salir en producción
});

process.on("uncaughtException", (error) => {
  console.error("❌ Uncaught Exception:", error);
  if (process.env.NODE_ENV === "production") {
    // En producción, reiniciar después de un delay
    setTimeout(() => process.exit(1), 5000);
  } else {
    process.exit(1);
  }
});

// Manejo graceful de shutdown
process.on("SIGTERM", () => {
  console.log("🛑 Recibida señal SIGTERM. Cerrando aplicación...");
  process.exit(0);
});

process.on("SIGINT", () => {
  console.log("🛑 Recibida señal SIGINT. Cerrando aplicación...");
  process.exit(0);
});

// Inicializar servidor Express (requerido para Heroku)
app.listen(PORT, () => {
  console.log(`🌐 Servidor HTTP iniciado en puerto ${PORT}`);
  console.log(`🔗 Health check: http://localhost:${PORT}/`);

  // Inicializar el bot después de que el servidor esté listo
  initBot();
});

module.exports = app;
