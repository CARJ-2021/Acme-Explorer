'use strict';

var mongoose = require('mongoose'),
  Trip = mongoose.model('Trips');

exports.listAllTrips = function(req, res) {
  Trip.find(function(err, trips) {
    if (err){
      res.send(err);
    }
    else{
      res.json(trips);
    }
  });
};


exports.createTrip = function(req, res) {
  var newTrip = new Trip(req.body);
  newTrip.save(function(err, trip) {
    if (err){
      res.send(err);
    }
    else{
      res.json(trip);
    }
  });
};


exports.readTrip = function(req, res) {
    Trip.findById(req.params.tripId, function(err, trip) {
      if (err){
        res.send(err);
      }
      else{
        res.json(trip);
      }
    });
};


exports.updateTrip = function(req, res) {
    Trip.findOneAndUpdate({_id: req.params.tripId}, req.body, {new: true}, function(err, trip) {
      if (err){
        res.send(err);
      }
      else{
        res.json(trip);
      }
    });
};

exports.deleteTrip = function(req, res) {
    Trip.remove({_id: req.params.tripId}, function(err, trip) {
        if (err){
            res.send(err);
        }
        else{
            res.json({ message: 'Trip successfully deleted' });
        }
    });
};
