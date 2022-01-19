#BUILD CONTAINER
FROM node:16.7.0-alpine3.14 as ts-compiler
#Env

#Work Dir
WORKDIR /app/   

#Config Git cache
RUN apk add --no-cache git
#Add FFmpeg
RUN apk add --no-cache ffmpeg

#Copy package.json and install packages
COPY package.json .
RUN npm install

#Add all source code
ADD . /app/

#Run Typescript build
RUN npm run build


#RUNTIME CONTAINER
FROM node:16.7.0-alpine3.14
WORKDIR /app/
RUN apk add --no-cache git
RUN apk add --no-cache ffmpeg
COPY --from=ts-compiler /app/package*.json ./
COPY --from=ts-compiler /app/node_modules/ ./node_modules/
COPY --from=ts-compiler /app/build/ /app/build/
#Start
CMD ["npm","start"]
