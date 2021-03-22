"use strict";
module.exports = function (app) {
    var finders = require("../controllers/finderController"),
        authController = require("../controllers/authController");

        
    // --------------- V1 ---------------

    app
        .route("/v1/finders")
        .get(finders.list_all_finders)
        .post(finders.create_a_finder);

    app
        .route("/v1/finders/:finderId")
        .get(finders.read_a_finder)
        .put(finders.update_a_finder)
        .delete(finders.delete_a_finder);

        
    // --------------- V2 ---------------
    app.route("/v2/find")
        .get(authController.verifyUser(["EXPLORER"]), finders.find)
};
