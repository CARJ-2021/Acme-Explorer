BASE_SITE=do2021.com

#development
export NODE_ENV=development
export PORT=8001
export DBPORT=27018
export FRONT_PORT=3000
export DBNAME=Acme-explorer
export DBHOST=mongo
export VIRTUAL_HOST=${NODE_ENV}.${BASE_SITE}
docker-compose -p ${VIRTUAL_HOST} up -d

#production
export NODE_ENV=production
export PORT=8008
export DBPORT=27019
export VIRTUAL_HOST=${BASE_SITE}
docker-compose -p ${VIRTUAL_HOST} up -d
