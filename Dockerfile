FROM node:22-alpine

WORKDIR /app

COPY package*.json ./

COPY tsconfig.json ./

COPY src ./src

RUN npm install

CMD ["npm", "start"]
