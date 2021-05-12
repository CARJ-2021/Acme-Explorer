FROM node:14.6

# Create app directory
WORKDIR /usr/src/app

# Install app dependencies
COPY package*.json ./

RUN npm install
RUN npm install -g nodemon

COPY . .

#VOLUME /usr/src/app/data
VOLUME /usr/src/app/logs

EXPOSE 8080
CMD [ "npm", "start" ]