const core = require("@actions/core");
const github = require("@actions/github");
async function run() {
  try {
    const tag = core.getInput("tag", { required: true });
    const token = core.getInput("github-auth", { required: true });
    const [owner, repo] = process.env.GITHUB_REPOSITORY.split("/");
    const octo = github.getOctokit(token);
    const tagResponse = await octo.request(
      "POST /repos/{owner}/{repo}/git/tags",
      {
        owner: owner,
        repo: repo,
        tag: tag,
        message: "Test message",
        object: process.env.GITHUB_SHA,
        type: "commit",
        tagger: {
          name: "Ronnie Geraghty",
          email: "ronniegerag@gmail.com",
          date: new Date(Date.now()).toISOString(),
        },
      }
    );
    if (response.status !== 201) {
      core.setFailed(`Error Creating Tag:`);
    }
    console.log(`Create Tage RESPONSE: ${JSON.stringify(tagResponse)}`);
    const refResponse = await octo.request(
      "POST /repos/{owner}/{repo}/git/refs",
      {
        accept: "application/vnd.github.v3+json",
        owner: owner,
        repo: repo,
        ref: `refs/tags/${tag}`,
        sha: process.env.GITHUB_SHA,
      }
    );
    console.log(`Post Ref RESPONSE: ${JSON.stringify(refResponse)}`);
  } catch (error) {
    core.setFailed(error);
  }
}
if (require.main === module) {
  run();
}
