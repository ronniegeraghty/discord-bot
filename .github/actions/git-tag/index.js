const core = require("@actions/core");
const github = require("@actions/github");
const { Octokit } = require("@octokit/core");

try {
  // // `image` input defined in action metadata file
  // const baseImageName = core.getInput("image");
  // console.log(`Base Image Name: ${baseImageName}`);
  // core.setOutput("tag", baseImageName);

  const { owner, name, tags_url } = github.context.payload.repository;
  console.log(`Tags URL: ${tags_url}`);

  const octokit = new Octokit();
  const res = octokit.request(`GET /repos/${owner.login}/${name}/git/tags/`);
  console.log(`Response Status: ${res.status}`);
  console.log(`Response Data: ${res.data}`);

  // Get the JSON webhook payload for the event that triggered the workflow
  const payload = JSON.stringify(github.context.payload, undefined, 2);
  console.log(`The event payload: ${payload}`);
} catch (error) {
  core.setFailed(error.message);
}
