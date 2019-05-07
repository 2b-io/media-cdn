FROM node:carbon

# Create app directory
WORKDIR /usr/src

RUN npm i -g npm@5.6.0 && apt-get update -y && apt-get install graphicsmagick -y
