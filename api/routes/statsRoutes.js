"use strict";

const MANAGER = "MANAGER";
const ADMINISTRATOR = "ADMINISTRATOR";

module.exports = function (app) {
  var stats = require("../controllers/statsController");
  var authController = require("../controllers/authController");

  // --------------- V1 ---------------

  app
    .route("/v3/stats")
    //.get(authController.verifyUser([ADMINISTRATOR]), stats.getStats);
    .get(stats.getStats);


};
