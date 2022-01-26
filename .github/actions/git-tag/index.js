const core = require("@actions/core");
const github = require("@actions/github");
const https = require("https");

try {
  // // `image` input defined in action metadata file
  // const baseImageName = core.getInput("image");
  // console.log(`Base Image Name: ${baseImageName}`);
  // core.setOutput("tag", baseImageName);

  const tagUrl = github.context.payload.repository["tags_url"];
  console.log(`Tags URL: ${tagUrl}`);

  let req = https.request(tagUrl, (res) => {
    console.log(`Status Code: ${res.statusCode}`);
    res.on("data", (d) => {
      process.stdout.write(d);
    });
  });
  req.end();

  // Get the JSON webhook payload for the event that triggered the workflow
  const payload = JSON.stringify(github.context.payload, undefined, 2);
  console.log(`The event payload: ${payload}`);
} catch (error) {
  core.setFailed(error.message);
}
