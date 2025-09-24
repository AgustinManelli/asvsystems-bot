// const {
//   createBot,
//   createProvider,
//   createFlow,
//   addKeyword,
// } = require("@bot-whatsapp/bot");
// const QRPortalWeb = require("@bot-whatsapp/portal");
// const BaileysProvider = require("@bot-whatsapp/provider/baileys");
// const MockAdapter = require("@bot-whatsapp/database/mock");

// // Importar configuración y modelos
// const config = require("./config/config");
// const { testConnection } = require("./database");
// const Usuario = require("./models/usuario");
// const Conversacion = require("./models/conversacion");
// const Pedido = require("./models/pedido");
// const {
//   formatearFecha,
//   formatearMoneda,
//   crearResumenPedido,
//   crearMensajeError,
//   crearListaComandos,
//   parsearComando,
//   crearMensajeCargando,
//   validarHorarioAtencion,
// } = require("./utils/helpers");

// console.log(`🚀 Iniciando ${config.bot.nombre} v${config.bot.version}`);

// // Flujo principal de bienvenida
// const flowPrincipal = addKeyword(config.comandos.saludo)
//   .addAnswer(
//     config.mensajes.bienvenida.principal,
//     null,
//     async (ctx, { flowDynamic }) => {
//       try {
//         // Registrar o actualizar usuario
//         await Usuario.crear(ctx.from, ctx.pushName);
//         await Usuario.actualizarUltimoLogin(ctx.from);

//         // Verificar horario de atención
//         const horario = validarHorarioAtencion();

//         let mensajeBienvenida = config.mensajes.bienvenida.opciones;
//         if (!horario.estaAbierto) {
//           mensajeBienvenida += `\n\n${horario.mensaje}`;
//         }

//         await flowDynamic(mensajeBienvenida);

//         // Guardar conversación
//         await Conversacion.guardar(
//           ctx.from,
//           ctx.body,
//           config.mensajes.bienvenida.principal
//         );

//         console.log(`✅ Usuario conectado: ${ctx.from} - ${ctx.pushName}`);
//       } catch (error) {
//         console.error("❌ Error en flowPrincipal:", error);
//         await flowDynamic(config.mensajes.errores.errorGenerico);
//       }
//     }
//   )
//   .addAnswer(config.mensajes.bienvenida.opciones, {
//     buttons: [
//       { body: "🛒 Mis Pedidos" },
//       { body: "📋 Nuevo Pedido" },
//       { body: "📞 Contacto" },
//     ],
//   });

// // Flujo para consultar pedidos del usuario
// const flowMisPedidos = addKeyword([
//   "mis pedidos",
//   "pedidos",
//   "🛒 Mis Pedidos",
// ]).addAnswer(
//   crearMensajeCargando("pedidos"),
//   null,
//   async (ctx, { flowDynamic }) => {
//     try {
//       const usuario = await Usuario.obtenerPorTelefono(ctx.from);

//       if (!usuario) {
//         await flowDynamic(crearMensajeError("usuario_no_registrado"));
//         return;
//       }

//       const pedidos = await Pedido.obtenerPorUsuario(usuario.id);

//       if (pedidos.length === 0) {
//         await flowDynamic(
//           crearMensajeError(
//             "sin_pedidos",
//             "¿Te gustaría ver nuestros productos? Escribe *productos*"
//           )
//         );
//       } else {
//         let mensaje = `📦 *Tus Pedidos (${pedidos.length}):*\n\n`;

//         pedidos
//           .slice(0, config.limites.maxPedidosMostrar)
//           .forEach((pedido, index) => {
//             const fecha = formatearFecha(pedido.order_date);
//             const estado = config.obtenerEmojiEstado(pedido.status);

//             mensaje += `*${index + 1}.* Pedido #${pedido.id}\n`;
//             mensaje += `   📅 ${fecha}\n`;
//             mensaje += `   💰 ${formatearMoneda(pedido.total)}\n`;
//             mensaje += `   📋 ${estado} ${pedido.status.toUpperCase()}\n\n`;
//           });

//         if (pedidos.length > config.limites.maxPedidosMostrar) {
//           mensaje += `... y ${
//             pedidos.length - config.limites.maxPedidosMostrar
//           } pedidos más\n\n`;
//         }

//         mensaje += "💡 Escribe el *número del pedido* para ver detalles\n";
//         mensaje += "📞 Escribe *contacto* si necesitas ayuda";

//         await flowDynamic(mensaje);
//       }

//       await Conversacion.guardar(
//         ctx.from,
//         ctx.body,
//         "Consulta de pedidos realizada"
//       );
//     } catch (error) {
//       console.error("❌ Error en flowMisPedidos:", error);
//       await flowDynamic(config.mensajes.errores.conexionBD);
//     }
//   }
// );

// // Flujo para ver detalles de un pedido específico
// const flowDetallePedido = addKeyword(/^\d+$/).addAnswer(
//   crearMensajeCargando("detalles del pedido"),
//   null,
//   async (ctx, { flowDynamic }) => {
//     try {
//       const numeroPedido = parseInt(ctx.body);
//       const usuario = await Usuario.obtenerPorTelefono(ctx.from);

//       if (!usuario) {
//         await flowDynamic(crearMensajeError("usuario_no_registrado"));
//         return;
//       }

//       const pedido = await Pedido.obtenerDetalle(numeroPedido, usuario.id);

//       if (!pedido) {
//         await flowDynamic(
//           crearMensajeError(
//             "pedido_no_encontrado",
//             "Verifica el número de pedido o escribe *mis pedidos* para ver todos."
//           )
//         );
//         return;
//       }

//       const items = await Pedido.obtenerItems(numeroPedido);

//       let mensaje = `📋 *Detalle del Pedido #${pedido.id}*\n\n`;
//       mensaje += `👤 Cliente: ${pedido.customer_name}\n`;
//       mensaje += `📅 Fecha: ${formatearFecha(pedido.order_date)}\n`;
//       mensaje += `📋 Estado: ${config.obtenerEmojiEstado(
//         pedido.status
//       )} ${pedido.status.toUpperCase()}\n`;
//       mensaje += `📞 Teléfono: ${pedido.customer_phone || "No especificado"}\n`;
//       mensaje += `🚚 Entrega: ${
//         pedido.delivery_method === "delivery"
//           ? "A domicilio"
//           : "Retiro en tienda"
//       }\n`;

//       if (pedido.delivery_address) {
//         mensaje += `📍 Dirección: ${pedido.delivery_address}\n`;
//       }

//       mensaje += `💳 Pago: ${
//         pedido.payment_method === "cash"
//           ? "Efectivo"
//           : pedido.payment_method === "card"
//           ? "Tarjeta"
//           : "Online"
//       }\n\n`;

//       if (items.length > 0) {
//         mensaje += `🛍️ *Productos (${items.length}):*\n`;
//         let subtotal = 0;

//         items.forEach((item, index) => {
//           mensaje += `${index + 1}. ${item.name}\n`;
//           mensaje += `   💰 ${formatearMoneda(item.product_price)} x ${
//             item.quantity
//           } = ${formatearMoneda(item.line_total)}\n`;
//           subtotal += parseFloat(item.line_total);
//         });
//       }

//       mensaje += `\n💰 *Total: ${formatearMoneda(pedido.total)}*\n\n`;
//       mensaje += `📞 ¿Necesitas modificar algo? Escribe *contacto*`;

//       await flowDynamic(mensaje);
//       await Conversacion.guardar(
//         ctx.from,
//         ctx.body,
//         `Detalles del pedido #${numeroPedido} consultados`
//       );
//     } catch (error) {
//       console.error("❌ Error en flowDetallePedido:", error);
//       await flowDynamic(config.mensajes.errores.conexionBD);
//     }
//   }
// );

// // Flujo para consultar estado específico de pedido
// const flowEstadoPedido = addKeyword(config.comandos.estado).addAnswer(
//   "🔍 Escribe el número de tu pedido para consultar su estado:",
//   null,
//   async (ctx, { flowDynamic }) => {
//     await Conversacion.guardar(
//       ctx.from,
//       ctx.body,
//       "Solicitud de estado de pedido"
//     );
//   }
// );

// // Flujo para mostrar productos/catálogo
// const flowProductos = addKeyword([
//   ...config.comandos.productos,
//   "📋 Nuevo Pedido",
// ]).addAnswer(
//   crearMensajeCargando("catálogo de productos"),
//   null,
//   async (ctx, { flowDynamic }) => {
//     try {
//       const productos = await Pedido.obtenerProductosDisponibles(
//         config.limites.maxProductosMostrar
//       );

//       if (productos.length === 0) {
//         await flowDynamic(
//           "❌ No hay productos disponibles en este momento.\n\n📞 Contacta con nosotros para más información."
//         );
//         return;
//       }

//       let mensaje = `🛍️ *Catálogo de Productos:*\n\n`;

//       // Agrupar por categoría si existe
//       const productosAgrupados = productos.reduce((grupos, producto) => {
//         const categoria = producto.category || "Otros";
//         if (!grupos[categoria]) grupos[categoria] = [];
//         grupos[categoria].push(producto);
//         return grupos;
//       }, {});

//       Object.keys(productosAgrupados).forEach((categoria) => {
//         if (categoria !== "Otros") {
//           mensaje += `📂 *${categoria}:*\n`;
//         }

//         productosAgrupados[categoria].forEach((producto, index) => {
//           mensaje += `• ${producto.name}\n`;
//           mensaje += `  💰 ${formatearMoneda(producto.price)}`;

//           if (producto.sku) {
//             mensaje += ` (${producto.sku})`;
//           }

//           mensaje += `\n  📦 ${producto.in_stock ? "Disponible" : "Agotado"}\n`;

//           if (producto.description) {
//             const descripcionCorta = producto.description.substring(0, 60);
//             mensaje += `  📝 ${descripcionCorta}${
//               producto.description.length > 60 ? "..." : ""
//             }\n`;
//           }
//           mensaje += "\n";
//         });
//       });

//       mensaje += `💡 Para hacer un pedido:\n`;
//       mensaje += `📞 Escribe *contacto* para hablar con nuestro equipo\n`;
//       mensaje += `🌐 Visita: ${config.empresa.catalogoUrl}`;

//       await flowDynamic(mensaje);
//       await Conversacion.guardar(
//         ctx.from,
//         ctx.body,
//         "Catálogo de productos consultado"
//       );
//     } catch (error) {
//       console.error("❌ Error en flowProductos:", error);
//       await flowDynamic(config.mensajes.errores.conexionBD);
//     }
//   }
// );

// // Flujo de información de contacto
// const flowContacto = addKeyword([
//   ...config.comandos.contacto,
//   "📞 Contacto",
// ]).addAnswer(
//   `📞 *Información de Contacto:*\n\n${
//     config.obtenerInfoEmpresa().contacto
//   }\n\n${config.obtenerMensajeHorario()}`,
//   null,
//   async (ctx, { flowDynamic }) => {
//     try {
//       const horario = validarHorarioAtencion();

//       let mensajeAdicional = "\n💡 *Comandos útiles:*\n";
//       mensajeAdicional += "• *mis pedidos* - Ver tus pedidos\n";
//       mensajeAdicional += "• *productos* - Ver catálogo\n";
//       mensajeAdicional += "• *estado* - Consultar estado de pedido\n";
//       mensajeAdicional += "• *activos* - Ver pedidos pendientes\n";
//       mensajeAdicional += "• *hola* - Volver al menú principal";

//       if (!horario.estaAbierto) {
//         mensajeAdicional +=
//           "\n\n⏰ Puedes dejar tu consulta y te responderemos cuando volvamos.";
//       }

//       await flowDynamic(mensajeAdicional);
//       await Conversacion.guardar(
//         ctx.from,
//         ctx.body,
//         "Información de contacto consultada"
//       );
//     } catch (error) {
//       console.error("❌ Error en flowContacto:", error);
//     }
//   }
// );

// // Flujo para pedidos activos/pendientes
// const flowPedidosActivos = addKeyword(config.comandos.activos).addAnswer(
//   crearMensajeCargando("pedidos activos"),
//   null,
//   async (ctx, { flowDynamic }) => {
//     try {
//       const usuario = await Usuario.obtenerPorTelefono(ctx.from);

//       if (!usuario) {
//         await flowDynamic(crearMensajeError("usuario_no_registrado"));
//         return;
//       }

//       const pedidosActivos = await Pedido.obtenerPedidosActivos(usuario.id);

//       if (pedidosActivos.length === 0) {
//         await flowDynamic(
//           "📦 No tienes pedidos activos en este momento.\n\n" +
//             "✨ ¿Te gustaría ver todos tus pedidos? Escribe *mis pedidos*\n" +
//             "🛍️ ¿O prefieres ver nuestros productos? Escribe *productos*"
//         );
//       } else {
//         let mensaje = `🔄 *Pedidos Activos (${pedidosActivos.length}):*\n\n`;

//         pedidosActivos.forEach((pedido, index) => {
//           mensaje += `*${index + 1}.* Pedido #${pedido.id}\n`;
//           mensaje += `   📅 ${formatearFecha(pedido.order_date)}\n`;
//           mensaje += `   💰 ${formatearMoneda(pedido.total)}\n`;
//           mensaje += `   📋 ⏳ PENDIENTE\n\n`;
//         });

//         mensaje +=
//           "💡 Escribe el *número del pedido* para ver detalles completos\n";
//         mensaje += "📞 ¿Necesitas hacer cambios? Escribe *contacto*";

//         await flowDynamic(mensaje);
//       }

//       await Conversacion.guardar(
//         ctx.from,
//         ctx.body,
//         "Consulta de pedidos activos"
//       );
//     } catch (error) {
//       console.error("❌ Error en flowPedidosActivos:", error);
//       await flowDynamic(config.mensajes.errores.conexionBD);
//     }
//   }
// );

// // Flujo de ayuda y comandos
// const flowAyuda = addKeyword(config.comandos.ayuda).addAnswer(
//   crearListaComandos(),
//   null,
//   async (ctx, { flowDynamic }) => {
//     try {
//       const infoEmpresa = config.obtenerInfoEmpresa();
//       const mensajeAdicional = `\n📞 *¿Necesitas ayuda personal?*\n${infoEmpresa.contacto}`;

//       await flowDynamic(mensajeAdicional);
//       await Conversacion.guardar(
//         ctx.from,
//         ctx.body,
//         "Ayuda y comandos consultados"
//       );
//     } catch (error) {
//       console.error("❌ Error en flowAyuda:", error);
//     }
//   }
// );

// // Flujo para estadísticas (opcional, para administradores)
// const flowEstadisticas = addKeyword([
//   "stats",
//   "estadisticas",
//   "admin123",
// ]).addAnswer(
//   crearMensajeCargando("estadísticas del sistema"),
//   null,
//   async (ctx, { flowDynamic }) => {
//     try {
//       const usuario = await Usuario.obtenerPorTelefono(ctx.from);

//       // Verificar si es administrador (opcional)
//       if (!usuario || usuario.user_type !== "admin") {
//         await flowDynamic("🚫 Acceso restringido.");
//         return;
//       }

//       const stats = await Pedido.obtenerEstadisticas();

//       let mensaje = `📊 *Estadísticas del Sistema*\n\n`;
//       mensaje += `👥 Usuarios registrados: *${stats.totalUsuarios}*\n`;
//       mensaje += `📦 Total pedidos: *${stats.totalPedidos}*\n`;
//       mensaje += `⏳ Pedidos pendientes: *${stats.pedidosPendientes}*\n`;
//       mensaje += `✅ Pedidos entregados: *${stats.pedidosEntregados}*\n`;
//       mensaje += `❌ Pedidos cancelados: *${stats.pedidosCancelados || 0}*\n`;
//       mensaje += `💰 Ventas totales: *${formatearMoneda(
//         stats.ventasTotales
//       )}*\n`;
//       mensaje += `💬 Conversaciones: *${stats.totalConversaciones}*\n\n`;
//       mensaje += `📈 Promedio por pedido: *${formatearMoneda(
//         stats.ventasTotales / (stats.pedidosEntregados || 1)
//       )}*`;

//       await flowDynamic(mensaje);
//       await Conversacion.guardar(
//         ctx.from,
//         ctx.body,
//         "Estadísticas consultadas"
//       );
//     } catch (error) {
//       console.error("❌ Error en estadísticas:", error);
//       await flowDynamic(config.mensajes.errores.conexionBD);
//     }
//   }
// );

// // Flujo para mensajes no reconocidos
// const flowNoReconocido = addKeyword("*").addAnswer(
//   null,
//   null,
//   async (ctx, { flowDynamic }) => {
//     try {
//       // Analizar el comando
//       const comandoParsed = parsearComando(ctx.body);

//       if (comandoParsed.esNumeroPedido) {
//         // Si es un número, redirigir al flujo de detalle
//         return;
//       }

//       let respuesta = config.mensajes.ayuda.noEntendido;

//       // Sugerir comandos similares basado en palabras clave
//       const texto = ctx.body.toLowerCase();
//       if (
//         texto.includes("pedido") ||
//         texto.includes("orden") ||
//         texto.includes("compra")
//       ) {
//         respuesta += "\n\n💡 ¿Quizás buscabas *mis pedidos*?";
//       } else if (
//         texto.includes("producto") ||
//         texto.includes("catalogo") ||
//         texto.includes("precio")
//       ) {
//         respuesta += "\n\n💡 ¿Quizás buscabas *productos*?";
//       } else if (
//         texto.includes("contacto") ||
//         texto.includes("telefono") ||
//         texto.includes("ayuda")
//       ) {
//         respuesta += "\n\n💡 ¿Quizás buscabas *contacto*?";
//       }

//       await flowDynamic(respuesta);
//       await Conversacion.guardar(ctx.from, ctx.body, "Comando no reconocido");
//     } catch (error) {
//       console.error("❌ Error en flowNoReconocido:", error);
//     }
//   }
// );

// // Función principal
// const main = async () => {
//   try {
//     console.log("🔗 Probando conexión a la base de datos...");
//     const dbConnected = await testConnection();

//     if (!dbConnected) {
//       console.error("❌ No se pudo conectar a la base de datos. Saliendo...");
//       process.exit(1);
//     }

//     console.log("✅ Conexión a base de datos establecida");
//     console.log(`🏢 Empresa: ${config.empresa.nombre}`);
//     console.log(`📞 Contacto: ${config.empresa.telefono}`);
//     console.log(`⏰ Horario: ${config.empresa.horario}`);

//     const adapterDB = new MockAdapter();
//     const adapterFlow = createFlow([
//       flowPrincipal,
//       flowMisPedidos,
//       flowDetallePedido,
//       flowEstadoPedido,
//       flowProductos,
//       flowContacto,
//       flowPedidosActivos,
//       flowAyuda,
//       flowEstadisticas,
//       flowNoReconocido,
//     ]);
//     const adapterProvider = createProvider(BaileysProvider);

//     createBot({
//       flow: adapterFlow,
//       provider: adapterProvider,
//       database: adapterDB,
//     });

//     console.log(`🌐 Iniciando portal web en puerto ${config.bot.qrPort}`);
//     QRPortalWeb({ port: config.bot.qrPort });

//     console.log("🚀 Bot de WhatsApp iniciado correctamente!");
//     console.log("📱 Escanea el código QR para conectar WhatsApp");
//   } catch (error) {
//     console.error("❌ Error crítico al iniciar la aplicación:", error);
//     process.exit(1);
//   }
// };

// // Manejo de errores globales
// process.on("unhandledRejection", (reason, promise) => {
//   console.error("❌ Unhandled Rejection at:", promise, "reason:", reason);
// });

// process.on("uncaughtException", (error) => {
//   console.error("❌ Uncaught Exception:", error);
//   process.exit(1);
// });

// // Manejo de señales del sistema
// process.on("SIGINT", () => {
//   console.log("🛑 Recibida señal SIGINT. Cerrando aplicación...");
//   process.exit(0);
// });

// process.on("SIGTERM", () => {
//   console.log("🛑 Recibida señal SIGTERM. Cerrando aplicación...");
//   process.exit(0);
// });

// // Ejecutar aplicación
// main().catch((error) => {
//   console.error("❌ Error fatal al iniciar:", error);
//   process.exit(1);
// });

const express = require("express");
const cors = require("cors");

// Bot WhatsApp imports
const {
  createBot,
  createProvider,
  createFlow,
  addKeyword,
  EVENTS,
} = require("@bot-whatsapp/bot");
const QRPortalWeb = require("@bot-whatsapp/portal");
const BaileysProvider = require("@bot-whatsapp/provider/baileys");
const MockAdapter = require("@bot-whatsapp/database/mock");

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

// Variables de entorno para Heroku
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
const flowPrincipal = addKeyword(config.comandos.saludo)
  .addAnswer(
    config.mensajes.bienvenida.principal,
    null,
    async (ctx, { flowDynamic }) => {
      try {
        await Usuario.crear(ctx.from, ctx.pushName);
        // await Usuario.actualizarUltimoLogin(ctx.from);

        const horario = validarHorarioAtencion();
        let mensajeBienvenida = config.mensajes.bienvenida.opciones;
        if (!horario.estaAbierto) {
          mensajeBienvenida += `\n\n${horario.mensaje}`;
        }

        await flowDynamic(mensajeBienvenida);
        await Conversacion.guardar(
          ctx.from,
          ctx.body,
          config.mensajes.bienvenida.principal
        );

        console.log(`✅ Usuario conectado: ${ctx.from} - ${ctx.pushName}`);
      } catch (error) {
        console.error("❌ Error en flowPrincipal:", error);
        await flowDynamic(config.mensajes.errores.errorGenerico);
      }
    }
  )
  .addAnswer(config.mensajes.bienvenida.opciones, {
    buttons: [
      { body: "🛒 Mis Pedidos" },
      { body: "📋 Nuevo Pedido" },
      { body: "📞 Contacto" },
    ],
  });

// Flujo para consultar pedidos del usuario
const flowMisPedidos = addKeyword([
  "mis pedidos",
  "pedidos",
  "🛒 Mis Pedidos",
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

        mensaje += "💡 Escribe el *número del pedido* para ver detalles\n";
        mensaje += "📞 Escribe *contacto* si necesitas ayuda";

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
const flowDetallePedido = addKeyword(".*").addAnswer(
  crearMensajeCargando("detalles del pedido"),
  null,
  async (ctx, { flowDynamic }) => {
    console.log(`⚡️ Flow Detalle Pedido activado con: "${ctx.body}"`);
    try {
      const texto = (ctx.body || "").toString();
      if (!/^\s*\d+\s*$/.test(texto)) return;
      const numeroPedido = parseInt(ctx.body);
      const usuario = await Usuario.obtenerPorTelefono(ctx.from);

      if (!usuario) {
        await flowDynamic(crearMensajeError("usuario_no_registrado"));
        return;
      }

      const pedido = await Pedido.obtenerDetalle(numeroPedido, usuario.id);

      if (!pedido) {
        await flowDynamic(
          crearMensajeError(
            "pedido_no_encontrado",
            "Verifica el número de pedido o escribe *mis pedidos* para ver todos."
          )
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
      mensaje += `📞 Teléfono: ${pedido.customer_phone || "No especificado"}\n`;
      mensaje += `🚚 Entrega: ${
        pedido.delivery_method === "delivery"
          ? "A domicilio"
          : "Retiro en tienda"
      }\n`;

      if (pedido.delivery_address) {
        mensaje += `📍 Dirección: ${pedido.delivery_address}\n`;
      }

      mensaje += `💳 Pago: ${
        pedido.payment_method === "cash"
          ? "Efectivo"
          : pedido.payment_method === "card"
          ? "Tarjeta"
          : "Online"
      }\n\n`;

      if (items.length > 0) {
        mensaje += `🛍️ *Productos (${items.length}):*\n`;
        let subtotal = 0;

        items.forEach((item, index) => {
          mensaje += `${index + 1}. ${item.name}\n`;
          mensaje += `   💰 ${formatearMoneda(item.product_price)} x ${
            item.quantity
          } = ${formatearMoneda(item.line_total)}\n`;
          subtotal += parseFloat(item.line_total);
        });
      }

      mensaje += `\n💰 *Total: ${formatearMoneda(pedido.total)}*\n\n`;
      mensaje += `📞 ¿Necesitas modificar algo? Escribe *contacto*`;

      await flowDynamic(mensaje);
      await Conversacion.guardar(
        ctx.from,
        ctx.body,
        `Detalles del pedido #${numeroPedido} consultados`
      );
    } catch (error) {
      console.error("❌ Error en flowDetallePedido:", error);
      await flowDynamic(config.mensajes.errores.conexionBD);
    }
  }
);

// Flujo para consultar estado específico de pedido
const flowEstadoPedido = addKeyword(config.comandos.estado).addAnswer(
  "🔍 Escribe el número de tu pedido para consultar su estado:",
  null,
  async (ctx, { flowDynamic }) => {
    await Conversacion.guardar(
      ctx.from,
      ctx.body,
      "Solicitud de estado de pedido"
    );
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

      let mensaje = `🛍️ *Catálogo de Productos:*\n\n`;

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

// Función principal del bot
const initBot = async () => {
  try {
    console.log("🔗 Probando conexión a la base de datos...");
    const dbConnected = await testConnection();

    if (!dbConnected) {
      console.error("❌ No se pudo conectar a la base de datos");
      // En Heroku, no salir inmediatamente para permitir troubleshooting
      console.log("⚠️ Continuando sin base de datos para diagnóstico...");
    } else {
      console.log("✅ Conexión a base de datos establecida");
    }

    console.log(`🏢 Empresa: ${config.empresa.nombre}`);
    console.log(`📞 Contacto: ${config.empresa.telefono}`);
    console.log(`⏰ Horario: ${config.empresa.horario}`);

    const adapterDB = new MockAdapter();
    // const adapterDB = new MySQLAdapter(config.database);
    const adapterFlow = createFlow([
      flowPrincipal,
      flowMisPedidos,
      flowDetallePedido,
      flowEstadoPedido,
      flowProductos,
      flowContacto,
      flowPedidosActivos,
      flowAyuda,
      flowEstadisticas,
      flowNoReconocido,
    ]);
    const adapterProvider = createProvider(BaileysProvider);

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
