import { getGithubToken } from "@/modules/github/github.action";
import { Octokit } from "octokit";

export async function getOctokit(token?: string) {
  if(token) {
    return new Octokit({
      auth: token,
    });
  }
  return new Octokit({
    auth: await getGithubToken(),
  });
}
