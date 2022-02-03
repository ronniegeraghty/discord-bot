const core = require("@actions/core");
const github = require("@actions/github");
async function run() {
  try {
    const tag = core.getInput("tag", { required: true });
    const token = core.getInput("github-auth", { required: true });
    const [owner, repo] = process.env.GITHUB_REPOSITORY.split("/");
    const octo = github.getOctokit(token);
    const response = await octo.request("POST /repos/{owner}/{repo}/git/tags", {
      owner: "dingle",
      repo: repo,
      tag: tag,
      message: "Test message",
      object: process.env.GITHUB_SHA,
      type: "commit",
      tagger: {
        name: "Ronnie Geraghty",
        email: "ronniegerag@gmail.com",
        date: Date.now(),
      },
    });
    if (response.status !== 201) {
      core.setFailed(`Error Creating Tag:`);
    }
    console.log(`RESPONSE: ${JSON.stringify(response)}`);
  } catch (error) {
    core.setFailed(error);
  }
}
if (require.main === module) {
  run();
}
