const swaggerAutogen = require("swagger-autogen")();

const doc = {
    info: {
        title: "E-Commerce Backend API",
        description: "An API to perform CRUD operations to an E-Commerce MongoDB database."
    },
    host: "localhost:3000", //change when deploying to Render
    schemes: ["http", "https"]
}

const outputFile = "../swagger.json";
const endpointFiles = ["./routes/index.js"];

swaggerAutogen(outputFile, endpointFiles, doc);