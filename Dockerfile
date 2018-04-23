FROM node:carbon

# Create app directory
WORKDIR /usr/src

RUN npm install -g yarn
RUN chmod +x /usr/local/bin/yarn

RUN yarn add sharp
