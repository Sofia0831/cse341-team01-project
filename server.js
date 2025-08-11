require('dotenv').config();
const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');

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
app.use('/', mainRoutes);

// Centralized Error Handler
app.use((err, req, res, next) => {
  res.status(500).json({ error: err.message });
});

// Start server
connectDB().then(() => {
  app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
});