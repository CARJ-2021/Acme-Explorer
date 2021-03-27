#!/usr/bin/env bash

## Launch containers
 
# portainer
docker run -d --name portainer -p 9000:9000 -v /var/run/docker.sock:/var/run/docker.sock portainer/portainer --admin-password='${var.portainer_pw}'

# juablafer/random-app
docker run -p 5000:5000 -d juablafer/random-app