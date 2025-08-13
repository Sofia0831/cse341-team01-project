const router = require("express").Router();
const swaggerUi = require("swagger-ui-express");
const swaggerDocument = require("../swagger.json");
const path = require("path");

// Serve API documentation
router.use("/", swaggerUi.serve);

// Setup Swagger UI
router.get("/", swaggerUi.setup(swaggerDocument, {
    explorer: true,
    customSiteTitle: "E-Commerce API Docs",
    customCss: '.swagger-ui .topbar { display: none }',
    customfavIcon: '/assets/favicon.ico'
}));

// Serve JSON spec
router.get("/json", (req, res) => {
    res.json(swaggerDocument);
});

module.exports = router;