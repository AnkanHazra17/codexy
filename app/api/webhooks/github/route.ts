import { reviewPullRequest } from "@/modules/ai/actions/review.action";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const event = request.headers.get("x-github-event");

    console.log("GitHub webhook event:", { event });

    if (event === "ping") {
      return NextResponse.json({ message: "Pong" }, { status: 200 });
    }

    if(event === "pull_request") {
      const action = body.action;
      const repoFullName = body.repository.full_name;
      const prNumber = body.number;

      const [owner, repo] = repoFullName.split("/");

      if(action === "opened" || action === "synchronize") {
        // Review the pull request
        await reviewPullRequest(owner, repo, prNumber);
      }

    }

    // Handle other events
    return NextResponse.json({ message: "Event processed" }, { status: 200 });
  } catch (error) {
    console.error("Error processing GitHub webhook:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}
