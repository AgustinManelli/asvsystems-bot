const mysql = require("mysql2/promise");
require("dotenv").config();

const dbConfig = {
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  connectionLimit: 10,
  acquireTimeout: 60000,
  timeout: 60000,
};

const pool = mysql.createPool(dbConfig);

// Función para probar la conexión
async function testConnection() {
  try {
    const connection = await pool.getConnection();
    console.log("✅ Conexión a la base de datos establecida");
    connection.release();
    return true;
  } catch (error) {
    console.error("❌ Error conectando a la base de datos:", error);
    return false;
  }
}

module.exports = { pool, testConnection };
