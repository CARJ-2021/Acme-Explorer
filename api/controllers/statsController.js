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
const Influx = require("influx")



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
    //InfluxDB connection

    const influx = new Influx.InfluxDB({
        host: process.env["INFLUXHOST"],
        database: 'stats',
        schema: [
            {
                measurement: 'tripsPerManager',
                fields: {
                    avg: Influx.FieldType.FLOAT,
                    max: Influx.FieldType.FLOAT,
                    std: Influx.FieldType.FLOAT,
                    min: Influx.FieldType.FLOAT,
                },
                tags: [
                ]
            },
            {
                measurement: 'applicationsPerTrip',
                fields: {
                    avg: Influx.FieldType.FLOAT,
                    max: Influx.FieldType.FLOAT,
                    std: Influx.FieldType.FLOAT,
                    min: Influx.FieldType.FLOAT,
                },
                tags: [
                ]
            },
            {
                measurement: 'pricePerTrip',
                fields: {
                    avg: Influx.FieldType.FLOAT,
                    max: Influx.FieldType.FLOAT,
                    std: Influx.FieldType.FLOAT,
                    min: Influx.FieldType.FLOAT,
                },
                tags: [
                ]
            },
            {
                measurement: 'ratioByStatus',
                fields: {
                    ratio: Influx.FieldType.FLOAT,
                },
                tags: [
                    'status'
                ]
            },
            {
                measurement: 'pricePerFinder',
                fields: {
                    avgMinPrice: Influx.FieldType.FLOAT,
                    avgMaxPrice: Influx.FieldType.FLOAT
                },
                tags: [
                    
                ]
            },
            {
                measurement: 'top10Keywords',
                fields: {
                    top1: Influx.FieldType.STRING,
                    top2: Influx.FieldType.STRING,
                    top3: Influx.FieldType.STRING,
                    top4: Influx.FieldType.STRING,
                    top5: Influx.FieldType.STRING,
                    top6: Influx.FieldType.STRING,
                    top7: Influx.FieldType.STRING,
                    top8: Influx.FieldType.STRING,
                    top9: Influx.FieldType.STRING,
                    top10: Influx.FieldType.STRING,
                },
                tags: [
                ]
            }
        ]
    })
    influx.createDatabase("stats");

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
                if (result[0]) {
                    influx.writePoints([
                        {
                            measurement: 'tripsPerManager',
                            fields: { avg: result[0].avg, min: result[0].min, max: result[0].max, std: result[0].std },
                        }
                    ])
                }

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

                if (result[0]) {
                    influx.writePoints([
                        {
                            measurement: 'applicationsPerTrip',
                            fields: { avg: result[0].avg, min: result[0].min, max: result[0].max, std: result[0].std },
                        }
                    ])
                }

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
                if (result[0]) {
                    influx.writePoints([
                        {
                            measurement: 'pricePerTrip',
                            fields: { avg: result[0].avg, min: result[0].min, max: result[0].max, std: result[0].std },
                        }
                    ])
                }
                resolve();
            });
        });

        const promise4 = new Promise((resolve, reject) => {
            Application.aggregate([
                {
                    $group: {
                        _id: null,
                        count: { $sum: 1 },
                        data: { $push: "$$ROOT" }
                    }
                },
                {
                    $unwind: "$data"
                },
                {
                    $group: {
                        _id: '$data.status',
                        count: { $sum: 1 },
                        total: { $first: "$count" }
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
                if (result[0]) {
                    console.log("Query 4", result)
                    let points = [];
                    result.forEach(ratio => {
                        points.push({
                            measurement: 'ratioByStatus',
                            fields: { ratio: ratio.ratio },
                            tags: {
                                status: ratio.status
                            }
                        })
                    })
                    influx.writePoints(points);
                }
                resolve();
            });
        });

        const promise5 = new Promise((resolve, reject) => {
            Finder.aggregate([
                {
                    $group: {
                        _id: null,
                        avgMinPrice: { $avg: "$minPrice" },
                        avgMaxPrice: { $avg: "$maxPrice" }
                    }
                }
            ]).exec((err, result) => {
                if (err) reject(err);
                if (result[0]) {
                    influx.writePoints([
                        {
                            measurement: 'pricePerFinder',
                            fields: { avgMinPrice: result[0].avgMinPrice, avgMaxPrice: result[0].avgMaxPrice },
                        }
                    ])
                }
                resolve();
            });
        });

        const promise6 = new Promise((resolve, reject) => {
            Finder.aggregate([
                {
                    $group: {
                        _id: "$keyword",
                        count: { $sum: 1 }
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
                        topKeywords: { $push: "$_id" }
                    }
                }
            ]).exec((err, result) => {
                if (err) reject(err);
                console.log("Result QUERY 6", result)
                if (result[0]) {
                    influx.writePoints([
                        {
                            measurement: 'top10Keywords',
                            fields: {
                                top1: result[0].topKeywords[0] || '',
                                top2: result[0].topKeywords[1] || '',
                                top3: result[0].topKeywords[2] || '',
                                top4: result[0].topKeywords[3] || '',
                                top5: result[0].topKeywords[4] || '',
                                top6: result[0].topKeywords[5] || '',
                                top7: result[0].topKeywords[6] || '',
                                top8: result[0].topKeywords[7] || '',
                                top9: result[0].topKeywords[8] || '',
                                top10: result[0].topKeywords[9] || '',
                            },
                        }
                    ])
                }
                resolve();
            });
        });

        Promise.all([promise1, promise2, promise3, promise4, promise5, promise6]).then(() => {
            resolve();
        });
    })
}

module.exports.calculateDashboardMetrics = calculateDashboardMetrics;