const core = require("@actions/core");
const github = require("@actions/github");
async function run() {
  try {
    const tag = core.getInput("tag", { required: true });
    const token = core.getInput("github-auth", { required: true });
    const [owner, repo] = process.env.GITHUB_REPOSITORY.split("/");
    const octo = github.getOctokit(token);
    const response = await octo.request("POST /repos/{owner}/{repo}/git/tags", {
      owner: owner,
      repo: repo,
      tag: tag,
      message: "Test message",
      object: process.env.GITHUB_SHA,
      type: "commit",
    });
    console.log(`RESPONSE: ${JSON.stringify(response)}`);
  } catch (error) {
    core.setFailed(error);
  }
}
if (require.main === module) {
  run();
}
