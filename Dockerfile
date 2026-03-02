FROM node:20-alpine

RUN apk add --no-cache dumb-init

WORKDIR /app

COPY package*.json ./
RUN npm ci --omit=dev

COPY . .

RUN mkdir -p logs

EXPOSE 3000

# Use dumb-init so signals work correctly
ENTRYPOINT ["dumb-init", "--"]
CMD ["node", "src/server.js"]
