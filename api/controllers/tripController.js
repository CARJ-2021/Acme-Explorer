"use strict";

/*---------------TRIPS----------------------*/
var mongoose = require("mongoose"),
  Trip = mongoose.model("Trips");

var dateFormat = require("dateformat");
var randomstring = require("randomstring");
var authController = require('./authController');

const configurationController = require("./configurationController");

exports.list_all_trips = function (req, res) {
  Trip.find({}, function (err, trips) {
    if (err) {
      res.send(err);
    } else {
      res.json(trips);
    }
  });
};


exports.list_managed_trips = async function (req, res) {
  var idToken = req.headers['idtoken'];
  var authenticatedUserId = await authController.getUserId(idToken);
  Trip.find({ manager: authenticatedUserId }, function (err, trips) {
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

exports.read_a_trip_v2 = function (req, res) {
  Trip.findOne({ '_id': req.params.tripId, 'published': true }, function (err, trip) {
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


exports.update_a_trip_v2 = async function (req, res) {
  //A trip can be modified or deleted as long as it’s not published.
  var idToken = req.headers['idtoken'];
  var authenticatedUserId = await authController.getUserId(idToken);
  Trip.findOne({ _id: req.params.tripId, manager: authenticatedUserId }, function (err, trip) {
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

exports.publish_a_trip = async function (req, res) {
  // A manager can only publish a trip that has been created by him/her
  var idToken = req.headers['idtoken'];
	var authenticatedUserId = await authController.getUserId(idToken);
  Trip.findOne( {_id: req.params.tripId}, function (err, trip) {
    if (!trip) {
      res.status(404).send({
        message: "Trip not found"
      });
      return;
    }

    if (JSON.stringify(trip.manager) !== JSON.stringify(authenticatedUserId)) {
      res.status(403).send({
        message: "Cannot publish a trip managed by a different manager"
      });
      return;
    }

    if (err) {
      res.send(err);
    } else {
      if (!trip.published) {
        trip.published = true;
        trip.save(function (err, publishedTrip) {
          if (err) {
            res.send(err);
          } else {
            res.send(publishedTrip);
          }
        });
      } else {
        res.send({
          message: "The trip has already been published",
        });
      }
    }
  });
};

exports.create_a_trip_v2 = async function (req, res) {
  var idToken = req.headers['idtoken'];
	var authenticatedUserId = await authController.getUserId(idToken);
  let ticker = await generate_ticker();

  var new_trip = new Trip(req.body);
  new_trip.manager = authenticatedUserId;
  new_trip.ticker = ticker;

  new_trip.price = calculateTripPrice(new_trip.stages);

  try {
    let saved_trip = await new_trip.save();
    res.json(saved_trip);
  } catch (error) {
    res.send(error);
  }
};

exports.searchUnauth = async function (req, res) {
  let configuration = await configurationController.get_configuration();
  configuration = configuration[0];
  const searchParams = {};

  // Add search if keyword
  if (req.query.keyword && req.query.keyword !== '') searchParams['$text'] = { $search: req.query.keyword };

  Trip.find(searchParams)
    .sort()
    .limit(configuration?.findResult || 10)
    .exec(function (err, searchResult) {
      if (err) {
        res.send(err);
      } else {
        res.send(searchResult);
      }
    });
};


exports.searchFinder = (finderParams) => {
  return new Promise(async (resolve, reject) => {
    try {
      let configuration = await configurationController.get_configuration();
      configuration = configuration[0];
      
      // Configure search params and limits
      const searchParams = {
        price: {
          $gte: finderParams.minPrice ? finderParams.minPrice : 0,
          $lte: finderParams.maxPrice ? finderParams.maxPrice : Infinity
        },
        startDate: {
          $gte: finderParams.minDate ? finderParams.minDate : "1900-01-00:00:00.000Z",
          $lte: finderParams.maxDate ? finderParams.maxDate : "2200-01-00:00:00.000Z"
        },
        endDate: {
          $gte: finderParams.minDate ? finderParams.minDate : "1900-01-00:00:00.000Z",
          $lte: finderParams.maxDate ? finderParams.maxDate : "2200-01-00:00:00.000Z"
        }
      };

      // Add $text if keyword
      if (finderParams.keyword && finderParams.keyword !== '') { searchParams['$text'] = { $search: finderParams.keyword } };

      // Execute query
      Trip.find(searchParams)
        .sort()
        .limit(configuration?.findResult || 10)
        .exec(function (err, searchResult) {
          if (err) {
            reject(err);
          } else {
            resolve(searchResult);
          }
        });
    } catch (err) {
      console.log(err);
      reject(err);
    }
  });
};

/**
 * Receives an array of stages and calculates the price of a trip
 * 
 * @param {*} stages 
 * @returns 
 */
function calculateTripPrice(stages) {
  let tripPrice = 0;
  stages.forEach(function (item, index) {
    tripPrice += item.price;
  });

  return tripPrice;
}