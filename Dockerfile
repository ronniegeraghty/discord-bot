# BUILD CONTAINER
FROM node:24-alpine AS ts-compiler
WORKDIR /development/
COPY package*.json ./
RUN npm ci
COPY . .
# Run TypeScript build
RUN npm run build

# RUNTIME CONTAINER
FROM node:24-alpine AS prod
WORKDIR /app/
RUN apk add --no-cache ffmpeg
COPY package*.json ./
RUN npm ci --omit=dev
USER node
COPY --from=ts-compiler --chown=node /development/build/ ./build/
# Start
ENTRYPOINT ["npm", "start"]

