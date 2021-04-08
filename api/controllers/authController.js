"use strict";
/*---------------ACTOR Auth----------------------*/
var mongoose = require("mongoose"),
  Actor = mongoose.model("Actors");
var admin = require("firebase-admin");

exports.getUserId = async function (idToken) {
  var id = null;

  var actorFromFB = await admin.auth().verifyIdToken(idToken);

  var uid = actorFromFB.uid;

  var mongoActor = await Actor.findOne({ email: uid });
  if (!mongoActor) {
    return null;
  } else {
    id = mongoActor._id;
    return id;
  }
};

exports.verifyUser = function (requiredRoles) {
  return function (req, res, callback) {
    var idToken = req.headers["idtoken"];

    admin
      .auth()
      .verifyIdToken(idToken)
      .then(function (decodedToken) {

        var uid = decodedToken.uid;
        var auth_time = decodedToken.auth_time;
        var exp = decodedToken.exp;


        Actor.findOne({ email: uid }, function (err, actor) {
          if (err) {
            res.send(err);
          }

          // No actor found with that email as username
          else if (!actor) {
            res.status(401); //an access token isn’t provided, or is invalid
            res.json({
              message: "No actor found with the provided email as username",
              error: err,
            });
          } else {

            var isAuth = false;
            for (var i = 0; i < requiredRoles.length; i++) {
              for (var j = 0; j < actor.role.length; j++) {
                if (requiredRoles[i] == actor.role[j]) {
                  isAuth = true;
                }
              }
            }
            if (isAuth) return callback(null, actor);
            else {
              res.status(403); //an access token is valid, but requires more privileges
              res.json({
                message: "The actor has not the required roles",
                error: err,
              });
            }
          }
        });
      })
      .catch(function (err) {
        // Handle error
        console.log("Error en autenticación: " + err);
        res.status(403); //an access token is valid, but requires more privileges
        res.json({
          message: "The actor has not the required roles",
          error: err,
        });
      });
  };
};
