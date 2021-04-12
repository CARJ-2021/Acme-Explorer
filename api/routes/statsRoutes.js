"use strict";

module.exports = function (app) {
  var stats = require("../controllers/statsController");
  var authController = require("../controllers/authController");

  // --------------- V1 ---------------

  app
    .route("/v2/stats")
    .get(authController.verifyUser(["ADMINISTRATOR"]), stats.getStats);

  app
    .route("/v2/cube")
    .get(authController.verifyUser(["ADMINISTRATOR"]), stats.getCube);

};
