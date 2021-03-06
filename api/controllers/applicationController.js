"use strict";
/*---------------APPLICATION----------------------*/
var mongoose = require("mongoose"),
  Application = mongoose.model("Application"),
  Trip = mongoose.model("Trips"),
  Actor = mongoose.model("Actors");
const { auth, app } = require("firebase-admin");
var authController = require("./authController");

exports.list_all_applications = function (req, res) {
  Application.find({}, function (err, applications) {
    if (err) {
      res.send(err);
    } else {
      res.json(applications);
    }
  });
};

//Return all application from an specific Trip
exports.list_all_applications_v2 = function (req, res) {
  var idToken = req.headers["idtoken"];
  authController.getUserId(idToken).then((authenticatedUserId) => {
    Trip.findById(req.params.tripId, function (err, trip) {
      if (err) {
        res.send(err);
      } else if (
        JSON.stringify(authenticatedUserId) != JSON.stringify(trip.manager)
      ) {
        res.status(401).send("You must be the trip manager");
      } else {
        Application.find(
          { trip: req.params.tripId },
          function (err, applications) {
            if (err) {
              res.send(err);
            } else {
              res.json(applications);
            }
          }
        );
      }
    });
  });
};

//List all application from manager's all trips
const list_all_applications_all_trips = async function (req, res) {
  var idToken = req.headers["idtoken"];
  var authenticatedUserId = await authController.getUserId(idToken);
  Trip.find({ manager: authenticatedUserId }, function (error, trips) {
    var tripsIds = [];
    for (var i = 0; i < trips.length; i++) {
      tripsIds.push(trips[i]._id);
    }
    Application.find({ trip: { $in: tripsIds } }, function (err, applications) {
      if (err) {
        res.send(err);
      } else {
        res.json(applications);
      }
    });
  });
};

//List explorer applications
exports.list_my_applications = async function (req, res) {
  var idToken = req.headers["idtoken"];
  var authenticatedUserId = await authController.getUserId(idToken);
  var actor = await Actor.findById(authenticatedUserId);
  if (actor.role.includes("MANAGER")) {
    list_all_applications_all_trips(req, res)
  } else {
    Application.find(
      { explorer: authenticatedUserId },
      function (err, applications) {
        if (err) {
          res.send(err);
        } else {
          res.json(applications);
        }
      }
    );
  }
};

exports.create_an_application = function (req, res) {
  var new_application = new Application(req.body);
  new_application.status = "PENDING";
  new_application.save(function (err, application) {
    if (err) {
      res.send(err);
    } else {
      res.json(application);
    }
  });
};

exports.create_an_application_v2 = async function (req, res) {
  var idToken = req.headers["idtoken"];
  var authenticatedUserId = await authController.getUserId(idToken);

  Trip.findById(req.params.tripId, async function (err, trip) {
    if (err) {
      res.status(500).send(err);
    } else if (!trip || !trip.published) {
      res.status(404).send({ message: "Trip not found" });
    } else if (trip.rejectReason) {
      res.status(409).send({ message: "Can't apply for a canceled Trip" });
    } else {
      var application = await Application.find({
        explorer: authenticatedUserId,
        trip: req.params.tripId,
      });
      if (application.length == 0) {
        var new_application = new Application();
        new_application.comments = req.body.comment;
        new_application.status = "PENDING";
        new_application.trip = req.params.tripId;
        new_application.explorer = authenticatedUserId;
        new_application.date = new Date();
        new_application.save(function (err, appl) {
          if (err) {
            res.send(err);
          } else {
            res.json(appl);
          }
        });
      } else {
        console.log("pero que?");
        res.status(409).send({ message: "You already applied for this trip" });
      }
    }
  });
};

exports.read_an_application = function (req, res) {
  Application.findById(req.params.applicationId, function (err, application) {
    if (err) {
      res.send(err);
    } else {
      res.json(application);
    }
  });
};

exports.read_an_application_v2 = async function (req, res) {
  var idToken = req.headers["idtoken"];
  var authenticatedUserId = await authController.getUserId(idToken);
  Application.findById(req.params.applicationId, function (err, application) {
    if (err) {
      res.send(err);
    } else if (application == null) {
      res.status(404);
      res.send("Application does not exist");
    } else if (
      JSON.stringify(application.explorer) ==
      JSON.stringify(authenticatedUserId)
    ) {
      res.send(application);
    } else {
      Trip.find({ manager: authenticatedUserId }, function (error, trips) {
        if (err) {
          res.send(err);
        } else if (trips == null || trips.length == 0) {
          res.status(404).send("User cannot read application");
        } else {
          res.send(application);
        }
      });
    }
  });
};

exports.update_an_application = function (req, res) {
  Application.findOneAndUpdate(
    { _id: req.params.applicationId },
    req.body,
    { new: true },
    function (err, application) {
      if (err) {
        res.send(err);
      } else {
        res.json(application);
      }
    }
  );
};

exports.update_an_application_v2 = async function (req, res) {
  var idToken = req.headers["idtoken"];
  var authenticatedUserId = await authController.getUserId(idToken);
  Application.findById(req.params.applicationId, function (err, application) {
    if (application != null) {
      if (
        req.body.status.toLowerCase() == "reject" &&
        req.body.rejectReason == undefined
      ) {
        res.status(400);
        res.send("If status is Reject then there must be a reject reason");
      }
    }
    if (err) {
      res.send(err);
    } else if (application == null) {
      res.status(404);
      res.send("Application does not exist");
    } else if (
      JSON.stringify(application.explorer) ==
      JSON.stringify(authenticatedUserId)
    ) {
      Application.findOneAndUpdate(
        { _id: req.params.applicationId },
        req.body,
        { new: true },
        function (err, application) {
          if (err) {
            res.send(err);
          } else {
            res.json(application);
          }
        }
      );
    } else {
      Trip.find({ manager: authenticatedUserId }, function (error, trips) {
        if (err) {
          res.send(err);
        } else if (trips == null || trips.length == 0) {
          res.status(404).send("User cannot read application");
        } else {
          Application.findOneAndUpdate(
            { _id: req.params.applicationId },
            req.body,
            { new: true },
            function (err, application) {
              if (err) {
                res.send(err);
              } else {
                res.json(application);
              }
            }
          );
        }
      });
    }
  });
};

exports.delete_an_application = function (req, res) {
  Application.deleteOne(
    { _id: req.params.applicationId },
    function (err, application) {
      if (err) {
        res.send(err);
      } else {
        res.json({ message: "Application successfully deleted" });
      }
    }
  );
};

exports.delete_an_application_v2 = async function (req, res) {
  var idToken = req.headers["idtoken"];
  var authenticatedUserId = await authController.getUserId(idToken);
  Application.findById(req.params.applicationId, function (err, application) {
    if (err) {
      res.send(err);
    } else if (application == null) {
      res.status(404);
      res.send("Application does not exist");
    } else if (
      JSON.stringify(application.explorer) ==
      JSON.stringify(authenticatedUserId)
    ) {
      Application.remove(
        { _id: req.params.applicationId },
        function (err, application) {
          if (err) {
            res.send(err);
          } else {
            res.json({ message: "Application successfully deleted" });
          }
        }
      );
    } else {
      Trip.find({ manager: authenticatedUserId }, function (error, trips) {
        if (err) {
          res.send(err);
        } else if (trips == null || trips.length == 0) {
          res.status(404).send("User cannot read application");
        } else {
          Application.remove(
            { _id: req.params.applicationId },
            function (err, application) {
              if (err) {
                res.send(err);
              } else {
                res.json({ message: "Application successfully deleted" });
              }
            }
          );
        }
      });
    }
  });
};

exports.cancel_an_application = async function (req, res) {
  var idToken = req.headers["idtoken"];
  var authenticatedUserId = await authController.getUserId(idToken);
  Application.findById(req.params.applicationId, async function (err, application) {
    if (err) {
      res.send(err);
    } else if (application == null) {
      res.status(404).send("Application not found");
    } else if (
      application.status == "PENDING" ||
      application.status == "ACCEPTED"
    ) {
      if (
        JSON.stringify(authenticatedUserId) !=
        JSON.stringify(application.explorer)
      ) {
        res.status(403).send("Only the explorer that made the application can cancel it");
      } else {
        Application.findOneAndUpdate(
          { _id: req.params.applicationId },
          { $set: { status: "CANCELLED" } },
          { new: true },
          function (err, actor) {
            if (err) {
              res.send(err);
            } else {
              res.json({
                message: "Application has been cancelled successfully",
              });
            }
          }
        );
      }
    } else {
      res.send({
        message:
          "Applcation can't be payed due to is in " +
          application.status.toLowerCase() +
          " status",
      });
    }
  });
};

exports.reject_an_application = async function (req, res) {
  var idToken = req.headers["idtoken"];
  var authenticatedUserId = await authController.getUserId(idToken);
  Application.findById(req.params.applicationId, async function (err, application) {
    if (err) {
      res.send(err);
    } else if (application == null) {
      res.status(404).send("Application not found");
    } else if (application.status == "PENDING") {
      var trip = await Trip.findById(application.trip);
      if (
        JSON.stringify(authenticatedUserId) !=
        JSON.stringify(trip.manager)
      ) {
        res.status(403).send("Only the trip manager can modify applications");
      } else {
        if (req.body.reason == undefined || req.body.reason == "") {
          return res.status(403).send({message: "Enter a reason"});
        }
      
        Application.findOneAndUpdate(
          { _id: application._id },
          { $set: { status: "REJECT", rejectReason: req.body.reason } },
          { new: true },
          function (err, application) {
            if (err) {
              res.send(err);
            } else {
              res.json(application);
            }
          }
        );
      }
    } else {
      res.status(401).send({
        message:
          "Applcation can't be payed due to is in " +
          application.status.toLowerCase() +
          " status",
      });
    }
  });
};

exports.due_an_application = async function (req, res) {
  var idToken = req.headers["idtoken"];
  var authenticatedUserId = await authController.getUserId(idToken);
  Application.findById(
    req.params.applicationId,
    async function (err, application) {
      if (err) {
        res.send(err);
      } else if (application == null) {
        res.status(404).send("Application not found");
      } else if (application.status == "PENDING") {
        var trip = await Trip.findById(application.trip);
        if (
          JSON.stringify(authenticatedUserId) != JSON.stringify(trip.manager)
        ) {
          res.status(403).send("Only the trip manager can modify applications");
        } else {
          Application.findOneAndUpdate(
            { _id: req.params.applicationId },
            { status: "DUE" },
            { new: true },
            function (err, updatedApplication) {
              if (err) {
                res.status(500).send(err);
              } else {
                res.send({message: "updatedApplication"});
              }
            }
          );
        }
      } else {
        res.status(403).send({
          message:
            "Applcation can't be payed due to is in " +
            application.status.toLowerCase() +
            " status",
        });
      }
    }
  );
};

exports.pay_an_application = async function (req, res) {
  var idToken = req.headers["idtoken"];
  var authenticatedUserId = await authController.getUserId(idToken);
  Application.findById(req.params.applicationId, function (err, application) {
    if (err) {
      res.send(err);
    } else if (application == null) {
      res.status(404).send("Application not found");
    } else if (application.status == "DUE") {
      if (
        JSON.stringify(authenticatedUserId) !=
        JSON.stringify(application.explorer)
      ) {
        res.status(403).send({
          message: "Only the application explorer can modify that application",
        });
      } else {
        Application.findOneAndUpdate(
          { _id: req.params.applicationId },
          { $set: { status: "ACCEPTED" } },
          { new: true },
          function (err, application) {
            if (err) {
              res.send(err);
            } else {
              res.json(application);
            }
          }
        );
      }
    } else {
      res.send({
        message:
          "Applcation can't be payed due to is in " +
          application.status.toLowerCase() +
          " status",
      });
    }
  });
};
