"use strict";
module.exports = function (app) {
    var configuration = require("../controllers/configurationController"),
        authController = require("../controllers/authController");


    app
        .route("/v1/configuration")
        .get(configuration.read_configuration)
        .put(configuration.update_configuration);

    app
        .route("/v2/configuration")
        .get(authController.verifyUser(["ADMINISTRATOR"]), configuration.read_configuration)
        .put(authController.verifyUser(["ADMINISTRATOR"]), configuration.update_configuration);
};
