#!/bin/sh
echo 'Running Fix for Mongoose mongodb@4.2.2 dep type error'
cd node_modules/mongoose
npm i mongodb@4.3.0 --only=production