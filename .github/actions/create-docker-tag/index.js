const core = require("@actions/core");
const github = require("@actions/github");

try {
  // `image` input defined in action metadata file
  const baseImageName = core.getInput("image");
  console.log(`Base Image Name: ${baseImageName}`);
  core.setOutput("tag", baseImageName);
  // Get the JSON webhook payload for the event that triggered the workflow
  const payload = JSON.stringify(github.context.payload, undefined, 2);
  console.log(`The event payload: ${payload}`);
} catch (error) {
  core.setFailed(error.message);
}
