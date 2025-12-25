import { getGithubToken } from "@/modules/github/github.action";
import { Octokit } from "octokit";

export async function getOctokit() {
  return new Octokit({
    auth: await getGithubToken(),
  });
}
