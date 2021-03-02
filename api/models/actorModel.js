"use strict";
var mongoose = require("mongoose");
var Schema = mongoose.Schema;

var ActorSchema = new Schema(
  {
    name: {
      type: String,
      required: "Kindly enter the actor name",
    },
    surname: {
      type: String,
      required: "Kindly enter the actor surname",
    },
    email: {
      type: String,
      required: "Kindly enter the actor email",
      validate: (e) =>
        /(?:[a-z0-9!#$%&'+/=?^_`{|}~-]+(?:.[a-z0-9!#$%&'+/=?^_`{|}~-]+)|"(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21\x23-\x5b\x5d-\x7f]|\[\x01-\x09\x0b\x0c\x0e-\x7f])")@(?:(?:[a-z0-9](?:[a-z0-9-][a-z0-9])?.)+[a-z0-9](?:[a-z0-9-][a-z0-9])?|[(?:(?:(2(5[0-5]|[0-4][0-9])|1[0-9][0-9]|[1-9]?[0-9])).){3}(?:(2(5[0-5]|[0-4][0-9])|1[0-9][0-9]|[1-9]?[0-9])|[a-z0-9-]*[a-z0-9]:(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21-\x5a\x53-\x7f]|\[\x01-\x09\x0b\x0c\x0e-\x7f])+)])/.test(
          e
        ),
    },
    password: {
      type: String,
      minlength: 5,
      required: "Kindly enter the actor password",
    },
    preferredLanguage: {
      type: String,
      default: "en",
    },
    phone: {
      type: String,
      required: "Kindly enter the phone number",
    },
    address: {
      type: String,
      required: "Kindly enter the address",
    },
    role: [
      {
        type: String,
        required: "Kindly enter the user role(s)",
        enum: ["SPONSOR", "EXPLORER", "MANAGER", "ADMINISTRATOR"],
      },
    ],
    banned: {
      type: Boolean,
      default: false,
    },
    created: {
      type: Date,
      default: Date.now,
    },
  },
  { strict: false }
);

module.exports = mongoose.model("Actors", ActorSchema);
