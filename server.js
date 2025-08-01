require('dotenv').config();
const express = require('express');
const connectDB = require('./config/db');

const swaggerRoute = require("./routes/swagger");


const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

// Swagger
app.use("/", swaggerRoute); 

// Routes
app.use('/', require('./routes'));

// Centralized Error Handler
app.use((err, req, res, next) => {
  res.status(500).json({ error: err.message });
});

// Start server
connectDB().then(() => {
  app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
});