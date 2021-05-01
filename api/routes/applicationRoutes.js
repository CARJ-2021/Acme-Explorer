"use strict";
module.exports = function (app) {
  var applications = require("../controllers/applicationController");
  var authController = require("../controllers/authController");

  //------- V1 -------

  app
    .route("/v1/applications")
    .get(applications.list_all_applications)
    .post(applications.create_an_application);

  app
    .route("/v1/applications/:applicationId")
    .get(applications.read_an_application)
    .put(applications.update_an_application)
    .delete(applications.delete_an_application);

  //------- V2 -------

  app
    .route("/v2/applications/cancel/:applicationId")
    .put(
      authController.verifyUser(["EXPLORER"]),
      applications.cancel_an_application
    );

  app
    .route("/v2/applications/reject/:applicationId")
    .put(
      authController.verifyUser(["MANAGER"]),
      applications.reject_an_application
    );

  app
    .route("/v2/applications/due/:applicationId")
    .put(
      authController.verifyUser(["MANAGER"]),
      applications.due_an_application
    );

  app
    .route("/v2/applications/pay/:applicationId")
    .put(
      authController.verifyUser(["EXPLORER"]),
      applications.pay_an_application
    );
  app
    .route("/v2/trips/:tripId/applications")
    .get(
      authController.verifyUser(["MANAGER"]),
      applications.list_all_applications_v2
    );

  app.route("/v2/applications")
  .get(authController.verifyUser(["EXPLORER", "MANAGER"]),
   applications.list_my_applications);

  app
    .route("/v2/applications/:applicationId")
    .get(
      authController.verifyUser(["MANAGER", "EXPLORER"]),
      applications.read_an_application_v2
    )
    .put(
      authController.verifyUser(["MANAGER", "EXPLORER"]),
      applications.update_an_application_v2
    )
    .delete(
      authController.verifyUser(["MANAGER", "EXPLORER"]),
      applications.delete_an_application_v2
    );
};
