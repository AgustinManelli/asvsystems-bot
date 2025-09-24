const { pool } = require("../database");

class Usuario {
  static async crear(telefono, nombre = null) {
    try {
      const [result] = await pool.execute(
        "INSERT IGNORE INTO users (telephone, first_name) VALUES (?, ?)",
        [telefono, nombre]
      );
      return result;
    } catch (error) {
      console.error("Error creando usuario:", error);
      throw error;
    }
  }

  static async obtenerPorTelefono(telefono) {
    try {
      const [rows] = await pool.execute(
        "SELECT * FROM users WHERE telephone = ?",
        [telefono]
      );
      return rows[0];
    } catch (error) {
      console.error("Error obteniendo usuario:", error);
      throw error;
    }
  }

  static async actualizarEstado(telefono, estado) {
    try {
      const [result] = await pool.execute(
        "UPDATE users SET state = ? WHERE telephone = ?",
        [estado, telefono]
      );
      return result;
    } catch (error) {
      console.error("Error actualizando estado:", error);
      throw error;
    }
  }
}

module.exports = Usuario;
