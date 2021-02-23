'use strict';

var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var TripSchema = new Schema({
    name: {
      type: String,
      required: 'Kindly enter the trip name'
    }
  }, { strict: false });
  
  
  module.exports = mongoose.model('Trips', TripSchema);