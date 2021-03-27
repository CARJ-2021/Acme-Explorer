"use strict";
module.exports = function (app) {
  var sponsorships = require("../controllers/sponsorshipController");
  var authController = require("../controllers/authController");

  //------- V1 -------

  app
    .route("/v1/sponsorships")
    .get(sponsorships.list_all_sponsorships)
    .post(sponsorships.create_an_sponsorship);

  app
    .route("/v1/sponsorships/:sponsorshipId")
    .get(sponsorships.read_an_sponsorship)
    .put(sponsorships.update_an_sponsorship)
    .delete(sponsorships.delete_an_sponsorship);

  //------- V2 -------

  app
    .route("/v2/sponsorships")
    .get(
      authController.verifyUser(["SPONSOR"]),
      sponsorships.list_all_sponsorships_v2
    )
    .post(
      authController.verifyUser(["SPONSOR"]),
      sponsorships.create_a_sponsorship_v2
    );

  app
    .route("/v2/sponsorships/:sponsorshipId")
    .get(
      authController.verifyUser(["SPONSOR"]),
      sponsorships.read_a_sponsorship_v2
    )
    .put(
      authController.verifyUser(["SPONSOR"]),
      sponsorships.update_a_sponsorship_v2
    )
    .delete(
      authController.verifyUser(["SPONSOR"]),
      sponsorships.delete_a_sponsorship_v2
    );

  app
    .route("/v2/sponsorships/:sponsorshipId/pay/:tripId")
    .put(
      authController.verifyUser(["SPONSOR"]),
      sponsorships.pay_a_sponsorship_with_trip
    );

      
};
