// routes/genre.routes.js
const controller = require("../controllers/genre.controller.js");
const { verifyToken } = require("../middleware/authJwt");
const router = require("express").Router();

router.post("/", [verifyToken], controller.create);
router.get("/", controller.findAll); // Let anyone see the available genres

module.exports = router;