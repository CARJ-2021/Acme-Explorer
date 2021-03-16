"use strict";

/*---------------TRIPS----------------------*/
var mongoose = require("mongoose"),
  Trip = mongoose.model("Trips");

var dateFormat = require("dateformat");
var randomstring = require("randomstring");

exports.list_all_trips = function (req, res) {
  Trip.find({}, function (err, trips) {
    if (err) {
      res.send(err);
    } else {
      res.json(trips);
    }
  });
};

const generate_ticker = () => {
  return new Promise(async (resolve, reject) => {
    var exists = true;
    while (exists) {
      var now = new Date();
      var ticker =
        dateFormat(now, "yymmdd").toString() +
        randomstring
          .generate({
            length: 4,
            charset: "alphabetic",
          })
          .toUpperCase();

      await Trip.find({ ticker: ticker }).then((trip) => {
        if (JSON.stringify(trip) == JSON.stringify([])) {
          exists = false;
        }
      });
    }
    resolve(ticker);
  });
};

exports.create_a_trip = function (req, res) {
  var new_trip = new Trip(req.body);
  //If the user is not authenticated, he or she may register as a Explorer
  generate_ticker().then((ticker) => {
    new_trip.ticker = ticker;
    new_trip.save(function (err, trip) {
      if (err) {
        res.send(err);
      } else {
        res.json(trip);
      }
    });
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
    if (err) {
      res.send(err);
    } else {
      if (!trip.published) {
        req.body.ticker = trip.ticker;
        Trip.findOneAndUpdate(
          { _id: req.params.tripId },
          req.body,
          { new: true },
          function (err, trip) {
            if (err) {
              res.send(err);
            } else {
              res.json(trip);
            }
          }
        );
      } else {
        res.send({
          message: "Trip can't be updated due it is already published",
        });
      }
    }
  });
};

exports.delete_a_trip = function (req, res) {
  //A trip can be modified or deleted as long as it’s not published.
  Trip.findById(req.params.tripId, function (err, trip) {
    if (err) {
      res.send(err);
    } else {
      if (!trip.published) {
        Trip.deleteOne({ _id: req.params.tripId }, function (err, trip) {
          if (err) {
            res.send(err);
          } else {
            res.json({ message: "Trip successfully deleted" });
          }
        });
      } else {
        res.send({
          message: "Trip can't be deleted due it is already published",
        });
      }
    }
  });
};

exports.search = function (req, res) {
  Trip.find({
    price: { $gte: req.query.minPrice, $lte: req.query.maxPrice },
    startDate: { $gte: req.query.minDate, $lte: req.query.maxDate },
    endDate: { $gte: req.query.minDate, $lte: req.query.maxDate },
    $or: [
      { ticker: { $regex: req.query.keyword } },
      { title: { $regex: req.query.keyword } },
      { description: { $regex: req.query.keyword } }
    ]
  }, function (err, searchResult) {
    if (err) {
      res.send(err);
    } else {
      res.send(searchResult);
    }
  });
};