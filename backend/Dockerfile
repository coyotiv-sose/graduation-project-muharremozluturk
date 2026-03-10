FROM node:25.6.1-alpine3.23

WORKDIR /app

RUN npm install -g nodemon

ADD package.json package-lock.json ./

RUN npm install

ADD bin ./bin

CMD [ "nodemon" ]
