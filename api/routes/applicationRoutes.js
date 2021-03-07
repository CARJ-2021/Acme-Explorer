"use strict";
module.exports = function (app) {
    var applications = require("../controllers/applicationController");

    app
        .route("/v1/applications")
        .get(applications.list_all_applications)
        .post(applications.create_an_application);

    app
        .route("/v1/applications/:applicationId")
        .get(applications.read_an_application)
        .put(applications.update_an_application)
        .delete(applications.delete_an_application);
};
