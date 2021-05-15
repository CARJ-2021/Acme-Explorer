"use strict";
/*---------------ACTOR----------------------*/
var mongoose = require("mongoose"),
  Actor = mongoose.model("Actors");
var admin = require("firebase-admin");
var authController = require("./authController");
const bcrypt = require("bcrypt");

exports.list_all_actors = function (req, res) {
  Actor.find({}, function (err, actors) {
    if (err) {
      res.send(err);
    } else {
      res.json(actors);
    }
  });
};

exports.create_an_actor = function (req, res) {
  var new_actor = new Actor(req.body);
  //If the user us not authenticated, he or she may register as a Explorer
  new_actor.save(function (err, actor) {
    if (err) {
      res.send(err);
    } else {
      res.json(actor);
    }
  });
};

exports.create_a_manager = function (req, res) {
  var new_actor = new Actor(req.body);
  if (!new_actor.status.includes("ADMINISTRATOR"))
    res.status(400).send("Actor must be administrator");
  else {
    new_actor.save(function (err, actor) {
      if (err) {
        res.status(400).send(err);
        console.log(err);
      } else {
        res.json(actor);
      }
    });
  }
};

exports.create_an_actor_v2 = function (req, res) {
  var new_actor = new Actor(req.body);
  var idToken = req.headers["idtoken"];
  if (!new_actor.role.includes("EXPLORER")) {
    if (!idToken) {
      res.status(400).send("Actor must be administrator");
    } else {
      authController.getUserId(idToken).then((authenticatedUserId) => {
        Actor.findById(authenticatedUserId, function (error, actor) {
          if (actor.role == "ADMINISTRATOR") {
            new_actor.save(function (err, actor) {
              if (err) {
                res.status(400).send(err);
                console.log(err);
              } else {
                res.json(actor);
              }
            });
          } else {
            res.status(400).send("Actor must be administrator");
          }
        });
      });
    }
  } else {
    new_actor.save(function (err, actor) {
      if (err) {
        res.status(400).send(err);
        console.log(err);
      } else {
        res.json(actor);
      }
    });
  }
};

exports.read_an_actor = function (req, res) {
  Actor.findById(req.params.actorId, function (err, actor) {
    if (err) {
      res.send(err);
    } else {
      res.json(actor);
    }
  });
};

exports.login_an_actor = async function (req, res) {
  var emailParam = req.query.email;
  var password = req.query.password;
  Actor.findOne({ email: emailParam }, function (err, actor) {
    if (err) {
      res.send(err);
    } else if (actor.banned) {
      res.status(401).json({ message: "User has been banned"});
    }

    // No actor found with that email as username
    else if (!actor) {
      res.status(401); //an access token isn’t provided, or is invalid
      res.json({ message: "forbidden", error: err });
    } else {
      // Make sure the password is correct
      actor.verifyPassword(password, async function (err, isMatch) {
        if (err) {
          res.send(err);
        }

        // Password did not match
        else if (!isMatch) {
          //res.send(err);
          res.status(401); //an access token isn’t provided, or is invalid
          res.json({ message: "forbidden", error: err });
        } else {
          try {
            var customToken = await admin.auth().createCustomToken(actor.email);
          } catch (error) {
            console.log("Error creating custom token:", error);
          }
          actor.customToken = customToken;
          console.log("Login Success... sending JSON with custom token");
          res.json(actor);
        }
      });
    }
  });
};

exports.update_an_actor = function (req, res) {
  //Check that the user is the proper actor and if not: res.status(403); "an access token is valid, but requires more privileges"
  Actor.findOneAndUpdate(
    { _id: req.params.actorId },
    req.body,
    { new: true },
    function (err, actor) {
      if (err) {
        res.send(err);
      } else {
        res.json(actor);
      }
    }
  );
};

exports.update_a_verified_actor = function (req, res) {
  //An actor can only update
  console.log("Starting to update the actor...");
  Actor.findById(req.params.actorId, async function (err, actor) {
    if (err) {
      res.send(err);
    } else {
      var idToken = req.headers["idtoken"];
      var authenticatedUserId = await authController.getUserId(idToken);
      if (authenticatedUserId == req.params.actorId) {

        // Password changed so we need to hash it
        const salt = await bcrypt.genSalt(5)
        const hash = await bcrypt.hash(req.body.password, salt)
        req.body.password = hash
        
        Actor.findOneAndUpdate(
          { _id: req.params.actorId },
          req.body,
          { new: true, runValidators: true },
          function (err, actor) {
            if (err) {
              res.send(err);
            } else {
              res.json(actor);
            }
          }
        );
      } else {
        res.status(403); //Auth error
        res.send("The Actor is trying to update an Actor that is not himself!");
      }
    }
  });
};

exports.delete_an_actor = function (req, res) {
  Actor.deleteOne({ _id: req.params.actorId }, function (err, actor) {
    if (err) {
      res.send(err);
    } else {
      res.json({ message: "Actor successfully deleted" });
    }
  });
};

exports.delete_a_verified_actor = function (req, res) {
  var idToken = req.headers["idtoken"];
  authController.getUserId(idToken).then((authenticatedUserId) => {
    Actor.findById(req.params.actorId, function (error, actor) {
      if (error) res.send(error);
      else if (actor == null) res.status(404).send("Actor not found");
      else if (JSON.stringify(actor._id) != JSON.stringify(authenticatedUserId))
        res.status(401).send("You are not allowed to delete other actors");
      else {
        Actor.remove({ _id: req.params.actorId }, function (err, actor) {
          if (err) {
            res.send(err);
          } else {
            res.json({ message: "Actor successfully deleted" });
          }
        });
      }
    });
  });
};

exports.ban_an_actor = function (req, res) {
  Actor.findById(req.params.actorId, function (err, actor) {
    if (err) {
      res.send(err);
    } else if (actor == null) {
      res.status(404).send("That actor does not exist");
    } else {
      Actor.findOneAndUpdate(
        { _id: req.params.actorId },
        { $set: { banned: "true" } },
        { new: true },
        function (err, actor) {
          if (err) {
            res.send(err);
          } else {
            res.json({ message: "Actor has been banned successfully" });
          }
        }
      );
    }
  });
};

exports.unban_an_actor = function (req, res) {
  Actor.findById(req.params.actorId, function (err, actor) {
    if (err) {
      res.send(err);
    } else if (actor == null) {
      res.status(404).send("That actor does not exist");
    } else {
      Actor.findOneAndUpdate(
        { _id: req.params.actorId },
        { $set: { banned: "false" } },
        { new: true },
        function (err, actor) {
          if (err) {
            res.send(err);
          } else {
            res.json({ message: "Actor has been unbanned successfully" });
          }
        }
      );
    }
  });
};
