// routes/platform.routes.js
const controller = require("../controllers/platform.controller.js");
const { verifyToken } = require("../middleware/authJwt");
const router = require("express").Router();

router.post("/", [verifyToken], controller.create);
router.get("/", controller.findAll); // Let anyone see the available platforms

module.exports = router;