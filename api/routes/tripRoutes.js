'use strict';

module.exports = function(app) {
    var trips = require('../controllers/tripController');
  
    app.route('/trips')
          .get(trips.listAllTrips)
          .post(trips.createTrip);
  
    app.route('/trips/:tripId')
      .get(trips.readTrip)
        .put(trips.updateTrip)
      .delete(trips.deleteTrip);
  };