
import sql from "mssql";

const dbConfig = {
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  server: process.env.DB_SERVER,
  database: process.env.DB_DATABASE, 
  port: Number(process.env.DB_PORT),
  options: {
    encrypt: false, // Para Azure SQL, si usas SQL Server local, puedes ponerlo en false
    trustServerCertificate: true, // Para desarrollo local, en producción deberías manejar esto de forma segura
  },
}

export const getConnection = async () => {
  try {
    const pool = await sql.connect(dbConfig);
    console.log("Conexión a la base de datos exitosa"); 
    return pool;
  } catch (error) {
    console.error("Error al conectar a la base de datos:", error);
    throw error;
  }
}

export {sql};