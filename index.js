var express = require("express"),
  app = express(),
  port = process.env.PORT || 8080,
  mongoose = require("mongoose"),
  Trip = require("./api/models/tripModel"),
  Actor = require("./api/models/actorModel"),
  Sponsorship = require("./api/models/sponsorshipModel"),
  Application = require("./api/models/applicationModel"),
  Finder = require("./api/models/finderModel"),
  Configuration = require("./api/models/configurationModel"),
  bodyParser = require("body-parser");

// MongoDB URI building
var mongoDBHostname = process.env.mongoDBHostname || "localhost";
var mongoDBPort = process.env.mongoDBPort || "27017";
var mongoDBName = process.env.mongoDBName || "Acme-Explorer";
var mongoDBURI =
  "mongodb://" + mongoDBHostname + ":" + mongoDBPort + "/" + mongoDBName;

console.log(mongoDBURI);
mongoose.connect(mongoDBURI, {
  reconnectTries: 10,
  reconnectInterval: 500,
  poolSize: 10, // Up to 10 sockets
  connectTimeoutMS: 10000, // Give up initial connection after 10 seconds
  socketTimeoutMS: 45000, // Close sockets after 45 seconds of inactivity
  family: 4, // skip trying IPv6
  useNewUrlParser: true,
});

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

var routesTrips = require("./api/routes/tripRoutes");
var routesActors = require("./api/routes/actorRoutes");
var routesSponsorships = require("./api/routes/sponsorshipRoutes");
var routesApplications = require("./api/routes/applicationRoutes");
var routesFinders = require("./api/routes/finderRoutes");
var routesConfiguration = require("./api/routes/configurationRoutes")

routesTrips(app);
routesActors(app);
routesSponsorships(app);
routesApplications(app);
routesFinders(app);
routesConfiguration(app);

console.log("Connecting DB to: " + mongoDBURI);
mongoose.connection.on("open", function (err, conn) {

  Configuration.exists({ id: 'mainConfig' }, function (err, exists) {
    if (err) {
      console.error('Error finding initial config', err)
    } else {
      if (!exists) {
        var new_configuration = new Configuration({
          'id': 'mainConfig'
        });
        new_configuration.save(function (err, configuration) {
          if (err) {
            console.error('Error creating initial config', err)
          } else {
            console.log('Successfully created initial config')
          }
        });
      } else {
        console.log('Configuration already exists. ')
      }

    }
  });



  app.listen(port, function () {
    console.log("Acme-Explorer RESTful API server started on: " + port);
  });
});

mongoose.connection.on("error", function (err, conn) {
  console.error("DB init error " + err);
});
