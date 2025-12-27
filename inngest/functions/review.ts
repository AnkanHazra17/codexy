import { INNGEST_EVENT, INNGEST_REVIEW_STEPS } from "@/constants/data";
import { inngest } from "../client";
import prisma from "@/lib/db";
import { getPullRequestDiff, postReviewComment } from "@/modules/github/github.action";
import { retrieveContext } from "@/modules/ai/lib/rag";
import { generateText } from "ai";
import { google } from "@ai-sdk/google";

export const generateReview = inngest.createFunction(
  { id: "generate-review", concurrency: 5 },
  { event: INNGEST_EVENT.PR_REVIEW_REQUESTED },
  async ({ event, step }) => {
    const { owner, repo, prNumber, userId } = event.data;

    const { title, diff, description, token } = await step.run(
      INNGEST_REVIEW_STEPS.FETCH_PR_DATA,
      async () => {
        const account = await prisma.account.findFirst({
          where: {
            userId,
            providerId: "github",
          },
        });

        if (!account || !account.accessToken) {
          throw new Error("GitHub account not found");
        }

        const prData = await getPullRequestDiff(
          account.accessToken,
          owner,
          repo,
          prNumber
        );

        return { ...prData, token: account.accessToken };
      }
    );

    const context = await step.run(INNGEST_REVIEW_STEPS.RETRIEVE_CONTEXT, async () => {
      const query = `${title}\n${description}`;
      return await retrieveContext(query, `${owner}/${repo}`);
    });

    const review = await step.run(INNGEST_REVIEW_STEPS.GENERATE_AI_REVIEW, async () => {
      const prompt = `You are an expert code reviewer. Analyze the following pull request and provide a detailed, constructive code review.

PR Title: ${title}
PR Description: ${description || "No description provided"}

Context from Codebase:
${context.join("\n\n")}

Code Changes:
\`\`\`diff
${diff}
\`\`\`

Please provide:
1. **Walkthrough**: A file-by-file explanation of the changes.
2. **Sequence Diagram**: A Mermaid JS sequence diagram visualizing the flow of the changes (if applicable). Use \`\`\`mermaid ... \`\`\` block. **IMPORTANT**: Ensure the Mermaid syntax is valid. Do not use special characters (like quotes, braces, parentheses) inside Note text or labels as it breaks rendering. Keep the diagram simple.
3. **Summary**: Brief overview.
4. **Strengths**: What's done well.
5. **Issues**: Bugs, security concerns, code smells.
6. **Suggestions**: Specific code improvements.
7. **Poem**: A short, creative poem summarizing the changes at the very end.

Format your response in markdown.`;
      const { text } = await generateText({
        model: google("gemini-2.5-flash"),
        prompt,
      });

      return text;
    });

    await step.run(INNGEST_REVIEW_STEPS.POST_COMMENT, async () => {
      await postReviewComment(token, owner, repo, prNumber, review);
    });

    await step.run(INNGEST_REVIEW_STEPS.SAVE_REVIEW_TO_DB, async () => {
      const repository = await prisma.repository.findFirst({
        where: {
          owner,
          name: repo,
        },
      });

      if(!repository) {
        throw new Error("Repository not found");
      }

      await prisma.review.create({
        data: {
          repositoryId: repository.id,
          prNumber,
          prTitle: title,
          prUrl: `https://github.com/${owner}/${repo}/pull/${prNumber}`,
          review,
          status: "completed",
        },
      });
    })

    return { success: true, message: "Review generated and posted" };
  }
);
