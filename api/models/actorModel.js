"use strict";
var mongoose = require("mongoose");
var Schema = mongoose.Schema;

var validateEmail = function (email) {
  var re = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
  return re.test(email);
};

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
      validate: [validateEmail, "Please fill a valid email address"],
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
    },
    address: {
      type: String,
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
  },
  { strict: false }
);

// Delete the password from the return
ActorSchema.methods.toJSON = function () {
  const user = this;
  const userObject = user.toObject();
  delete userObject.password;
  return userObject;
};

module.exports = mongoose.model("Actors", ActorSchema);
