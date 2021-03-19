"use strict";

module.exports = function (app) {
  var trips = require("../controllers/tripController");
  var authController = require("../controllers/authController");

  app.route("/v1/trips").get(trips.list_all_trips).post(trips.create_a_trip);

  app
    .route("/v2/trips")
    .get(authController.verifyUser(["ADMINISTRATOR"]), trips.list_all_trips)
    .post(trips.create_a_trip);

  app
    .route("/v1/trips/:tripId")
    .get(trips.read_a_trip)
    .put(trips.update_a_trip)
    .delete(trips.delete_a_trip);

  app
    .route("/api/v1/managed-trips/")
    .get(authController.verifyUser(["MANAGER"]), trips.list_managed_trips);

  app.route("/v1/search").get(trips.search);
};
