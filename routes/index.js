const router = require('express').Router();

router.use("/", require("./swagger"));

router.get('/', (req, res) => {
  //#swagger.tags=["Test"]
  res.send('Hello world, this is our Team 01 project!');
});

router.use("/auth", require("./authRoutes"));
router.use("/products", require("./productRoutes"));
router.use("/users", require("./userRoutes"));
router.use("/cart", require("./cartRoutes"));

module.exports = router;