FROM node:16.7.0-alpine3.14
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

#Start
CMD ["npm","start"]
