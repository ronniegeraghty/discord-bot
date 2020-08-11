require("dotenv").config();
const { exec } = require("child_process");
const os = require("os");

console.log(os.platform());

process.env.PATH = process.env.PATH + ";" + process.env.FFMPEG_PATH;

console.log(process.env.PATH);
