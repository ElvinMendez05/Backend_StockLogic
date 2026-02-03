const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");

dotenv.config();

const app = express();

// Middlewares
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Ruta de prueba
app.get("/", (req, res) => {
  res.json({
    ok: true,
    message: "API funcionando correctamente"
  });
});

module.exports = app; // 👈 ESTO ES CLAVE
