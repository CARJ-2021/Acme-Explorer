const cors = require("cors");
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
  bodyParser = require("body-parser"),
  https = require("https"),
  fs = require("fs");

var CronJob = require("cron").CronJob;

const keys = {
  key: fs.readFileSync('./keys/server.key'),
  cert: fs.readFileSync('./keys/server.cert')
};

var admin = require("firebase-admin");

var serviceAccount = require("./acme-explorer-carj-2021-firebase-adminsdk-48rxy-1453ad636f");

if (serviceAccount) {
  process.env.apikey = serviceAccount.apikey;
}

// MongoDB URI building
var mongoDBUser = process.env.mongoDBUser || "";
var mongoDBPass = process.env.mongoDBPass || "";
var mongoDBCredentials =
  mongoDBUser && mongoDBPass ? mongoDBUser + ":" + mongoDBPass + "@" : "";

var mongoDBHostname = process.env.DBHOST || "localhost";
var mongoDBPort = process.env.DBPORT || "27017";
var mongoDBName = process.env.DBNAME || "Acme-Explorer";

var mongoDBURI =
  "mongodb://" +
  mongoDBCredentials +
  mongoDBHostname +
  ":" +
  mongoDBPort +
  "/" +
  mongoDBName;

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

app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ limit: "50mb" }));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(cors());

var routesTrips = require("./api/routes/tripRoutes");
var routesActors = require("./api/routes/actorRoutes");
var routesSponsorships = require("./api/routes/sponsorshipRoutes");
var routesApplications = require("./api/routes/applicationRoutes");
var routesFinders = require("./api/routes/finderRoutes");
var routesConfiguration = require("./api/routes/configurationRoutes");
var routesLogin = require("./api/routes/loginRoutes");
var routesStats = require("./api/routes/statsRoutes");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL:
    "https://acme-explorer-carj-2021-default-rtdb.europe-west1.firebasedatabase.app",
});

routesTrips(app);
routesActors(app);
routesSponsorships(app);
routesApplications(app);
routesFinders(app);
routesConfiguration(app);
routesLogin(app);
routesStats(app);

console.log("Connecting DB to: " + mongoDBURI);
mongoose.connection.on("open", function (err, conn) {
  Configuration.exists({ id: "mainConfig" }, function (err, exists) {
    if (err) {
      console.error("Error finding initial config", err);
    } else {
      if (!exists) {
        var new_configuration = new Configuration({
          id: "mainConfig",
        });
        new_configuration.save(function (err, configuration) {
          if (err) {
            console.error("Error creating initial config", err);
          } else {
            console.log("Successfully created initial config");
          }
        });
      } else {
        console.log("Configuration already exists. ");
      }
    }
  });

  // https.createServer(keys, app).listen(port);
  // console.log(
  //   "Acme-Explorer RESTful API server started with HTTPS on: " + port
  // );
  app.listen(port, function () {
    console.log("Acme-Explorer RESTful API server started on: " + port);
  });
});

mongoose.connection.on("error", function (err, conn) {
  console.error("DB init error " + err);
});

const statsController = require("./api/controllers/statsController");

//CronJob for stats
if (!process.env.RUNNING_TESTS) {
  var job = new CronJob(
    "0,10,20,30,40,50 * * * * *",
    async function () {
      //Cron every 10 seconds for the stats calculation
      console.log("Computing dashboard metrics...");
      await statsController.calculateDashboardMetrics();
      console.log("Finished calculating and storing stats");
    },
    null,
    true,
    "America/Los_Angeles"
  );
  job.start();
}

module.exports = app;
