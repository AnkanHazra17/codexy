"use server";

import { INNGEST_EVENT } from "@/constants/data";
import { inngest } from "@/inngest/client";
import prisma from "@/lib/db";

export async function reviewPullRequest(
  owner: string,
  repo: string,
  prNumber: number
) {
  try {
    const repository = await prisma.repository.findFirst({
      where: {
        owner,
        name: repo,
      },
      include: {
        user: {
          include: {
            accounts: {
              where: {
                providerId: "github",
              },
            },
          },
        },
      },
    });
    
    if (!repository) {
      throw new Error(`Repository not found: ${owner}/${repo}`);
    }

    if (!repository.user) {
      throw new Error(`User not found for repository: ${owner}/${repo}`);
    }

    await inngest.send({
      name: INNGEST_EVENT.PR_REVIEW_REQUESTED,
      data: {
        owner,
        repo,
        prNumber,
        userId: repository.user.id,
      },
    });
    return { success: true, message: "Pull request review requested" };
  } catch (error) {
    try {
      const repository = await prisma.repository.findFirst({
        where: {
          owner,
          name: repo,
        },
      });

      if (!repository) {
        throw new Error("Repository not found");
      }

      await prisma.review.create({
        data: {
          repositoryId: repository.id,
          prNumber,
          prTitle: "Faliled to fetch PR",
          prUrl: `https://github.com/${owner}/${repo}/pull/${prNumber}`,
          review: `Error: ${
            error instanceof Error ? error.message : "Unknown error"
          }`,
          status: "failed",
        },
      });
    } catch (error) {
      console.error("Error creating review:", error);
      throw error;
    }
  }
}
