const controller = require("../controllers/world.controller");
const { verifyToken } = require("../middleware/authJwt");

module.exports = function(app) {
  app.post("/api/worlds", [verifyToken], controller.createWorld);
  app.get("/api/worlds", [verifyToken], controller.getAllWorlds);
  app.get("/api/worlds/:id", [verifyToken], controller.getOneWorld);
  app.put("/api/worlds/:id", [verifyToken], controller.updateWorld);
  app.delete("/api/worlds/:id", [verifyToken], controller.deleteWorld);
  app.patch("/api/worlds/:id", [verifyToken], controller.patchWorld);
};