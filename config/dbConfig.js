import Sequelize from 'sequelize';
import { projectRoot } from '../helpers/Path.js';
import path from 'path';

let connection;

if (process.env.DB_DIALECT === "sqlite") {
    connection = new Sequelize("sqlite:db.sqlite", {
        dialect: 'sqlite',
        storage: path.join(
            projectRoot,
            process.env.DB_FOLDER,
            process.env.DB_FILENAME
        ),
    });
} else if (process.env.DB_DIALECT === "mariadb") {
    connection = new Sequelize(
        process.env.DB_DATABASE,
        process.env.DB_USER,
        process.env.DB_PASSWORD,
        {
            dialect: 'mariadb',
            host: process.env.DB_SERVER,
            port: process.env.DB_PORT ? parseInt(process.env.DB_PORT, 10) : 3306,
        }
    );
} else if (process.env.DB_DIALECT === "mssql") {
    connection = new Sequelize(
      process.env.DB_DATABASE,
      process.env.DB_USER,
      process.env.DB_PASSWORD,
      {
          host: process.env.DB_SERVER, 
          dialect: 'mssql',
          port: process.env.DB_PORT ? parseInt(process.env.DB_PORT, 10) : 1433,
            dialectOptions: {
                options: {
                    encrypt: false,
                    trustServerCertificate: true
                }
            },
            logging: false 
        }
    );
} else {
    throw new Error("Unsupported DB_DIALECT: " + process.env.DB_DIALECT);
}

export default connection;

/* OLD CODE
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

export {sql}; */