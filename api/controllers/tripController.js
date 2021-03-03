"use strict";

/*---------------TRIPS----------------------*/
var mongoose = require("mongoose"),
  Trip = mongoose.model("Trips");

exports.list_all_trips = function (req, res) {
  Trip.find({}, function (err, trips) {
    if (err) {
      res.send(err);
    } else {
      res.json(trips);
    }
  });
};

exports.create_a_trip = function (req, res) {
  var new_trip = new Trip(req.body);
  //If the user us not authenticated, he or she may register as a Explorer
  new_trip.save(function (err, trip) {
    if (err) {
      res.send(err);
    } else {
      res.json(trip);
    }
  });
};

exports.read_a_trip = function (req, res) {
  Trip.findById(req.params.tripId, function (err, trip) {
    if (err) {
      res.send(err);
    } else {
      res.json(trip);
    }
  });
};

exports.update_a_trip = function (req, res) {
  //A trip can be modified or deleted as long as it’s not published.
  Trip.findById(req.params.tripId, function (err, trip) {
    if (!trip.published) {
      Trip.findOneAndUpdate(
        { _id: req.params.tripId },
        trip,
        { new: true },
        function (err, trip) {
          if (err) {
            res.send(err);
          } else {
            res.json(trip);
          }
        }
      );
    }
  });
};

exports.delete_a_trip = function (req, res) {
  //A trip can be modified or deleted as long as it’s not published.
  Trip.findById(req.params.tripId, function (err, trip) {
    if (!trip.published) {
      Trip.deleteOne({ _id: req.params.tripId }, function (err, trip) {
        if (err) {
          res.send(err);
        } else {
          res.json({ message: "Trip successfully deleted" });
        }
      });
    }
  });
};
