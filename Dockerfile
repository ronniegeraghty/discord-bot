#BUILD CONTAINER
FROM node:16.13.2-alpine3.14 as ts-compiler
#Env

#Work Dir
WORKDIR /app/   

#Config Git cache
RUN apk add --no-cache git
#Add FFmpeg
RUN apk add --no-cache ffmpeg
#Add Bash
RUN apk add --no-cache bash

#Copy CI scripts dir 
COPY ci ./ci/

#Copy package.json and install packages
COPY package.json .
RUN npm install
#Run Post NPM Install Fixes
RUN chmod +x ci/postInstallFixes.sh
RUN ./ci/postInstallFixes.sh

#Add all source code
ADD . /app/



#Run Typescript build
RUN npm run build


#RUNTIME CONTAINER
FROM node:16.13.2-alpine3.14
WORKDIR /app/
RUN apk add --no-cache git
RUN apk add --no-cache ffmpeg
COPY --from=ts-compiler /app/package*.json ./
COPY --from=ts-compiler /app/node_modules/ ./node_modules/
RUN npm cache clean --force
USER node
COPY --from=ts-compiler --chown=node /app/build/ ./build/
#Start
ENTRYPOINT ["npm","start"]
