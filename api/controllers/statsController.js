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

exports.getCube = function (req, res) {
    try {
        const query = { ...req.query };
        if (!(query.e && query.p && !query.q && !query.v || !query.e && query.p && query.q && query.v)) {
            res.status(400).send("Wrong query params. Either enter e and p or enter p, q and v.");
            return;
        }

        let startDate, endDate;

        const startType = query.p.split("-")[1][0];
        const endType = query.p[0];

        const startQuantity = query.p.split("-")[1].split(startType)[1];
        const endQuantity = query.p.split("-")[0].split(endType)[1];

        switch (startType) {
            case "D":
                startDate = new Date(Date.now() - startQuantity * 24 * 60 * 60 * 1000);
                break;
            case "M":
                startDate = new Date(new Date().setMonth(new Date().getMonth() - parseInt(startQuantity)));
                break;
            case "Y":
                startDate = new Date(new Date().setFullYear(new Date().getFullYear() - parseInt(startQuantity)));
                break;
            default:
                res.status(400).send({ error: "Wrong p. Must be either D, M or Y" });
                return;
        }

        switch (endType) {
            case "D":
                endDate = new Date(Date.now() - (endQuantity - 1) * 24 * 60 * 60 * 1000);
                break;
            case "M":
                endDate = new Date(new Date().setMonth(new Date().getMonth() - (parseInt(endQuantity) - 1)));
                break;
            case "Y":
                endDate = new Date(new Date().setFullYear(new Date().getFullYear() - (parseInt(endQuantity) - 1)));
                break;
            default:
                res.status(400).send({ error: "Wrong p. Must be either D, M or Y" });
                return;
        }

        if (query.e) { // M[e, p] - Spent money by explorer during period p
            Application.aggregate([
                {   // Matches period and explorer
                    $match: {
                        date: { $gte: startDate, $lte: endDate },
                        explorer: mongoose.Types.ObjectId(query.e)
                    }
                },
                {   // Adds trip information
                    $lookup: {
                        from: "trips",
                        localField: "trip",
                        foreignField: "_id",
                        as: "trip"
                    }
                },
                {   // Transforms trip info array into object
                    $project: {
                        explorer: "$explorer",
                        trip: { "$arrayElemAt": ["$trip", 0] }
                    }
                },
                {   // Sums all price and stores it in spentMoney for the unique explorer
                    $group: {
                        _id: null,
                        explorer: { $first: '$explorer' },
                        spentMoney: { $sum: "$trip.price" }
                    }
                }
            ]).exec((err, result) => {
                if (err) res.status(500).send({ error: err });
                res.send(result);
            });
        } else { // Explorers whose M[e, p](cube) q(comparator) v(arbitrary amount of money)
            // Obtain comparator
            let finalComparison;

            switch (query.q) {
                case "equal":
                    finalComparison = { $eq: parseInt(query.v) }
                    break;
                case "not_equal":
                    finalComparison = { $ne: parseInt(query.v) }
                    break;
                case "greater_than":
                    finalComparison = { $gt: parseInt(query.v) }
                    break;
                case "greater_than_or_equal":
                    finalComparison = { $gte: parseInt(query.v) }
                    break;
                case "smaller_than":
                    finalComparison = { $lt: parseInt(query.v) }
                    break;
                case "smaller_than_or_equal":
                    finalComparison = { $lte: parseInt(query.v) }
                    break;
                default:
                    res.status(400).send({ error: "Wrong q. Comparator value not valid. Accepted values: equal, not_equal, greater_than, greater_than_or_equal, smaller_than, smaller_than_or_equal." });
                    return;
            }

            Application.aggregate([
                {   // Matches period
                    $match: {
                        date: { $gte: startDate, $lte: endDate }
                    }
                },
                {   // Adds trip information
                    $lookup: {
                        from: "trips",
                        localField: "trip",
                        foreignField: "_id",
                        as: "trip"
                    }
                },
                {   // Transforms trip info array into object
                    $project: {
                        explorer: "$explorer",
                        trip: { "$arrayElemAt": ["$trip", 0] }
                    }
                },
                {   // Sums all price and stores it in spentMoney for each explorer
                    $group: {
                        _id: "$explorer",
                        explorer: { $first: '$explorer' },
                        spentMoney: { $sum: "$trip.price" }
                    }
                },
                {   // Returns explorers who fulfill the condition
                    $match: {
                        spentMoney: { ...finalComparison }
                    }
                }
            ]).exec((err, result) => {
                if (err) res.status(500).send({ error: err });
                res.send(result);
            });
        }
    } catch (err) {
        res.status(500).send(result);
    }
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