FROM node:10

WORKDIR /app

COPY package*.json ./

COPY . .

EXPOSE 3000

CMD ["npm", "start"]