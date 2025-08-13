const router = require("express").Router();
const swaggerUi = require("swagger-ui-express");
const swaggerDocument = require("../swagger.json");
const path = require("path");

// Serve API documentation
router.use("/api-docs", swaggerUi.serve);

// Setup Swagger UI
router.get("/api-docs", swaggerUi.setup(swaggerDocument, {
    //#swagger.tags=["Test"]
    explorer: true,
    customSiteTitle: "E-Commerce API Docs",
    customCss: '.swagger-ui .topbar { display: none }',
    customfavIcon: '/assets/favicon.ico'
}));

// Serve JSON spec
router.get("/json", (req, res) => {
    //#swagger.tags=["Test"]
    res.json(swaggerDocument);
});

module.exports = router;