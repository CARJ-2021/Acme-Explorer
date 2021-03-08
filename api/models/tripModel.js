"use strict";

var mongoose = require("mongoose");
var Schema = mongoose.Schema;

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

var TripSchema = new Schema(
  {
    ticker: {
      type: String,
      required: "Kindly enter the trip tricker",
      unique: true, //Ticker must be unique
    },
    title: {
      type: String,
      required: "Kindly enter the trip title",
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
    manager: {
      type: Schema.Types.ObjectId,
      required: "manager id is required",
    },
    published: {
      type: Boolean,
      required: "Published status is required",
      default: true,
    },
    stages: [
      {
        type: StageSchema,
        validate: (s) => Array.isArray(s) && s.length > 0,
      },
    ],
    pictures: [
      {
        data: Buffer,
        contentType: String,
      },
    ],
    rejectReason: {
      type: String,
    },
  },
  { strict: false }
);

module.exports = mongoose.model("Trips", TripSchema);
