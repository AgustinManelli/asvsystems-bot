const { pool } = require("../database");

class Pedido {
  /**
   * Obtener todos los pedidos de un usuario
   * @param {number} userId - ID del usuario
   * @returns {Array} Lista de pedidos
   */
  static async obtenerPorUsuario(userId) {
    try {
      const [rows] = await pool.execute(
        `SELECT id, customer_name, customer_phone, delivery_address, 
                delivery_method, payment_method, status, total, order_date
         FROM orders 
         WHERE user_id = ? AND status = 'pending'
         ORDER BY order_date DESC`,
        [userId]
      );
      return rows;
    } catch (error) {
      console.error("Error obteniendo pedidos por usuario:", error);
      throw error;
    }
  }

  /**
   * Obtener pedidos activos (pendientes) de un usuario
   * @param {number} userId - ID del usuario
   * @returns {Array} Lista de pedidos pendientes
   */
  static async obtenerPedidosActivos(userId) {
    try {
      const [rows] = await pool.execute(
        `SELECT id, customer_name, customer_phone, delivery_address, 
                delivery_method, payment_method, status, total, order_date
         FROM orders 
         WHERE user_id = ? AND status = 'pending'
         ORDER BY order_date DESC`,
        [userId]
      );
      return rows;
    } catch (error) {
      console.error("Error obteniendo pedidos activos:", error);
      throw error;
    }
  }

  /**
   * Obtener detalle específico de un pedido
   * @param {number} orderId - ID del pedido
   * @param {number} userId - ID del usuario (para verificar pertenencia)
   * @returns {Object|null} Detalle del pedido
   */
  static async obtenerDetalle(orderId, userId) {
    try {
      const [rows] = await pool.execute(
        `SELECT id, customer_name, customer_phone, delivery_address, 
                delivery_method, payment_method, status, total, order_date
         FROM orders 
         WHERE id = ? AND user_id = ?`,
        [orderId, userId]
      );
      return rows[0] || null;
    } catch (error) {
      console.error("Error obteniendo detalle del pedido:", error);
      throw error;
    }
  }

  /**
   * Obtener items/productos de un pedido específico
   * @param {number} orderId - ID del pedido
   * @returns {Array} Lista de items del pedido
   */
  static async obtenerItems(orderId) {
    try {
      const [rows] = await pool.execute(
        `SELECT oi.id, oi.product_id, oi.product_price, oi.quantity, oi.line_total,
                p.name, p.description, p.sku
         FROM order_items oi
         JOIN products p ON oi.product_id = p.id
         WHERE oi.order_id = ?
         ORDER BY oi.id`,
        [orderId]
      );
      return rows;
    } catch (error) {
      console.error("Error obteniendo items del pedido:", error);
      throw error;
    }
  }

  /**
   * Obtener productos disponibles para mostrar en el catálogo
   * @param {number} limit - Límite de productos a mostrar
   * @returns {Array} Lista de productos disponibles
   */
  static async obtenerProductosDisponibles(limit = 20) {
    try {
      const [rows] = await pool.execute(
        `SELECT id, sku, name, price, description, category, in_stock
         FROM products 
         WHERE in_stock = 1
         ORDER BY category, name
         LIMIT ?`,
        [limit]
      );
      return rows;
    } catch (error) {
      console.error("Error obteniendo productos disponibles:", error);
      throw error;
    }
  }

  /**
   * Buscar pedidos por número de teléfono
   * @param {string} telefono - Número de teléfono del cliente
   * @returns {Array} Lista de pedidos
   */
  static async buscarPorTelefono(telefono) {
    try {
      const [rows] = await pool.execute(
        `SELECT o.id, o.customer_name, o.customer_phone, o.delivery_address, 
                o.delivery_method, o.payment_method, o.status, o.total, o.order_date
         FROM orders o
         WHERE o.customer_phone = ?
         ORDER BY o.order_date DESC`,
        [telefono]
      );
      return rows;
    } catch (error) {
      console.error("Error buscando pedidos por teléfono:", error);
      throw error;
    }
  }

  /**
   * Actualizar estado de un pedido
   * @param {number} orderId - ID del pedido
   * @param {string} nuevoEstado - Nuevo estado ('pending', 'delivered', 'cancelled')
   * @returns {boolean} True si se actualizó correctamente
   */
  static async actualizarEstado(orderId, nuevoEstado) {
    try {
      const [result] = await pool.execute(
        `UPDATE orders SET status = ?, updated_at = CURRENT_TIMESTAMP 
         WHERE id = ?`,
        [nuevoEstado, orderId]
      );
      return result.affectedRows > 0;
    } catch (error) {
      console.error("Error actualizando estado del pedido:", error);
      throw error;
    }
  }

  /**
   * Obtener estadísticas generales del sistema
   * @returns {Object} Objeto con estadísticas
   */
  static async obtenerEstadisticas() {
    try {
      // Total de usuarios
      const [totalUsuarios] = await pool.execute(
        "SELECT COUNT(*) as total FROM users"
      );

      // Total de pedidos
      const [totalPedidos] = await pool.execute(
        "SELECT COUNT(*) as total FROM orders"
      );

      // Pedidos por estado
      const [estadoPedidos] = await pool.execute(
        `SELECT status, COUNT(*) as cantidad 
         FROM orders 
         GROUP BY status`
      );

      // Ventas totales
      const [ventasTotales] = await pool.execute(
        `SELECT SUM(total) as total 
         FROM orders 
         WHERE status = 'delivered'`
      );

      // Total de conversaciones
      const [totalConversaciones] = await pool.execute(
        "SELECT COUNT(*) as total FROM conversaciones"
      );

      // Procesar estadísticas de pedidos por estado
      const stats = {
        totalUsuarios: totalUsuarios[0].total,
        totalPedidos: totalPedidos[0].total,
        pedidosPendientes: 0,
        pedidosEntregados: 0,
        pedidosCancelados: 0,
        ventasTotales: ventasTotales[0].total || 0,
        totalConversaciones: totalConversaciones[0].total,
      };

      estadoPedidos.forEach((estado) => {
        if (estado.status === "pending")
          stats.pedidosPendientes = estado.cantidad;
        if (estado.status === "delivered")
          stats.pedidosEntregados = estado.cantidad;
        if (estado.status === "cancelled")
          stats.pedidosCancelados = estado.cantidad;
      });

      return stats;
    } catch (error) {
      console.error("Error obteniendo estadísticas:", error);
      throw error;
    }
  }

  /**
   * Buscar pedidos por criterios múltiples
   * @param {Object} criterios - Objeto con criterios de búsqueda
   * @returns {Array} Lista de pedidos que coinciden
   */
  static async buscarPedidos(criterios = {}) {
    try {
      let query = `
        SELECT o.id, o.customer_name, o.customer_phone, o.delivery_address, 
               o.delivery_method, o.payment_method, o.status, o.total, o.order_date,
               u.first_name, u.last_name, u.email
        FROM orders o
        LEFT JOIN users u ON o.user_id = u.id
        WHERE 1=1
      `;
      const params = [];

      if (criterios.estado) {
        query += " AND o.status = ?";
        params.push(criterios.estado);
      }

      if (criterios.fechaDesde) {
        query += " AND DATE(o.order_date) >= ?";
        params.push(criterios.fechaDesde);
      }

      if (criterios.fechaHasta) {
        query += " AND DATE(o.order_date) <= ?";
        params.push(criterios.fechaHasta);
      }

      if (criterios.cliente) {
        query += " AND o.customer_name LIKE ?";
        params.push(`%${criterios.cliente}%`);
      }

      query += " ORDER BY o.order_date DESC";

      if (criterios.limite) {
        query += " LIMIT ?";
        params.push(criterios.limite);
      }

      const [rows] = await pool.execute(query, params);
      return rows;
    } catch (error) {
      console.error("Error buscando pedidos:", error);
      throw error;
    }
  }

  /**
   * Verificar si un pedido puede ser modificado
   * @param {string} status - Estado actual del pedido
   * @returns {boolean} True si se puede modificar
   */
  static puedeModificarse(status) {
    const estadosModificables = ["pending", "processing"];
    return estadosModificables.includes(status.toLowerCase());
  }

  /**
   * Obtener resumen de ventas por período
   * @param {string} periodo - Período ('day', 'week', 'month', 'year')
   * @returns {Array} Resumen de ventas
   */
  static async obtenerResumenVentas(periodo = "month") {
    try {
      let formatoFecha;
      switch (periodo) {
        case "day":
          formatoFecha = "%Y-%m-%d";
          break;
        case "week":
          formatoFecha = "%Y-%u";
          break;
        case "year":
          formatoFecha = "%Y";
          break;
        default:
          formatoFecha = "%Y-%m";
      }

      const [rows] = await pool.execute(
        `SELECT DATE_FORMAT(order_date, ?) as periodo,
                COUNT(*) as total_pedidos,
                SUM(total) as total_ventas,
                AVG(total) as promedio_pedido
         FROM orders 
         WHERE status = 'delivered'
         GROUP BY DATE_FORMAT(order_date, ?)
         ORDER BY periodo DESC
         LIMIT 12`,
        [formatoFecha, formatoFecha]
      );
      return rows;
    } catch (error) {
      console.error("Error obteniendo resumen de ventas:", error);
      throw error;
    }
  }
}

module.exports = Pedido;
