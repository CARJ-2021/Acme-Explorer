"use strict";

/*---------------STATS----------------------*/
var mongoose = require("mongoose"),
    Finder = mongoose.model("Finder");

var dateFormat = require("dateformat");
var randomstring = require("randomstring");
var authController = require('./authController');
const configurationController = require("./configurationController");



exports.getStats = function (req, res) {
    let stats = {
        finders: {
            top10keywords: [],
            averagePriceRange: {
                min: 0,
                max: 0,
            }
        }
    }

    let findersResult;
    Finder.find({}, function (err, finders) {
        if (err) {
            res.send(err);
            findersResult = []
        } else {
            findersResult = finders;
        }
    });
    let minTotal;
    let maxTotal;
    let keywordsCount = {}
    findersResult.forEach(finder=>{
        minTotal+= finder.minPrice;
        maxTotal+= finder.maxPrice;
        if (!keywordsCount[finder.keyword]){
            keywordsCount[finder.keyword] = 0;
        }
        keywordsCount[finder.keyword];
    })
    stats.finder.averagePriceRange.min = minTotal/findersResult.length;
    stats.finder.averagePriceRange.max = maxTotal/findersResult.length;
    res.status(200).send(stats)



};