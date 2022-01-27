const core = require("@actions/core");
const github = require("@actions/github");
const { Octokit } = require("@octokit/rest");

async function run() {
  try {
    let { owner, name, tags_url } = github.context.payload.repository;
    owner = owner.name;
    console.log(`OWNER: ${owner} - NAME: ${name}`);
    core.setOutput("docker-tag", await getLatestTag(owner, repo));
  } catch (error) {
    core.setFailed(error);
  }
}

const octokit = new Octokit({ auth: null });

async function getLatestTag(owner, repo) {
  const endpoint = octokit.repos.listTags;
  const pages = endpoint.endpoint.merge({
    owner: owner,
    repo: repo,
    per_page: 100,
  });
  const tags = [];
  for await (const item of getItemsFromPages(pages)) {
    const tag = item["name"];
    tags.push(tag);
    return tag;
  }
  console.log(`TAGS: ${tags}`);
  return tags[0];
}

async function* getItemsFromPages(pages) {
  for await (const page of octokit.paginate.iterator(pages)) {
    for (const item of page.data) {
      yield item;
    }
  }
}

if (require.main === module) {
  run();
}
