// routes/diagnostic.routes.js
const controller = require("../controllers/diagnostic.controller.js");
const { verifyToken } = require("../middleware/authJwt");
const router = require("express").Router();

router.post("/", [verifyToken], controller.create);
router.get("/", [verifyToken], controller.findAll);
router.get("/:id", [verifyToken], controller.findOne);
router.delete("/:id", [verifyToken], controller.delete);

module.exports = router;