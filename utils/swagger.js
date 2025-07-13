const swaggerJsdoc = require("swagger-jsdoc");

const options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "E-Commerce API",
      version: "1.0.0",
      description: "A comprehensive e-commerce API with advanced features",
      contact: {
        name: "API Support",
        email: "support@ecommerce.com",
      },
      license: {
        name: "MIT",
        url: "https://opensource.org/licenses/MIT",
      },
    },
    servers: [
      {
        url: "http://localhost:8000",
        description: "Development server",
      },
      {
        url: "https://api.ecommerce.com",
        description: "Production server",
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
      schemas: {
        Product: {
          type: "object",
          properties: {
            id: { type: "number" },
            name: { type: "string" },
            image: {
              type: "object",
              properties: {
                public_id: { type: "string" },
                url: { type: "string" },
              },
            },
            category: {
              type: "string",
              enum: ["men", "women", "kids", "accessories"],
            },
            new_price: { type: "number" },
            old_price: { type: "number" },
            available: { type: "boolean" },
            date: { type: "string", format: "date-time" },
          },
        },
        User: {
          type: "object",
          properties: {
            name: { type: "string" },
            email: { type: "string", format: "email" },
            cartData: { type: "object" },
            date: { type: "string", format: "date-time" },
          },
        },
        Order: {
          type: "object",
          properties: {
            user: { type: "string" },
            items: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  product: { type: "string" },
                  quantity: { type: "number" },
                  price: { type: "number" },
                },
              },
            },
            totalAmount: { type: "number" },
            status: {
              type: "string",
              enum: [
                "pending",
                "processing",
                "shipped",
                "delivered",
                "cancelled",
              ],
            },
            shippingAddress: {
              type: "object",
              properties: {
                street: { type: "string" },
                city: { type: "string" },
                state: { type: "string" },
                zipCode: { type: "string" },
                country: { type: "string" },
              },
            },
            paymentMethod: {
              type: "string",
              enum: ["stripe", "paypal", "cash_on_delivery"],
            },
            paymentStatus: {
              type: "string",
              enum: ["pending", "completed", "failed", "refunded"],
            },
          },
        },
        Error: {
          type: "object",
          properties: {
            success: { type: "boolean" },
            error: {
              type: "object",
              properties: {
                message: { type: "string" },
              },
            },
          },
        },
      },
    },
    security: [
      {
        bearerAuth: [],
      },
    ],
  },
  apis: ["./routes/*.js", "./controllers/*.js"],
};

const specs = swaggerJsdoc(options);

module.exports = specs;
