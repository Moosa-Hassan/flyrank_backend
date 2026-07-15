FROM node:18-alpine
WORKDIR /app
COPY todo-api/package*.json ./
RUN npm install
COPY . .
EXPOSE 3000
CMD ["node", "todo-api/app.js"]