const core = require("@actions/core");
const github = require("@actions/github");
// const http = requier("http");

try {
  // // `image` input defined in action metadata file
  // const baseImageName = core.getInput("image");
  // console.log(`Base Image Name: ${baseImageName}`);
  // core.setOutput("tag", baseImageName);

  //Get Next patch tag
  // const options = {
  //   url:
  //   method: 'GET'
  // }
  // let req = http.get();

  // Get the JSON webhook payload for the event that triggered the workflow
  const payload = JSON.stringify(
    github.context.payload.base.repo.tags_url,
    undefined,
    2
  );
  console.log(`The event payload: ${payload}`);
} catch (error) {
  core.setFailed(error.message);
}
