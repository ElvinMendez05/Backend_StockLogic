//Load ENV Config
import './config/loadEnv.js';

import express from "express";
import cors from "cors";
import { setupSwagger } from "./swagger.js";

//Route importations
import authRoutes from "./routes/auth.routes.js"

const app = express();

// Middlewares
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

//Set up swagger
setupSwagger(app);

//Set up api headers
app.use(cors({
  origin: process.env.CORS_ORIGIN ? process.env.CORS_ORIGIN.split(",") : ["*"],
  methods: process.env.CORS_METHODS ? process.env.CORS_METHODS.split(",") : ["OPTIONS, GET, POST, PUT, PATCH, DELETE"],
  allowedHeaders: process.env.CORS_ALLOWED_HEADERS ? process.env.CORS_ALLOWED_HEADERS.split(",") : ["Content-Type, Authorization"],
}));

//Routes
app.use("/api", authRoutes);

//Error handling middlewares
app.use((error, req, res, next) => {
  if(!error){
    return next();
  }
  const statusCode = error.statusCode || 500;
  const message = error.message || "Internal server error";
  const data = error.data || null;

  res.status(statusCode).json({
    message: message,
    data: data,
  });
});

//404

app.use((req, res) => {
  res.status(404).json({
    message: "404 Not found",
  });
});

// Swagger

 
//Prueba en conexion a la base de datos
/* app.get("/db-test", async (req, res) => {
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
 */



// Ruta de prueba
app.get("/api", (req, res) => {
  res.json({
    ok: true,
    message: "API funcionando correctamente"
  });
});

export default app; 

