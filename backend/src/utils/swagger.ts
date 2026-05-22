import swaggerJsdoc from "swagger-jsdoc";
import swaggerUi from "swagger-ui-express";
import { type Express } from "express";

const options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "DentEase PH API",
      version: "3.0.0",
      description: "Enterprise Dental ERP API Documentation",
      contact: {
        name: "Antigravity Engineering",
      },
    },
    servers: [
      {
        url: "/api",
        description: "API Gateway",
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: "http",
          scheme: "bearer",
          bearerFormat: "JWT",
        },
      },
    },
    security: [
      {
        bearerAuth: [],
      },
    ],
  },
  apis: ["./src/routes/*.ts", "./src/controllers/*.ts"],
};

const swaggerSpec = swaggerJsdoc(options);

export function setupSwagger(app: Express) {
  app.use("/docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));
  console.info("[docs] Swagger documentation available at /docs");
}
