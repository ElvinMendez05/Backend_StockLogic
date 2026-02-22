import swaggerJSDoc from "swagger-jsdoc";
import swaggerUi from "swagger-ui-express"
import path from 'path';
import {projectRoot} from "./helpers/Path.js"
import { secureHeapUsed } from "crypto";

const swaggerDefinition = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "API StockLogic",
      version: "1.0.0",
      description: "Documentación de la API con Swagger",
    },
    servers: [
      {
        url: process.env.APP_URL || "http://localhost:3000",
      },
    ],
    components: {
      securitySchemes: {
        BearerAuth: {
          type: "http",
          scheme: "bearer",
          bearerFormat: "JWT"
        }
      }
    }
  },
  apis: [ path.join(projectRoot, "./app.js"), path.join(projectRoot, "./routes/*.js")],
};

const swaggerSpec = swaggerJSDoc(swaggerDefinition);

export function setupSwagger(app){
  app.use("/swagger", swaggerUi.serve, swaggerUi.setup(swaggerSpec))
}

