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

    const webhookUrl = `${envConfig.NEXT_PUBLIC_APP_BASE_URL}/api/webhooks/github`;

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
      (webhook) => webhook.config.url === webhookUrl
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
          url: webhookUrl,
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
