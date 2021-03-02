"use strict";

var mongoose = require("mongoose");
var Schema = mongoose.Schema;

var TripSchema = new Schema(
  {
    ticker: {
      type: String,
      required: "Kindly enter the trip tricker",
    },
    name: {
      type: String,
      required: "Kindly enter the trip name",
    },
    description: {
      type: String,
      required: "Kindly enter the trip description",
    },
    price: {
      type: Number,
      required: "Kindly enter the trip price",
    },
    requirements: [
      {
        type: String,
        required: "Kindly enter the trip requirements",
      },
    ],
    startDate: {
      type: Date,
      required: "Kindly enter the trip start date",
    },
    endDate: {
      type: Date,
      required: "Kindly enter the trip end date",
    },
    maanger: {
      type: Schema.Types.ObjectId,
      required: "manager id is required",
    },
    stages: [
      {
        type: StageSchema,
        validate: (s) => Array.isArray(s) && s.length > 0,
      },
    ],
    pictures: [
      {
        type: URL,
      },
    ],
    reason: {
      type: String,
    },
  },
  { strict: false }
);

var StageSchema = new Schema(
  {
    title: {
      type: String,
      required: "Kindly enter the stage title",
    },
    description: {
      type: String,
      required: "Kindly enter the stage description",
    },
    price: {
      type: Number,
      required: "Kindly enter the stage price",
    },
  },
  { strict: false }
);

module.exports = mongoose.model("Trips", TripSchema);
