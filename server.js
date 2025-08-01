require('dotenv').config();
const express = require('express');
const connectDB = require('./config/db');
const authRoutes = require('./routes/authRoutes');
const productRoutes = require('./routes/productRoutes');

const app = express();
app.use(express.json());

// Routes
app.use('/auth', authRoutes);
app.use('/products', productRoutes);

// Swagger
const swaggerSpec = require('./config/swagger');
const swaggerUi = require('swagger-ui-express');
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// Error handling
app.use((err, req, res, next) => {
  res.status(500).json({ error: err.message });
});



// Start server
const PORT = process.env.PORT || 3000;
connectDB().then(() => {
  app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
});