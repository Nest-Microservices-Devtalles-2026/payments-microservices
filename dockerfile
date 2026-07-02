FROM node:22.22-alpine3.22

WORKDIR /usr/src/app

COPY package*.json ./

RUN npm install

COPY . .

expose 3003