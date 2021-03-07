"use strict";
/*---------------SPONSORSHIP----------------------*/
var mongoose = require("mongoose"),
    Sponsorship = mongoose.model("Sponsorship");

exports.list_all_sponsorships = function (req, res) {
    Sponsorship.find({}, function (err, sponsorships) {
        if (err) {
            res.send(err);
        } else {
            res.json(sponsorships);
        }
    });
};

exports.create_an_sponsorship = function (req, res) {
    var new_sponsorship = new Sponsorship(req.body);
    new_sponsorship.save(function (err, sponsorship) {
        if (err) {
            res.send(err);
        } else {
            res.json(sponsorship);
        }
    });
};

exports.read_an_sponsorship = function (req, res) {
    Sponsorship.findById(req.params.sponsorshipId, function (err, sponsorship) {
        if (err) {
            res.send(err);
        } else {
            res.json(sponsorship);
        }
    });
};

exports.update_an_sponsorship = function (req, res) {
    Sponsorship.findOneAndUpdate(
        { _id: req.params.sponsorshipId },
        req.body,
        { new: true },
        function (err, sponsorship) {
            if (err) {
                res.send(err);
            } else {
                res.json(sponsorship);
            }
        }
    );
};

exports.delete_an_sponsorship = function (req, res) {
    Sponsorship.deleteOne({ _id: req.params.sponsorshipId }, function (err, sponsorship) {
        if (err) {
            res.send(err);
        } else {
            res.json({ message: "Sponsorship successfully deleted" });
        }
    });
};