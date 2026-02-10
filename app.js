import express from "express";
import cors from "cors";
import dotenv from "dotenv";

import swaggerUi from "swagger-ui-express";
import swaggerSpec from "./swagger.js";

import { getConnection } from "./config/db.js";

dotenv.config();

const app = express();

// Middlewares
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Swagger
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));
 
//Prueba en conexion a la base de datos
app.get("/db-test", async (req, res) => {
  try {
    const pool = await getConnection();
    const result = await pool.request().query("SELECT GETDATE() as fecha");
    res.json({
      ok: true,
      data: result.recordset,
    });
  } catch (error) {
    res.status(500).json({
      ok: false,
      message: "Error conectando a la base de datos",
    });
  }
});

// Ruta de prueba
app.get("/", (req, res) => {
  res.json({
    ok: true,
    message: "API funcionando correctamente"
  });
});

export default app; 

