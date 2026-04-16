FROM node:20-alpine
WORKDIR /usr/src/app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
COPY build/lynx /usr/local/bin/lynx
RUN chmod +x /usr/local/bin/lynx
ENV NODE_ENV=production
EXPOSE 3000
CMD ["node", "index.js"]

