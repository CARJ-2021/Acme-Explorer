"use strict";

/*---------------STATS----------------------*/
var mongoose = require("mongoose"),
    Trip = mongoose.model("Trips"),
    Actor = mongoose.model("Actors"),
    Finder = mongoose.model("Finder");

var dateFormat = require("dateformat");
var randomstring = require("randomstring");
const actorModel = require("../models/actorModel");
var authController = require('./authController');
const configurationController = require("./configurationController");



exports.getStats = function (req, res) {
    Actor.aggregate([
        {
            $lookup: {
                from: "trips",
                localField: "_id",
                foreignField: "manager",
                as: "trips"
            }
        },
        {
            $project: {
                _id: "$_id",
                numTrips: { $size: "$trips" }
            }
        },
        {
            $group: {
                _id: null,
                avg: { $avg: "$numTrips" },
                min: { $min: "$numTrips" },
                max: { $max: "$numTrips" },
                std: { $stdDevPop: "$numTrips" }
            }
        }
    ]).exec((err, result) => {
        if (err) throw err;
        res.status(200).send(result)
    })
};


const calculateDashboardMetrics = async () => {
    return new Promise((resolve, reject) => {
        const promise1 = new Promise((resolve, reject) => {
            Actor.aggregate([{
                $lookup: {
                    from: "trips",
                    localField: "_id",
                    foreignField: "manager",
                    as: "trips"
                }
            },
            {
                $project: {
                    _id: "$_id",
                    numTrips: { $size: "$trips" }
                }
            },
            {
                $group: {
                    _id: null,
                    avg: { $avg: "$numTrips" },
                    min: { $min: "$numTrips" },
                    max: { $max: "$numTrips" },
                    std: { $stdDevPop: "$numTrips" }
                }
            }]).exec((err, result) => {
                if (err) reject(err);
                // TODO - Almacenar resultado y resolve()

                resolve();
            });
        });

        const promise2 = new Promise((resolve, reject) => {
            Trip.aggregate([
                {
                    $lookup: {
                        from: "applications",
                        localField: "_id",
                        foreignField: "trip",
                        as: "applications"
                    }
                },
                {
                    $project: {
                        _id: "$_id",
                        numApplications: { $size: "$applications" }
                    }
                },
                {
                    $group: {
                        _id: null,
                        avg: { $avg: "$numApplications" },
                        min: { $min: "$numApplications" },
                        max: { $max: "$numApplications" },
                        std: { $stdDevPop: "$numApplications" }
                    }
                }
            ]).exec((err, result) => {
                if (err) reject(err);
                // TODO - Almacenar resultado y resolve()

                resolve();
            });
        });

        Promise.all([promise1, promise2]).then(() => {
            resolve();
        });
    })
}

module.exports.calculateDashboardMetrics = calculateDashboardMetrics;