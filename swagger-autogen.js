const swaggerAutogen = require('swagger-autogen')();

const doc = {
  info: {
    title: 'E-Commerce API',
    description: 'API for managing e-commerce operations',
    version: '1.0.0'
  },
  // host: 'localhost:3000',
  host: "cse341-team01-project.onrender.com",
  // schemes: ['http', 'https'],
  schemes: ['https'],
  securityDefinitions: {
    BearerAuth: {
      type: 'apiKey',
      name: 'Authorization',
      in: 'header'
    }
  }
};

const outputFile = './swagger.json';
const endpointsFiles = ['./routes/index.js']; // Only point to your main routes file

swaggerAutogen(outputFile, endpointsFiles, doc);