FROM node:16

# Create app directory
WORKDIR /usr/src/app

# Install app dependencies
# A wildcard is used to ensure both package.json AND package-lock.json are copied
# where available (npm@5+)
COPY package*.json ./

# RUN apk add --no-cache --virtual .build-deps make g++ python3

# RUN apt-get update && apt-get -y install make g++ python3

RUN npm install

# If you are building your code for production
# RUN npm ci --only=production

# Bundle app source
COPY . .

RUN npm run addon:configure

RUN npm run addon:build

RUN npm run build:frontend

RUN npm run build

EXPOSE 3000
CMD ["npm", "run", "start"]