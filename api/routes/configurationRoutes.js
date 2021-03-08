"use strict";
module.exports = function (app) {
    var configuration = require("../controllers/configurationController");


    app
        .route("/v1/configuration")
        .get(configuration.read_configuration)
        .put(configuration.update_configuration);
};
