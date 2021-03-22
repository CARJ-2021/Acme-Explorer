"use strict";
var mongoose = require("mongoose");
var Schema = mongoose.Schema;

var FinderSchema = new Schema(
  {
    keyword: {
      type: String,
    },
    minPrice: {
      type: Number,
      min: 0
    },
    maxPrice: {
      type: Number,
      min: 0,
      validate: [
        priceChecker,
        'The minimum price must be lower than the maximum price'
      ]
    },
    minDate: {
      type: Date,
    },
    maxDate: {
      type: Date,
      validate: [
        dateChecker,
        'Minimum date must be lower than Maximum date'
      ]
    },
    explorer: {
      type: Schema.Types.ObjectId,
      required: "explorer id is required",
      ref: 'Actors'
    },
    trips: [
      {
        type: Schema.Types.ObjectId,
        ref: 'Trips'
      },
    ],
    expirationDate: {
      type: Date,
    }
  },
  { strict: false }
);

FinderSchema.index({explorer: 1});

function priceChecker(value) {
  return this.maxPrice == null || this.minPrice <= value;
}

function dateChecker(value) {
  return this.maxDate == null || this.minDate <= value;
}

module.exports = mongoose.model("Finder", FinderSchema);
