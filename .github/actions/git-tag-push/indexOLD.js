const core = require("@actions/core");
const github = require("@actions/github");
const { Octokit } = require("@octokit/rest");
const packageJSON = require("../../../package.json");

async function run() {
  try {
    const image = core.getInput("image", {
      required: true,
    });
    let { owner, name: repo } = github.context.payload.repository;
    owner = owner.login;
    core.startGroup("Calculating Next Tag");
    console.log(`Repo Owner: ${JSON.stringify(owner)} - Repo Name: ${repo}`);
    const nextTag = await getNextTag(owner, repo);
    core.endGroup();
    core.startGroup("Generating Tag Outputs");
    const dockerTag = `${image}:${nextTag}`;
    console.log(`Docker Tag: ${dockerTag}`);
    core.setOutput("docker-tag", dockerTag);
    const gitTag = `${nextTag}`;
    console.log(`Git Tag: ${gitTag}`);
    core.setOutput("git-tag", gitTag);
    core.endGroup();
  } catch (error) {
    core.setFailed(error);
  }
}

const octokit = new Octokit({ auth: null });

async function getNextTag(owner, repo) {
  // collect repo tags
  const tags = await getTags(owner, repo);
  //sort repo tags for latest version tag
  const latestTag = await sortTags(tags);
  console.log(`Latest Tag: ${tagObjectToString(latestTag)}`);
  const nextTag = { ...latestTag, patch: parseInt(latestTag.patch) + 1 };
  console.log(`Next Tag: ${tagObjectToString(nextTag)}`);
  return tagObjectToString(nextTag);
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
  tags.push(getPackageJSONVersion());
  console.log(`Tags: ${tags}`);
  return tags;
}
async function sortTags(tags) {
  let tagObs = [];
  for (const tag of tags) {
    const tagOb = convertTagStringToTagObject(tag);
    tagObs.push(tagOb);
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
  return newestTag;
}
function convertTagStringToTagObject(tag) {
  const splitTag = tag.split(".");
  if (splitTag.length < 3) {
    console.log("Tag not formatted properly, tag: ", tag);
    return undefined;
  } else {
    return {
      major:
        splitTag[0].substring(0, 1) === "v"
          ? splitTag[0].substring(1)
          : splitTag[0],
      minor: splitTag[1],
      patch: splitTag[2],
    };
  }
}
function tagObjectToString(tag) {
  return `${tag.major}.${tag.minor}.${tag.patch}`;
}
function getPackageJSONVersion() {
  return `v${packageJSON.version}`;
}
if (require.main === module) {
  run();
}
