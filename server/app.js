const express = require("express");
const swaggerUi = require("swagger-ui-express");
const swaggerJsdoc = require("swagger-jsdoc");
const helmet = require("helmet");
const morgan = require("morgan");
const cors = require("cors");
const path = require("path"); // Add this line
const { authenticateJWT } = require("./middleware/auth");
const authRoutes = require("./routes/authRoutes");

const app = express();

// Middleware
app.use(cors({
  origin: "http://localhost:5173", // or your frontend URL
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use('/uploads', express.static(path.join(__dirname, 'uploads'), {
  setHeaders: (res, path, stat) => {
    res.set('Cross-Origin-Resource-Policy', 'cross-origin');
  }
}));

app.use(helmet());
app.use(morgan("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Swagger configuration
const swaggerOptions = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "Social Media API",
      version: "1.0.0",
      description: "API for Social Media Application",
    },
    servers: [
      {
        url: "http://localhost:3000",
        description: "Development server",
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
  apis: ["./routes/*.js", "./middleware/auth.js"],
};

const swaggerSpec = swaggerJsdoc(swaggerOptions);

// Swagger UI
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// Public routes
app.use("/api/auth", authRoutes);

// JWT Authentication middleware
app.use("/api", authenticateJWT);

// Protected routes
app.use("/api/users", require("./routes/userRoutes"));
app.use("/api/posts", require("./routes/postRoutes"));

// Basic route for testing
app.get("/", (req, res) => {
  res.json({ message: "Welcome to the Social Media API" });
});

module.exports = app;