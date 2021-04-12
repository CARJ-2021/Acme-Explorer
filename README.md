# Acme-Explorer
Repository for Acme Explorer project of Software as a Service Architecture.

# A+
Our team has developed the following two A+ with their corresponding video-tutorial

## Mongo backups - S3
Developed by: Juan Miguel Blanco and Roberto Hermoso

[Video](https://youtu.be/2jMVIjA7G_I)

### About
- In order for the backups to work, it is needed to be configured in the docker-compose.backup.yml. Credentials and information about Amazon AWS S3 have to be entered.


## Real time Grafana dashboard - InfluxDB
Developed by: Alejandro Guerrero and César García

[Video](https://youtu.be/1Si_BAZ__Z0o)

### About
- Grafana dashboard JSON is located in the /docker/grafana folder. 
- Instead of using mongo for storing dashboard metrics influxdb is used and the points represented in the Grafana dashboard in real time.
- InfluxDB has to be running (configuration specified in the /docker/docker-compose.yaml file) for the points to be saved and thus the metrics returned by the /v2/stats endpoint (Dashboard).
- The file populateDB.txt is provided to import some database objects in order to easily obtain /v1/stats (dashboard metrics) data and also seeing the Grafana dashboard in action. 