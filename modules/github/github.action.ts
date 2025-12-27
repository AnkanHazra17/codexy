import { WEBHOOK_URL } from "@/constants/data";
import { auth } from "@/lib/auth";
import prisma from "@/lib/db";
import { envConfig } from "@/lib/env-config";
import { getOctokit } from "@/lib/octokit";
import { headers } from "next/headers";

// Get the GitHub access token for the authenticated user
export async function getGithubToken() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    throw new Error("Unauthorized");
  }

  const account = await prisma.account.findFirst({
    where: {
      userId: session.user.id,
      providerId: "github",
    },
  });

  if (!account) {
    throw new Error("GitHub account not found");
  }

  if (!account.accessToken) {
    throw new Error("GitHub access token not found");
  }

  return account.accessToken;
}

export async function fetchUserContribution(username: string) {
  const octokit = await getOctokit();

  const query = `
    query($username: String!) {
        user(login: $username) {
            contributionsCollection {
                contributionCalendar {
                    totalContributions
                    weeks {
                        contributionDays {
                            date
                            contributionCount
                            color
                        }
                    }
                }
            }
        }
    }
    `;

  try {
    const response = await octokit.graphql<{
      user: {
        contributionsCollection: {
          contributionCalendar: {
            totalContributions: number;
            weeks: {
              contributionDays: {
                date: string;
                contributionCount: number;
                color: string;
              }[];
            }[];
          };
        };
      };
    }>(query, { username });
    return response.user.contributionsCollection.contributionCalendar;
  } catch (error) {
    console.error("Error fetching user contributions:", error);
    throw error;
  }
}

// Get all repositories from github
export async function getRepositories(page: number = 1, perPage: number = 10) {
  const octokit = await getOctokit();

  const { data: repositories } = await octokit.rest.repos.listForAuthenticatedUser({
    sort: "updated",
    direction: "desc",
    visibility: "all",
    per_page: perPage,
    page: page,
  });

  return repositories;
}

// Create webhook for repository
export async function createWebhook(owner: string, repo: string) {
  try {
    const octokit = await getOctokit();

    // Check if user has admin access to the repository
    try {
      const { data: repoData } = await octokit.rest.repos.get({
        owner,
        repo,
      });

      // Check if user has admin permissions
      const { data: user } = await octokit.rest.users.getAuthenticated();
      const isOwner = repoData.owner.login === user.login;
      
      // For organization repos, check if user has admin access
      if (!isOwner && repoData.owner.type === "Organization") {
        // User might not have admin access to org repos
        // We'll try to create webhook and catch the error
      }
    } catch (error) {
      console.error("Error checking repository access:", error);
      throw new Error("You don't have access to this repository");
    }

    // List existing webhooks
    let webhooks;
    try {
      const response = await octokit.rest.repos.listWebhooks({
        owner,
        repo,
      });
      webhooks = response.data;
    } catch (error: any) {
      // If 404, user doesn't have admin access
      if (error.status === 404 || error.status === 403) {
        throw new Error(
          "You need admin access to this repository to create webhooks. Please ensure you're the owner or have admin permissions."
        );
      }
      throw error;
    }

    const existingWebhook = webhooks.find(
      (webhook) => webhook.config.url === WEBHOOK_URL
    );

    if (existingWebhook) {
      return existingWebhook;
    }

    // Create new webhook
    try {
      const { data: newWebhook } = await octokit.rest.repos.createWebhook({
        owner,
        repo,
        config: {
          url: WEBHOOK_URL,
          content_type: "json",
        },
        events: ["push", "pull_request"],
      });

      return newWebhook;
    } catch (error: any) {
      if (error.status === 404 || error.status === 403) {
        throw new Error(
          "Failed to create webhook. You need admin access to this repository."
        );
      }
      throw error;
    }
  } catch (error: any) {
    console.error("Error creating webhook:", error);
    // Re-throw with a user-friendly message
    if (error.message) {
      throw error;
    }
    throw new Error("Failed to create webhook. Please check your repository permissions.");
  }
}

// Delete webhook for repository
export async function deleteWebhook(owner: string, repo: string) {
  try {
    const octokit = await getOctokit();

    const webhooks = await octokit.rest.repos.listWebhooks({
      owner,
      repo,
    });

    const webhookToDelete = webhooks.data.find((webhook) => webhook.config.url === WEBHOOK_URL);

    if (!webhookToDelete) {
      throw new Error("Webhook not found");
    }

    await octokit.rest.repos.deleteWebhook({
      owner,
      repo,
      hook_id: webhookToDelete.id,
    });

    return { success: true };

  } catch (error) {
    console.error("Error deleting webhook:", error);
    throw new Error("Failed to delete webhook");
  }
}

export async function getRepositoryFileContents(token: string | null, owner: string, repo: string, path: string = ""): Promise<{path: string; content: string}[]> {
  if(!token) {
    throw new Error("GitHub access token not found");
  }
  const octokit = await getOctokit(token);

  const { data: fileContents } = await octokit.rest.repos.getContent({
    owner,
    repo,
    path,
  });

  if(!Array.isArray(fileContents)) {
    if(fileContents.type === "file" && fileContents.content) {
      return [{path: fileContents.path, content: Buffer.from(fileContents.content, "base64").toString("utf-8")}];
    }
    return [];
  }

  let files: {path: string; content: string}[] = [];

  for(const item of fileContents) {
    if(item.type === "file"){
      const {data: fileData} = await octokit.rest.repos.getContent({
        owner,
        repo,
        path: item.path,
      });
      
      if(!Array.isArray(fileData) && fileData.type === "file" && fileData.content) {
        // Filter non code files
        if(!item.path.match(/\.(png|jpg|jpeg|gif|svg|ico|webp|pdf|zip|tar|gz)$/i)) {
          files.push({path: item.path, content: Buffer.from(fileData.content, "base64").toString("utf-8")});
        }
      }
    }else if(item.type === "dir") {
      const subFiles = await getRepositoryFileContents(token, owner, repo, item.path);
      files = files.concat(subFiles);
    }
  }

  return files;
}

export async function getPullRequestDiff(token: string, owner: string, repo: string, prNumber: number) {
  const octokit = await getOctokit(token);

  const {data: prData} = await octokit.rest.pulls.get({
      owner,
      repo,
      pull_number: prNumber,
  })

  const {data: diffData} = await octokit.rest.pulls.get({
      owner,
      repo,
      pull_number: prNumber,
      mediaType: {
          format: "diff",
      }
  })

  return {
      diff: diffData as unknown as string,
      title: prData.title,
      description: prData.body || "",
  }
}

export async function postReviewComment(token: string, owner: string, repo: string, prNumber: number, review: string) {
  const octokit = await getOctokit(token);

  await octokit.rest.issues.createComment({
    owner,
    repo,
    issue_number: prNumber,
    body: `## AI code review\n\n${review}\n\n---\n\nThis review was generated by CodeXY, an AI-powered code review tool.`,
  });
}
