const core = require("@actions/core");
const github = require("@actions/github");
const { Octokit } = require("@octokit/rest");

async function run() {
  try {
    const { owner, name, tags_url } = github.context.payload.repository;
    console.log(`OWNER: ${owner} - NAME: ${name}`);
  } catch (error) {
    core.setFailed(error);
  }
}

const octokit = new Octokit({ auth: null });

async function getLatestTag() {}

async function* getItemsFromPages() {}

if (require.main === module) {
  run();
}
