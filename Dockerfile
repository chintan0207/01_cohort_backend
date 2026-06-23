FROM node:24-alpine
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci --omit=dev
COPY src ./src
COPY server.js .
EXPOSE 5000
CMD ["node", "server.js"]