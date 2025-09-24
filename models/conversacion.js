// const { pool } = require("../database");

// class Conversacion {
//   static async guardar(telefono, mensaje, respuesta) {
//     try {
//       // Primero obtenemos el ID del usuario
//       const [userRows] = await pool.execute(
//         "SELECT id FROM users WHERE telephone = ?",
//         [telefono]
//       );

//       if (userRows.length === 0) {
//         throw new Error("Usuario no encontrado");
//       }

//       const usuarioId = userRows[0].id;

//       const [result] = await pool.execute(
//         "INSERT INTO conversaciones (usuario_id, mensaje, respuesta) VALUES (?, ?, ?)",
//         [usuarioId, mensaje, respuesta]
//       );

//       return result;
//     } catch (error) {
//       console.error("Error guardando conversación:", error);
//       throw error;
//     }
//   }

//   static async obtenerHistorial(telefono, limit = 10) {
//     try {
//       const [rows] = await pool.execute(
//         `
//                 SELECT c.*, u.telefono, u.nombre
//                 FROM conversaciones c
//                 JOIN usuarios u ON c.usuario_id = u.id
//                 WHERE u.telefono = ?
//                 ORDER BY c.timestamp DESC
//                 LIMIT ?
//             `,
//         [telefono, limit]
//       );

//       return rows;
//     } catch (error) {
//       console.error("Error obteniendo historial:", error);
//       throw error;
//     }
//   }
// }

// module.exports = Conversacion;

const { pool } = require("../database");

class Conversacion {
  /**
   * Guardar una conversación en la base de datos
   * @param {string} telefono - Número de teléfono del usuario
   * @param {string} mensaje - Mensaje enviado por el usuario
   * @param {string} respuesta - Respuesta del bot
   * @returns {Object} Resultado de la operación
   */
  static async guardar(telefono, mensaje, respuesta) {
    try {
      // Primero obtenemos el ID del usuario
      const [userRows] = await pool.execute(
        "SELECT id FROM users WHERE telephone = ? LIMIT 1",
        [telefono]
      );

      if (userRows.length === 0) {
        // Si no existe el usuario, lo creamos
        console.log("Usuario no encontrado, creando nuevo usuario...");
        const Usuario = require("./usuario");
        await Usuario.crear(telefono, "Usuario WhatsApp");

        // Volvemos a buscar el usuario
        const [newUserRows] = await pool.execute(
          "SELECT id FROM users WHERE telephone = ? LIMIT 1",
          [telefono]
        );

        if (newUserRows.length === 0) {
          throw new Error("No se pudo crear o encontrar el usuario");
        }

        const usuarioId = newUserRows[0].id;
        return await this.insertarConversacion(usuarioId, mensaje, respuesta);
      }

      const usuarioId = userRows[0].id;
      return await this.insertarConversacion(usuarioId, mensaje, respuesta);
    } catch (error) {
      console.error("Error guardando conversación:", error);
      throw error;
    }
  }

  /**
   * Insertar conversación en la base de datos
   * @param {number} usuarioId - ID del usuario
   * @param {string} mensaje - Mensaje del usuario
   * @param {string} respuesta - Respuesta del bot
   * @returns {Object} Resultado de la inserción
   */
  static async insertarConversacion(usuarioId, mensaje, respuesta) {
    try {
      const [result] = await pool.execute(
        "INSERT INTO conversaciones (usuario_id, mensaje, respuesta, timestamp) VALUES (?, ?, ?, CURRENT_TIMESTAMP)",
        [usuarioId, mensaje, respuesta]
      );
      return result;
    } catch (error) {
      console.error("Error insertando conversación:", error);
      throw error;
    }
  }

  /**
   * Obtener historial de conversaciones de un usuario
   * @param {string} telefono - Número de teléfono del usuario
   * @param {number} limit - Límite de conversaciones a obtener
   * @returns {Array} Historial de conversaciones
   */
  static async obtenerHistorial(telefono, limit = 10) {
    try {
      const [rows] = await pool.execute(
        `SELECT c.id, c.mensaje, c.respuesta, c.timestamp,
                u.first_name, u.last_name, u.telephone
         FROM conversaciones c
         JOIN users u ON c.usuario_id = u.id
         WHERE u.telephone = ?
         ORDER BY c.timestamp DESC
         LIMIT ?`,
        [telefono, limit]
      );
      return rows;
    } catch (error) {
      console.error("Error obteniendo historial:", error);
      throw error;
    }
  }

  /**
   * Obtener conversaciones recientes del sistema
   * @param {number} limit - Límite de conversaciones
   * @returns {Array} Conversaciones recientes
   */
  static async obtenerRecientes(limit = 50) {
    try {
      const [rows] = await pool.execute(
        `SELECT c.id, c.mensaje, c.respuesta, c.timestamp,
                u.first_name, u.last_name, u.telephone
         FROM conversaciones c
         JOIN users u ON c.usuario_id = u.id
         ORDER BY c.timestamp DESC
         LIMIT ?`,
        [limit]
      );
      return rows;
    } catch (error) {
      console.error("Error obteniendo conversaciones recientes:", error);
      throw error;
    }
  }

  /**
   * Buscar conversaciones por criterios
   * @param {Object} criterios - Criterios de búsqueda
   * @returns {Array} Conversaciones que coinciden
   */
  static async buscar(criterios = {}) {
    try {
      let query = `
        SELECT c.id, c.mensaje, c.respuesta, c.timestamp,
               u.first_name, u.last_name, u.telephone
        FROM conversaciones c
        JOIN users u ON c.usuario_id = u.id
        WHERE 1=1
      `;
      const params = [];

      if (criterios.telefono) {
        query += " AND u.telephone LIKE ?";
        params.push(`%${criterios.telefono}%`);
      }

      if (criterios.mensaje) {
        query += " AND c.mensaje LIKE ?";
        params.push(`%${criterios.mensaje}%`);
      }

      if (criterios.fechaDesde) {
        query += " AND DATE(c.timestamp) >= ?";
        params.push(criterios.fechaDesde);
      }

      if (criterios.fechaHasta) {
        query += " AND DATE(c.timestamp) <= ?";
        params.push(criterios.fechaHasta);
      }

      if (criterios.usuario) {
        query += " AND (u.first_name LIKE ? OR u.last_name LIKE ?)";
        params.push(`%${criterios.usuario}%`, `%${criterios.usuario}%`);
      }

      query += " ORDER BY c.timestamp DESC";

      if (criterios.limite) {
        query += " LIMIT ?";
        params.push(criterios.limite);
      }

      const [rows] = await pool.execute(query, params);
      return rows;
    } catch (error) {
      console.error("Error buscando conversaciones:", error);
      throw error;
    }
  }

  /**
   * Obtener estadísticas de conversaciones
   * @returns {Object} Estadísticas de conversaciones
   */
  static async obtenerEstadisticas() {
    try {
      // Total de conversaciones
      const [totalConversaciones] = await pool.execute(
        "SELECT COUNT(*) as total FROM conversaciones"
      );

      // Conversaciones hoy
      const [conversacionesHoy] = await pool.execute(
        "SELECT COUNT(*) as total FROM conversaciones WHERE DATE(timestamp) = CURDATE()"
      );

      // Conversaciones esta semana
      const [conversacionesSemana] = await pool.execute(
        "SELECT COUNT(*) as total FROM conversaciones WHERE timestamp >= DATE_SUB(NOW(), INTERVAL 7 DAY)"
      );

      // Usuarios únicos que han interactuado
      const [usuariosUnicos] = await pool.execute(
        "SELECT COUNT(DISTINCT usuario_id) as total FROM conversaciones"
      );

      // Conversaciones por día (últimos 7 días)
      const [conversacionesPorDia] = await pool.execute(
        `SELECT DATE(timestamp) as fecha, COUNT(*) as cantidad
         FROM conversaciones 
         WHERE timestamp >= DATE_SUB(NOW(), INTERVAL 7 DAY)
         GROUP BY DATE(timestamp)
         ORDER BY fecha DESC`
      );

      // Palabras/comandos más usados
      const [comandosPopulares] = await pool.execute(
        `SELECT mensaje, COUNT(*) as frecuencia
         FROM conversaciones 
         WHERE mensaje IS NOT NULL AND mensaje != ''
         GROUP BY mensaje
         ORDER BY frecuencia DESC
         LIMIT 10`
      );

      return {
        totalConversaciones: totalConversaciones[0].total,
        conversacionesHoy: conversacionesHoy[0].total,
        conversacionesSemana: conversacionesSemana[0].total,
        usuariosUnicos: usuariosUnicos[0].total,
        conversacionesPorDia: conversacionesPorDia,
        comandosPopulares: comandosPopulares,
        promedioConversacionesPorUsuario:
          usuariosUnicos[0].total > 0
            ? Math.round(totalConversaciones[0].total / usuariosUnicos[0].total)
            : 0,
      };
    } catch (error) {
      console.error("Error obteniendo estadísticas de conversaciones:", error);
      throw error;
    }
  }

  /**
   * Eliminar conversaciones antiguas
   * @param {number} dias - Días de antigüedad para eliminar
   * @returns {boolean} True si se eliminaron conversaciones
   */
  static async limpiarAntiguas(dias = 30) {
    try {
      const [result] = await pool.execute(
        "DELETE FROM conversaciones WHERE timestamp < DATE_SUB(NOW(), INTERVAL ? DAY)",
        [dias]
      );

      console.log(
        `Se eliminaron ${result.affectedRows} conversaciones antigas`
      );
      return result.affectedRows > 0;
    } catch (error) {
      console.error("Error eliminando conversaciones antiguas:", error);
      throw error;
    }
  }

  /**
   * Obtener conversaciones de un usuario específico por ID
   * @param {number} usuarioId - ID del usuario
   * @param {number} limit - Límite de conversaciones
   * @returns {Array} Conversaciones del usuario
   */
  static async obtenerPorUsuario(usuarioId, limit = 20) {
    try {
      const [rows] = await pool.execute(
        `SELECT id, mensaje, respuesta, timestamp
         FROM conversaciones
         WHERE usuario_id = ?
         ORDER BY timestamp DESC
         LIMIT ?`,
        [usuarioId, limit]
      );
      return rows;
    } catch (error) {
      console.error("Error obteniendo conversaciones por usuario:", error);
      throw error;
    }
  }

  /**
   * Contar conversaciones por período
   * @param {string} periodo - Período ('day', 'week', 'month')
   * @returns {Array} Conteo por período
   */
  static async contarPorPeriodo(periodo = "day") {
    try {
      let formatoFecha;
      let intervalo;

      switch (periodo) {
        case "hour":
          formatoFecha = "%Y-%m-%d %H:00:00";
          intervalo = "24 HOUR";
          break;
        case "week":
          formatoFecha = "%Y-%u";
          intervalo = "8 WEEK";
          break;
        case "month":
          formatoFecha = "%Y-%m";
          intervalo = "12 MONTH";
          break;
        default:
          formatoFecha = "%Y-%m-%d";
          intervalo = "30 DAY";
      }

      const [rows] = await pool.execute(
        `SELECT DATE_FORMAT(timestamp, ?) as periodo, COUNT(*) as cantidad
         FROM conversaciones
         WHERE timestamp >= DATE_SUB(NOW(), INTERVAL ${intervalo})
         GROUP BY DATE_FORMAT(timestamp, ?)
         ORDER BY periodo DESC`,
        [formatoFecha, formatoFecha]
      );

      return rows;
    } catch (error) {
      console.error("Error contando conversaciones por período:", error);
      throw error;
    }
  }
}

module.exports = Conversacion;
