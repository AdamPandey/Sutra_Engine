// routes/game.routes.js
const controller = require("../controllers/game.controller.js");
const { verifyToken } = require("../middleware/authJwt");
const router = require("express").Router();

// All game routes are protected
router.post("/", [verifyToken], controller.create);
router.get("/", [verifyToken], controller.findAll);
router.get("/:id", [verifyToken], controller.findOne);
router.patch("/:id", [verifyToken], controller.update);
router.delete("/:id", [verifyToken], controller.delete);

module.exports = router;