"use strict";
var mongoose = require("mongoose");
var Schema = mongoose.Schema;

var ApplicationSchema = new Schema(
  {
    date: {
      type: Date,
      required: "Kindly enter the date of the Category",
    },
    role: [
      {
        type: String,
        required: "Kindly enter the application status",
        enum: ["PENDING", "REJECT", "DUE", "ACCEPTED", "CANCELLED"],
      },
    ],
    comments: {
      data: Buffer,
      contentType: String,
    },
    reason: {
      type: String,
    },
    trip: {
      type: Schema.Types.ObjectId,
      required: "trip id is required",
    },
    explorer: {
      type: Schema.Types.ObjectId,
      required: "explorer id is required",
    },
  },
  { strict: false }
);

module.exports = mongoose.model("Application", ApplicationSchema);
