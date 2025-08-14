require('dotenv').config();
const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// Basic Middleware
app.use(cors());
app.use(express.json());

// Request Logger (temporary for debugging)
//app.use((req, res, next) => {
  //console.log(`[${new Date().toISOString()}] ${req.method} ${req.path}`);
 // next();
//});

// Routes
const mainRoutes = require('./routes/index');
const { Server } = require('http');
app.use('/', mainRoutes);

// Swagger Documentation (development only)
if (process.env.NODE_ENV !== 'production') {
  const swaggerUi = require('swagger-ui-express');
  const swaggerSpec = require('./config/swagger');
  app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));
}

// Error Handling
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: err.message });
});

// Start Server
connectDB()
  .then(() => {
    app.listen(PORT, () => {
      console.log(`
        Server running on port ${PORT}
        API Docs: http://localhost:${PORT}/api-docs
        Orders Endpoint: POST http://localhost:${PORT}/orders
      `);
    });
  })
  .catch(err => {
    console.error('Database connection failed:', err);
    process.exit(1);
  });

module.exports = {app}