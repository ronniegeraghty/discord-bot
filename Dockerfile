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
# tini = tiny init for correct PID 1 behavior (signal forwarding + zombie reaping).
# Installed after npm ci so the expensive dependency layer stays cached.
RUN apk add --no-cache tini
USER node
COPY --from=ts-compiler --chown=node /repo/apps/bot/build/ ./apps/bot/build/
WORKDIR /repo/apps/bot
# Run node directly under tini as PID 1. `npm start` as PID 1 is an anti-pattern:
# npm doesn't forward signals or reap zombies, so SIGTERM (graceful shutdown) and
# child-process cleanup are unreliable. tini handles both correctly.
ENTRYPOINT ["/sbin/tini", "--"]
CMD ["node", "./build/Bot.js"]

