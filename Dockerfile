FROM node:20-alpine AS builder

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY tsconfig.json tsconfig.build.json ./
COPY src/ ./src/

RUN npm run build

# ---

FROM node:20-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci --only=production

RUN apk add --no-cache ffmpeg

COPY --from=builder /app/dist ./dist

RUN mkdir -p data

CMD ["node", "dist/index.js"]
