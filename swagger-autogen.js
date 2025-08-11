const swaggerAutogen = require("swagger-autogen")();

const doc = {
    info: {
        title: "E-Commerce Backend API",
        description: "An API to perform CRUD operations to an E-Commerce MongoDB database."
    },
    host: "localhost:3000", //change when deploying to Render
    // host: "cse341-team01-project.onrender.com",
    schemes: ["http", "https"]
    // schemes: ["https"]
}

const outputFile = "./swagger.json";
const endpointsFiles = [
    './routes/index.js',
]

swaggerAutogen(outputFile, endpointsFiles, doc);