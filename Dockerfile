FROM node:16

WORKDIR /usr/src/app

COPY package*.json ./

RUN npm ci

ARG NODE_ENV
ENV NODE_ENV $NODE_ENV

COPY . .

RUN npm run addon:configure

RUN npm run addon:build

RUN npm run build:frontend

RUN npm run build

EXPOSE 3000
CMD ["npm", "run", "start"]