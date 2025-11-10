// routes/diagnostic.routes.js
const controller = require("../controllers/diagnostic.controller.js");
const { verifyToken } = require("../middleware/authJwt");
const router = require("express").Router();

// Only authenticated users can see diagnostics
router.get("/", [verifyToken], controller.findAll);

module.exports = router;