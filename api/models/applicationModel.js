"use strict";
var mongoose = require("mongoose");
var Schema = mongoose.Schema;

var ApplicationSchema = new Schema(
  {
    date: {
      type: Date,
      required: "Kindly enter the date of the Application",
    },
    status: {
      type: String,
      required: "Kindly enter the application status",
      enum: ["PENDING", "REJECT", "DUE", "ACCEPTED", "CANCELLED"],
    },
    comments: {
      type: String
    },
    rejectReason: {
      type: String
    },
    trip: {
      type: Schema.Types.ObjectId,
      required: "Trip id is required",
      ref: 'Trips'
    },
    explorer: {
      type: Schema.Types.ObjectId,
      required: "Explorer id is required",
      ref: 'Actors'
    },
  },
  { strict: false }
);

ApplicationSchema.index({date: 1});
ApplicationSchema.index({trip: 1})
ApplicationSchema.index({explorer: 1});
ApplicationSchema.index({explorer: 1, status: 'text'});

module.exports = mongoose.model("Application", ApplicationSchema);
