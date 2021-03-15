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
      required: [dateChecker, 'Start date must be lower or equal than end date']
    },
    endDate: {
      type: Date,
      required: "Kindly enter the trip end date",
    },
    manager: {
      type: Schema.Types.ObjectId,
      required: "Manager id is required",
      ref: 'Actors'
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
      type: String, // If this property is not null, then the trip is cancelled
    },
  },
  { strict: false }
);

TripSchema.index({manager: 1});
TripSchema.index({deleted: 1});
TripSchema.index({published: 1});
TripSchema.index({title: 'text', description: 'text', ticker: 'text'});
TripSchema.index({price: 1});

function dateChecker(value){
  return this.startDate <= value;
}

module.exports = mongoose.model("Trips", TripSchema);
