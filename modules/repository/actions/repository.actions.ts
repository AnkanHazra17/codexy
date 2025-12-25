"use server";

import { auth } from "@/lib/auth";
import prisma from "@/lib/db";
import { createWebhook, getRepositories } from "@/modules/github/github.action";
import { headers } from "next/headers";

export async function fetchRepositories(
  page: number = 1,
  perPage: number = 10
) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session) {
      throw new Error("Unauthorized");
    }

    // Repositories from github
    const repositories = await getRepositories(page, perPage);

    // Repositories from DB
    const dbRepositories = await prisma.repository.findMany({
      where: {
        userId: session.user.id,
      },
    });

    // Connected repositories - convert BigInt to string for comparison
    const connectedRepoIds = new Set(
      dbRepositories.map((repo) => repo.githubId)
    );

    return repositories.map((repo) => ({
      ...repo,
      isConnected: connectedRepoIds.has(BigInt(repo.id)),
    }));
  } catch (error) {
    console.error("Error fetching repositories:", error);
    throw error;
  }
}

export async function connectRepository(
  owner: string,
  repo: string,
  githubId: number
) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session) {
      throw new Error("Unauthorized");
    }

    // TODO: Check if user can connect more repositories(check subscription plan)

    // Create webhook (optional - repository can be connected without webhook)
    let webhook = null;
    try {
      webhook = await createWebhook(owner, repo);
    } catch (error: any) {
      // Log the error but don't fail the connection
      // User can still connect the repo even if webhook creation fails
      console.warn("Failed to create webhook (continuing anyway):", error.message);
      // You might want to store this error in the database for later retry
    }

    // Create repository connection
    await prisma.repository.create({
      data: {
        githubId: BigInt(githubId),
        name: repo,
        owner,
        fullName: `${owner}/${repo}`,
        url: `https://github.com/${owner}/${repo}`,
        userId: session.user.id,
      },
    });

    // TODO: Increment repository count in user's subscription

    // TODO: Trigger repository indexing for RAG

    return webhook;
  } catch (error) {
    console.error("Error connecting repository:", error);
    throw error;
  }
}

export async function disconnectRepository(githubId: number) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session) {
      throw new Error("Unauthorized");
    }

    // Delete repository connection
    await prisma.repository.deleteMany({
      where: {
        githubId: BigInt(githubId),
        userId: session.user.id,
      },
    });

    return { success: true };
  } catch (error) {
    console.error("Error disconnecting repository:", error);
    throw error;
  }
}
