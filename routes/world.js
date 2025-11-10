const express = require('express');
const router = express.Router();
const controller = require("../controllers/world.controller");
const { verifyToken } = require("../middleware/authJwt");

router.post("/", [verifyToken], controller.createWorld);
router.get("/", [verifyToken], controller.getAllWorlds);
router.get("/:id", [verifyToken], controller.getOneWorld);
router.get("/:id/content", [verifyToken], controller.getWorldContent);
router.put("/:id", [verifyToken], controller.updateWorld);
router.delete("/:id", [verifyToken], controller.deleteWorld);
router.patch("/:id", [verifyToken], controller.patchWorld);

module.exports = router;