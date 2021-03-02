"use strict";
var mongoose = require("mongoose");
var Schema = mongoose.Schema;

var ConfigurationSchema = new Schema(
  {
    //In hours
    finderTime: {
      type: Number,
      required: "Kindly enter the finder time",
      default: 1,
      max: 24,
    },
    findResult: {
      type: Number,
      default: 10,
      max: 100,
      required: "Kindly enter the finder's result number",
    },
  },
  { strict: false }
);

module.exports = mongoose.model("Configuration", ConfigurationSchema);
