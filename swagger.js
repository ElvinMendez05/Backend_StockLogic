import swaggerJSDoc from "swagger-jsdoc";

const options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "API StockLogic",
      version: "1.0.0",
      description: "Documentación de la API con Swagger",
    },
    servers: [
      {
        url: "http://localhost:3000",
      },
    ],
  },
  apis: ["./app.js"],
};

const swaggerSpec = swaggerJSDoc(options);

export default swaggerSpec;
