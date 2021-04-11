"use strict";

/*---------------STATS----------------------*/
var mongoose = require("mongoose"),
    Trip = mongoose.model("Trips"),
    Actor = mongoose.model("Actors"),
    Application = mongoose.model("Application"),
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
                /* {
                    "avg" : 2.5,
                    "min" : 2.0,
                    "max" : 3.0,
                    "std" : 0.5
                } */

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
                /* {
                    "_id" : null,
                    "avg" : 1.5,
                    "min" : 1,
                    "max" : 2,
                    "std" : 0.5
                } */

                resolve();
            });
        });

        const promise3 = new Promise((resolve, reject) => {
            Trip.aggregate([
                {
                    $group: {
                        _id: null,
                        avg: { $avg: "$price" },
                        min: { $min: "$price" },
                        max: { $max: "$price" },
                        std: { $stdDevPop: "$price" }
                    }
                }
            ]).exec((err, result) => {
                if (err) reject(err);
                // TODO - Almacenar resultado y resolve()
                /* {
                    "_id" : null,
                    "avg" : 128.3,
                    "min" : 45.7,
                    "max" : 458.7,
                    "std" : 165.2
                } */

                resolve();
            });
        });

        const promise4 = new Promise((resolve, reject) => {
            Application.aggregate([
                {
                    $group: {
                        _id: null,
                        count: { $sum: 1 },
                        data:{ $push: "$$ROOT" }
                    }
                },
                {
                    $unwind: "$data"
                },
                {
                    $group: {
                        _id: '$data.status',
                        count: { $sum: 1 },
                        total: { $first :"$count" }
                    }
                },
                {
                    $project: {
                        status: "$_id",
                        ratio: { $divide: ["$count", "$total"] }
                    }
                }
            ]).exec((err, result) => {
                if (err) reject(err);
                // TODO - Almacenar resultado y resolve()
                /* {
                    "_id" : "PENDING",
                    "status" : "PENDING",
                    "ratio" : 0.8
                } */

                resolve();
            });
        });

        const promise5 = new Promise((resolve, reject) => {
            Finder.aggregate([
                {
                    $group: {
                        _id: null,
                        avgMinPrice: {$avg: "$minPrice"},
                        avgMaxPrice: {$avg: "$maxPrice"}
                    }
                } 
            ]).exec((err, result) => {
                if (err) reject(err);
                // TODO - Almacenar resultado y resolve()
                /* {
                    "_id" : "PENDING",
                    "status" : "PENDING",
                    "ratio" : 0.8
                } */

                resolve();
            });
        });

        const promise6 = new Promise((resolve, reject) => {
            Finder.aggregate([
                {
                    $group: {
                        _id: "$keyword",
                        count: {$sum: 1}
                    }
                },
                {
                    $sort: {
                        count: -1
                    }
                },
                {
                    $limit: 10
                },
                {
                    $group: {
                        _id: null,
                        topKeywords: { $push: "$_id"}
                    }
                } 
            ]).exec((err, result) => {
                if (err) reject(err);
                // TODO - Almacenar resultado y resolve()
                /* {
                    "_id" : "PENDING",
                    "status" : "PENDING",
                    "ratio" : 0.8
                } */

                resolve();
            });
        });

        Promise.all([promise1, promise2, promise3, promise4, promise5, promise6]).then(() => {
            resolve();
        });
    })
}

module.exports.calculateDashboardMetrics = calculateDashboardMetrics;