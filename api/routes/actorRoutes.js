"use strict";
module.exports = function (app) {
  var actors = require("../controllers/actorController");
  var authController = require("../controllers/authController");

  //------- V1 -------

  app
    .route("/v1/actors")
    .get(actors.list_all_actors)
    .post(actors.create_an_actor);

  app
    .route("/v1/actors/:actorId")
    .get(actors.read_an_actor)
    .put(actors.update_an_actor)
    .delete(actors.delete_an_actor);

  app
    .route("/v1/actors/ban/:actorId")
    .put(authController.verifyUser(["ADMINISTRATOR"]), actors.ban_an_actor);

  app
    .route("/v1/actors/unban/:actorId")
    .put(authController.verifyUser(["ADMINISTRATOR"]), actors.unban_an_actor);

  //------- V2 -------

  app
    .route("/v2/actors")
    .get(authController.verifyUser(["ADMINISTRATOR"]), actors.list_all_actors)
    .post(actors.create_an_actor_v2);

  app
    .route("/v2/actors/:actorId")
    .get(actors.read_an_actor)
    .put(
      authController.verifyUser([
        "ADMINISTRATOR",
        "MANAGER",
        "EXPLORER",
        "SPONSOR",
      ]),
      actors.update_a_verified_actor
    )
    .delete(
      authController.verifyUser([
        "ADMINISTRATOR",
        "MANAGER",
        "EXPLORER",
        "SPONSOR",
      ]),
      actors.delete_a_verified_actor
    );

  app
    .route("/v2/actors/ban/:actorId")
    .put(authController.verifyUser(["ADMINISTRATOR"]), actors.ban_an_actor);

  app
    .route("/v2/actors/unban/:actorId")
    .put(authController.verifyUser(["ADMINISTRATOR"]), actors.unban_an_actor);
};
