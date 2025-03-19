FROM node:22-alpine

WORKDIR /app

COPY package*.json ./

COPY tsconfig.json ./

RUN npm install --omit=dev

COPY src ./src

COPY dist ./dist

CMD ["npm", "start"]
