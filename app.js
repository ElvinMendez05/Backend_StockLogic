//Load ENV Config
import './config/loadEnv.js';

import express from "express";
import cors from "cors";
import { setupSwagger } from "./swagger.js";
import { v4 as guidV4 } from 'uuid';
import multer from 'multer';
import path from 'path';
import { projectRoot } from './helpers/Path.js'

//Route importations
import authRoutes from "./routes/auth.routes.js"
import categoriesRoutes from "./routes/categories.routes.js"
import productsRoutes from "./routes/products.routes.js"
import providersRoutes from "./routes/providers.routes.js"
import usersRoutes from './routes/users.routes.js'
import rolesRoutes from'./routes/roles.routes.js'
import salesRoutes from './routes/sales.routes.js'

const app = express();

// Middlewares
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

//Web browser accesible directories
app.use('/api', express.static(path.join(projectRoot, 'public')));

//Set up swagger
setupSwagger(app);

//Set up image uploads
const onlyImageFilter = (req, file, cb) => {
  if (file.mimetype == "image/png" || file.mimetype == "image/jpeg" || file.mimetype == "image/jpg") {
    cb(null, true);
  } else {
    cb(new Error("Invalid file type. Only PNG, JPEG and JPG files area allowed."), false)
  }
};

//Set up multer for file uploads
const imageStorageForProductsImages = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(
      null,
      path.join(projectRoot, "public", "uploads", "images", "products")
    );
  },
  filename: (req, file, cb) => {
    const fileName = `${guidV4()}-${file.originalname}`;
    cb(null, fileName)
  }
})

app.use(multer({ storage: imageStorageForProductsImages, fileFilter: onlyImageFilter }).single("productImage"))

//Set up api headers
app.use(cors({
  origin: process.env.CORS_ORIGIN ? process.env.CORS_ORIGIN.split(",") : ["*"],
  methods: process.env.CORS_METHODS ? process.env.CORS_METHODS.split(",") : ["OPTIONS", "GET", "POST", "PUT", "PATCH", "DELETE"],
  allowedHeaders: process.env.CORS_ALLOWED_HEADERS ? process.env.CORS_ALLOWED_HEADERS.split(",") : ["Content-Type", "Authorization"],
}));

//Routes
app.use("/api", authRoutes);
app.use("/api", categoriesRoutes);
app.use("/api", providersRoutes);
app.use("/api", productsRoutes);
app.use("/api", salesRoutes);
app.use("/api", usersRoutes);
app.use("/api", rolesRoutes);

//Error handling middlewares
app.use((error, req, res, next) => {
  if (!error) {
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

export default app;

