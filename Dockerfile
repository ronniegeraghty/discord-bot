# BUILD CONTAINER
FROM node:24-alpine AS ts-compiler
WORKDIR /development/
ENV YOUTUBE_DL_SKIP_PYTHON_CHECK=1
COPY package*.json ./
RUN npm ci
COPY . .
# Run TypeScript build
RUN npm run build

# RUNTIME CONTAINER
FROM node:24-alpine AS prod
WORKDIR /app/
ENV YOUTUBE_DL_SKIP_PYTHON_CHECK=1
# ffmpeg for audio transcoding; python3 to run the yt-dlp binary
RUN apk add --no-cache ffmpeg python3
COPY package*.json ./
RUN npm ci --omit=dev
USER node
COPY --from=ts-compiler --chown=node /development/build/ ./build/
# Start
ENTRYPOINT ["npm", "start"]

