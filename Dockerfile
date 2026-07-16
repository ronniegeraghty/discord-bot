# BUILD CONTAINER
FROM node:24-alpine AS ts-compiler
WORKDIR /repo
ENV YOUTUBE_DL_SKIP_PYTHON_CHECK=1
# Copy workspace manifests first for better layer caching
COPY package.json package-lock.json turbo.json ./
COPY apps/bot/package.json ./apps/bot/
COPY packages/protocol/package.json ./packages/protocol/
RUN npm ci
# Copy sources and build all workspaces via turbo
COPY . .
RUN npm run build

# RUNTIME CONTAINER
FROM node:24-alpine AS prod
WORKDIR /repo
ENV YOUTUBE_DL_SKIP_PYTHON_CHECK=1
ENV FFMPEG_PATH=/usr/bin/ffmpeg
# ffmpeg for audio transcoding; python3 to run the yt-dlp binary
RUN apk add --no-cache ffmpeg python3
COPY package.json package-lock.json ./
COPY apps/bot/package.json ./apps/bot/
COPY packages/protocol/package.json ./packages/protocol/
RUN npm ci --omit=dev
USER node
COPY --from=ts-compiler --chown=node /repo/apps/bot/build/ ./apps/bot/build/
WORKDIR /repo/apps/bot
# Start
ENTRYPOINT ["npm", "start"]

