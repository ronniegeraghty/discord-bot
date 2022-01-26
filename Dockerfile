FROM node:16.13.2-alpine3.14 AS dev
#Install dev tools
RUN apk update
RUN apk add git

WORKDIR /development/
ADD package.json .
RUN npm install
ADD . .
#Run Post NPM Install Fixes
RUN chmod +x ci/postInstallFixes.sh
RUN ./ci/postInstallFixes.sh

#BUILD CONTAINER
FROM dev AS ts-compiler

#Config Git cache
# RUN apk add --no-cache git
#Add FFmpeg
# RUN apk add --no-cache ffmpeg

#Run Typescript build
RUN npm run build


#RUNTIME CONTAINER
FROM node:16.13.2-alpine3.14 AS prod
WORKDIR /app/
RUN apk add --no-cache git
RUN apk add --no-cache ffmpeg
COPY --from=ts-compiler /development/package*.json ./
#COPY --from=ts-compiler /dev/node_modules/ ./node_modules/
RUN npm cache clean --force
RUN npm ci --only=prod
#Run Post NPM Install Fixes
COPY --from=ts-compiler /development/ci/ ./ci/
RUN chmod +x ci/postInstallFixes.sh
RUN ./ci/postInstallFixes.sh
USER node
COPY --from=ts-compiler --chown=node /development/build/ ./build/
#Start
ENTRYPOINT ["npm","start"]
