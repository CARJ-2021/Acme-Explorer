"use strict";
var mongoose = require("mongoose");
var Schema = mongoose.Schema;

var FinderSchema = new Schema(
  {
    keyword: {
      type: Date,
    },
    minPrice: {
      type: Number,
    },
    maxPrice: {
      type: Number,
    },
    minDate: {
      type: Date,
    },
    maxDate: {
      type: Date,
    },
    explorer: {
      type: Schema.Types.ObjectId,
      required: "explorer id is required",
    },
    trips: [
      {
        type: Schema.Types.ObjectId,
      },
    ],
  },
  { strict: false }
);

module.exports = mongoose.model("Finder", FinderSchema);
