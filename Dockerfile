FROM node:carbon

# Create app directory
WORKDIR /usr/src

RUN npm i -g npm@5.6.0
