"use strict";

/*---------------FINDER----------------------*/
var mongoose = require("mongoose"),
    Finder = mongoose.model("Finder"),
    tripController = require("./tripController"),
    authController = require("./authController"),
    configurationController = require("./configurationController");

exports.list_all_finders = function (req, res) {
    Finder.find({}, function (err, finders) {
        if (err) {
            res.send(err);
        } else {
            res.json(finders);
        }
    });
};

exports.create_a_finder = function (req, res) {
    var new_finder = new Finder(req.body);
    new_finder.save(function (err, finder) {
        if (err) {
            res.send(err);
        } else {
            res.json(finder);
        }
    });
};

exports.read_a_finder = function (req, res) {
    Finder.findById(req.params.finderId, function (err, finder) {
        if (err) {
            res.send(err);
        } else {
            res.json(finder);
        }
    });
};

exports.update_a_finder = function (req, res) {
    Finder.findOneAndUpdate(
        { _id: req.params.finderId },
        req.body,
        { new: true },
        function (err, finder) {
            if (err) {
                res.send(err);
            } else {
                res.json(finder);
            }
        }
    );
};

exports.delete_a_finder = function (req, res) {
    Finder.deleteOne({ _id: req.params.finderId }, function (err, finder) {
        if (err) {
            res.send(err);
        } else {
            res.json({ message: "Finder successfully deleted" });
        }
    });
};


// -------------------------------------- V2 --------------------------------------

exports.read_my_finder = async function (req, res) {
    var idToken = req.headers["idtoken"];
    var authenticatedUserId = await authController.getUserId(idToken);
    Finder.findOne(
        { explorer: authenticatedUserId }, 
        function (err, finder) {
            if (err) {
                res.send(err);
            } else {
                // Remove trips if expired and return
                finder.expirationDate < new Date() && (finder.trips = []);
                res.json(finder);
            }
        });
};


exports.find = async function (req, res) {
    const idToken = req.headers["idtoken"];
    const authenticatedUserId = await authController.getUserId(idToken);
    let configuration = await configurationController.get_configuration();
    configuration = configuration[0];

    tripController.searchFinder(req.query).then((searchResult) => {
        res.send(searchResult);
        Finder.findOneAndUpdate(
            { explorer: authenticatedUserId },
            {... req.query,
                expirationDate: new Date(Date.now() + 60 * 60 * 1000 * (configuration?.finderTime || 1)),
                trips: searchResult
            },
            { new: true },
            function (err, finder) {
                if (err) {
                    console.log(err);
                } else {
                    console.log("Finder saved for explorer", authenticatedUserId);
                }
            }
        );
    }).catch(err => {
        res.send(err);
    });    
};
