require('dotenv').config();
const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');

// const authRoutes = require('./routes/authRoutes');
// const productRoutes = require('./routes/productRoutes');
// const userRoutes = require('./routes/userRoutes');
const mainRoutes = require('./routes/index');

const swaggerSpec = require('./config/swagger');
const swaggerUi = require('swagger-ui-express');


const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(cors());

// Swagger
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));


// Routes
// app.use('/auth', authRoutes);
// app.use('/products', productRoutes);
// app.use('/users', userRoutes);
app.use('/', mainRoutes); // optional if your app needs it

// Centralized Error Handler
app.use((err, req, res, next) => {
  res.status(500).json({ error: err.message });
});

// Start server
connectDB().then(() => {
  app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
});