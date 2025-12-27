import { INNGEST_EVENT, INNGEST_REPO_CONNECT_STEPS } from "@/constants/data";
import { inngest } from "../client";
import { getRepositoryFileContents } from "@/modules/github/github.action";
import { indexCodebase } from "@/modules/ai/lib/rag";
import prisma from "@/lib/db";

export const indexRepository = inngest.createFunction(
  { id: "index-repository" },
  { event: INNGEST_EVENT.REPOSITORY_CONNECTED },
  async ({ event, step }) => {
    const { owner, repo, userId } = event.data;

    if (!userId) {
      throw new Error("UserId is required for repository indexing");
    }

    const account = await prisma.account.findFirst({
      where: {
        userId: userId,
        providerId: "github",
      },
    });
  
    if (!account || !account.accessToken) {
      throw new Error("GitHub account not found");
    }

    // Step 1: Fetch files
    const files = await step.run(INNGEST_REPO_CONNECT_STEPS.FETCH_FILES, async () => {
      // Get repo file contents
      const fetchedFiles = await getRepositoryFileContents(account.accessToken, owner, repo);
      return fetchedFiles || [];
    });

    if (!files || files.length === 0) {
      return { success: true, indexedFiles: 0, message: "No files to index" };
    }

    // Step 2: Index codebase
    const indexingResult = await step.run(INNGEST_REPO_CONNECT_STEPS.INDEX_CODEBASE, async () => {
      return await indexCodebase(`${owner}/${repo}`, files);
    });

    return { 
      success: true, 
      indexedFiles: indexingResult?.indexed || 0,
      failedFiles: indexingResult?.failed || 0,
      totalFiles: files.length
    };
  }
);
