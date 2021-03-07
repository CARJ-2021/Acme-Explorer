"use strict";

var mongoose = require("mongoose");
var Schema = mongoose.Schema;

var SponsorshipSchema = new Schema(
  {
    paid: {
      type: Boolean,
      required: "Kindly enter the paid status of the sponsorship",
    },
    //Image
    banner: {
      type: String,
      required: "Kindly enter the sposorship banner",
    },
    link: {
      type: String,
      required: "Kindly enter the sponsorship link",
    },
    sponsor: {
      type: Schema.Types.ObjectId,
      required: "Sponsor id is required",
    },
  },
  { strict: false }
);

module.exports = mongoose.model("Sponsorship", SponsorshipSchema);
