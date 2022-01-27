const core = require("@actions/core");
const github = require("@actions/github");
const { Octokit } = require("@octokit/rest");

async function run() {
  console.log("🚀 ~ file: index.js ~ line 6 ~ run ~ run", run);
  try {
    let { owner, name: repo, tags_url } = github.context.payload.repository;
    owner = owner.login;
    console.log(`OWNER: ${JSON.stringify(owner)} - NAME: ${repo}`);

    core.setOutput("docker-tag", await getLatestTag(owner, repo));
  } catch (error) {
    core.setFailed(error);
  }
}

const octokit = new Octokit({ auth: null });

async function getLatestTag(owner, repo) {
  // collect repo tags
  const tags = await getTags(owner, repo);
  //sort repo tags for latest version tag
  const latestTag = sortTags(tags);
  console.log(
    "🚀 ~ file: index.js ~ line 25 ~ getLatestTag ~ latestTag",
    latestTag
  );
  return latestTag;
}
async function getTags(owner, repo) {
  const endpoint = octokit.rest.repos.listTags;
  const pages = endpoint.endpoint.merge({
    owner: owner,
    repo: repo,
    per_page: 100,
  });
  const tags = [];
  for await (const page of octokit.paginate.iterator(pages)) {
    for (const item of page.data) {
      tags.push(item.name);
    }
  }
  console.log(`TAGS: ${tags}`);
  return tags;
}
async function sortTags(tags) {
  let tagObs = [];
  for (const tag of tags) {
    const splitTag = tag.split(".");
    if (splitTag.length < 3) {
      console.log("Tag not formatted properly, tag: ", tag);
    } else {
      const tagOb = {
        major: splitTag[0],
        minor: splitTag[1],
        patch: splitTag[2],
      };
      tagObs.push(tagOb);
    }
  }
  let newestTag;
  for (const tagOb of tagObs) {
    if (newestTag === undefined) {
      newestTag = tagOb;
    } else if (tagOb.major > newestTag.major) {
      newestTag = tagOb;
    } else if (tagOb.major === newestTag.major) {
      if (tagOb.minor > newestTag.minor) {
        newestTag = tagOb;
      } else if (tagOb.minor === newestTag.minor) {
        if (tagOb.patch > newestTag.patch) {
          newestTag = tagOb;
        }
      }
    }
  }
  return `${newestTag.major}.${newestTag.minor}.${newestTag.patch}`;
}

if (require.main === module) {
  run();
}
