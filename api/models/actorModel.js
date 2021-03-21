"use strict";
var mongoose = require("mongoose");
var Schema = mongoose.Schema;
const bcrypt = require("bcrypt");

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
      unique: true,
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
    customToken: {
      type: String,
    },
  },
  { strict: false }
);

ActorSchema.index({ banned: 1 });
ActorSchema.index({ role: "text" });

// Delete the password from the return
ActorSchema.methods.toJSON = function () {
  const user = this;
  const userObject = user.toObject();
  delete userObject.password;
  return userObject;
};

ActorSchema.pre("save", function (callback) {
  var actor = this;
  // Break out if the password hasn't changed
  if (!actor.isModified("password")) return callback();

  // Password changed so we need to hash it
  bcrypt.genSalt(5, function (err, salt) {
    if (err) return callback(err);

    bcrypt.hash(actor.password, salt, function (err, hash) {
      if (err) return callback(err);
      actor.password = hash;
      callback();
    });
  });
});

ActorSchema.methods.verifyPassword = function (password, cb) {
  bcrypt.compare(password, this.password, function (err, isMatch) {
    // console.log("verifying password in actorModel: " + password);
    if (err) return cb(err);
    console.log("isMatch: " + isMatch);
    cb(null, isMatch);
  });
};

module.exports = mongoose.model("Actors", ActorSchema);
