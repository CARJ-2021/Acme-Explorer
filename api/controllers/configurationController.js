"use strict";
/*---------------CONFIGURATION----------------------*/
var mongoose = require("mongoose"),
    Configuration = mongoose.model("Configuration");



exports.read_configuration = function (req, res) {
    Configuration.find({id: 'mainConfig'}, function (err, configuration) {
        if (err) {
            res.send(err);
        } else {
            res.json(configuration);
        }
    });
};

exports.update_configuration = function (req, res) {
    Configuration.findOneAndUpdate(
        { id:'mainConfig' },
        req.body,
        { new: true },
        function (err, configuration) {
            if (err) {
                res.send(err);
            } else {
                res.json(configuration);
            }
        }
    );
};

exports.get_configuration = () => {
    return new Promise((resolve, reject) => {    
        Configuration.find({id: 'mainConfig'}, function (err, configuration) {
            if (err) {
                reject(err);
            } else {
                resolve(configuration)
            }
        });
    })
};