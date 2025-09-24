const { testConnection } = require("./database");
const Usuario = require("./models/usuario");

async function testDB() {
  console.log("Probando conexión...");
  await testConnection();

  console.log("Probando crear usuario...");
  try {
    await Usuario.crear("+1234567890", "Usuario de prueba");
    console.log("✅ Usuario creado correctamente");
  } catch (error) {
    console.error("❌ Error:", error.message);
  }
}

testDB();
