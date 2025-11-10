// routes/genre.routes.js
const controller = require("../controllers/genre.controller.js");
const { verifyToken } = require("../middleware/authJwt");
const router = require("express").Router();

router.post("/", [verifyToken], controller.create);
router.get("/", controller.findAll);
router.get("/:id", controller.findOne);
router.patch("/:id", [verifyToken], controller.update);
router.delete("/:id", [verifyToken], controller.delete);

module.exports = router;