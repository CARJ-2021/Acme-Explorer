FROM node:15

# Create app directory
WORKDIR /usr/src/app

# Install app dependencies
COPY package*.json ./

RUN npm install

COPY . .

#VOLUME /usr/src/app/data
VOLUME /usr/src/app/logs

EXPOSE 8080
CMD [ "npm", "start" ]