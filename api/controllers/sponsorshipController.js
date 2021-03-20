"use strict";
/*---------------SPONSORSHIP----------------------*/
var mongoose = require("mongoose"),
  Sponsorship = mongoose.model("Sponsorship");

var authController = require("../controllers/authController");

exports.list_all_sponsorships = function (req, res) {
  Sponsorship.find({}, function (err, sponsorships) {
    if (err) {
      res.send(err);
    } else {
      res.json(sponsorships);
    }
  });
};

exports.create_an_sponsorship = function (req, res) {
  var new_sponsorship = new Sponsorship(req.body);
  new_sponsorship.save(function (err, sponsorship) {
    if (err) {
      res.send(err);
    } else {
      res.json(sponsorship);
    }
  });
};

exports.read_an_sponsorship = function (req, res) {
  Sponsorship.findById(req.params.sponsorshipId, function (err, sponsorship) {
    if (err) {
      res.send(err);
    } else {
      res.json(sponsorship);
    }
  });
};

exports.update_an_sponsorship = function (req, res) {
  Sponsorship.findOneAndUpdate(
    { _id: req.params.sponsorshipId },
    req.body,
    { new: true },
    function (err, sponsorship) {
      if (err) {
        res.send(err);
      } else {
        res.json(sponsorship);
      }
    }
  );
};

exports.delete_an_sponsorship = function (req, res) {
  Sponsorship.deleteOne(
    { _id: req.params.sponsorshipId },
    function (err, sponsorship) {
      if (err) {
        res.send(err);
      } else {
        res.json({ message: "Sponsorship successfully deleted" });
      }
    }
  );
};

exports.list_all_sponsorships_v2 = async function (req, res) {
  var idToken = req.headers["idtoken"];
  var authenticatedUserId = await authController.getUserId(idToken);
  Sponsorship.find(
    { sponsor: authenticatedUserId },
    function (err, sponsorships) {
      if (err) {
        res.send(err);
      } else {
        res.json(sponsorships);
      }
    }
  );
};

exports.create_a_sponsorship_v2 = async function (req, res) {
  var idToken = req.headers["idtoken"];
  var authenticatedUserId = await authController.getUserId(idToken);
  var new_sponsorship = new Sponsorship(req.body);
  new_sponsorship.sponsor = authenticatedUserId;
  new_sponsorship.paid = false;
  new_sponsorship.save(function (err, sponsorship) {
    if (err) {
      res.send(err);
    } else {
      res.json(sponsorship);
    }
  });
};

exports.read_a_sponsorship_v2 = async function (req, res) {
  var idToken = req.headers["idtoken"];
  var authenticatedUserId = await authController.getUserId(idToken);
  Sponsorship.findById(
    req.params.sponsorshipId,
    async function (err, sponsorship) {
      if (err) {
        res.send(err);
      } else if (
        JSON.stringify(sponsorship.sponsor) !=
        JSON.stringify(authenticatedUserId)
      )
        res
          .status(403)
          .send("You don't have permissions to read this sponsorship");
      else {
        res.json(sponsorship);
      }
    }
  );
};

exports.update_a_sponsorship_v2 = async function (req, res) {
  var idToken = req.headers["idtoken"];
  var authenticatedUserId = await authController.getUserId(idToken);
  Sponsorship.findById(req.params.sponsorshipId, function (error, sponshp) {
    if (error) res.send(err);
    else if (sponshp == null) res.status(404).send("Sponsorship not found");
    else if (
      JSON.stringify(sponshp.sponsor) != JSON.stringify(authenticatedUserId)
    )
      res
        .status(401)
        .send("Only the creator can update his or her sponsorship");
    else {
      Sponsorship.findOneAndUpdate(
        { _id: req.params.sponsorshipId },
        req.body,
        { new: true },
        function (err, sponsorship) {
          if (err) {
            res.send(err);
          } else {
            res.json(sponsorship);
          }
        }
      );
    }
  });
};

exports.delete_a_sponsorship_v2 = async function (req, res) {
  var idToken = req.headers["idtoken"];
  var authenticatedUserId = await authController.getUserId(idToken);
  Sponsorship.findById(req.params.sponsorshipId, function (error, sponshp) {
    if (error) res.send(err);
    else if (sponshp == null) res.status(404).send("Sponsorship not found");
    else if (
      JSON.stringify(sponshp.sponsor) != JSON.stringify(authenticatedUserId)
    )
      res
        .status(401)
        .send("Only the creator can delete his or her sponsorship");
    else {
      Sponsorship.remove(
        { _id: req.params.sponsorshipId },
        function (err, sponsorship) {
          if (err) {
            res.send(err);
          } else {
            res.json({ message: "Sponsorship successfully deleted" });
          }
        }
      );
    }
  });
};
