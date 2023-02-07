FROM node:18-slim

WORKDIR /app

COPY ./package*.json ./

RUN npm install

COPY ./back /.
COPY ./front /.

EXPOSE 8000

CMD ["npm", "run", "dev"]
