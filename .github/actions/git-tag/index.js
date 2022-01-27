const core = require("@actions/core");
const github = require("@actions/github");
const { Octokit } = require("@octokit/rest");

async function run() {
  console.log("🚀 ~ file: index.js ~ line 6 ~ run ~ run", run);
  try {
    let { owner, name, tags_url } = github.context.payload.repository;
    owner = owner.login;
    console.log(`OWNER: ${JSON.stringify(owner)} - NAME: ${name}`);
    const repo = name;
    core.setOutput("docker-tag", await getLatestTag(owner, repo));
  } catch (error) {
    core.setFailed(error);
  }
}

const octokit = new Octokit({ auth: null });

async function getLatestTag(owner, repo) {
  console.log(
    "🚀 ~ file: index.js ~ line 21 ~ getLatestTag ~ getLatestTag",
    getLatestTag
  );
  const endpoint = octokit.rest.repos.listTags;
  console.log(
    "🚀 ~ file: index.js ~ line 26 ~ getLatestTag ~ endpoint",
    endpoint
  );
  const pages = endpoint.endpoint.merge({
    owner: owner,
    repo: repo,
    per_page: 100,
  });
  console.log(
    "🚀 ~ file: index.js ~ line 31 ~ getLatestTag ~ pages",
    JSON.stringify(pages)
  );
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
  console.log(
    "🚀 ~ file: index.js ~ line 39 ~ function*getItemsFromPages ~ getItemsFromPages",
    getItemsFromPages
  );
  for await (const page of octokit.paginate.iterator(pages)) {
    for (const item of page.data) {
      console.log(`DATA: ${item.name}`);
      return item;
    }
  }
}

if (require.main === module) {
  run();
}
