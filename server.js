require('dotenv').config();
const express = require('express');
const connectDB = require('./config/db');
const authRoutes = require('./routes/authRoutes');
const productRoutes = require('./routes/productRoutes');
const mainRoutes = require('./routes'); // from your original

const swaggerSpec = require('./config/swagger');
const swaggerUi = require('swagger-ui-express');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

// Swagger
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// Routes
app.use('/auth', authRoutes);
app.use('/products', productRoutes);
app.use('/', mainRoutes); // optional if your app needs it

// Centralized Error Handler
app.use((err, req, res, next) => {
  res.status(500).json({ error: err.message });
});

// Start server
connectDB().then(() => {
  app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
});