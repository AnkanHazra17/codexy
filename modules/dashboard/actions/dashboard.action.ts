"use server";
import { MONTH_NAMES } from "@/constants/data";
import { auth } from "@/lib/auth";
import { getOctokit } from "@/lib/octokit";
import { fetchUserContribution } from "@/modules/github/github.action";
import { headers } from "next/headers";

export async function getDashboardStats() {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user) {
      throw new Error("Unauthorized");
    }

    const octokit = await getOctokit();

    // Get users github username
    const { data: user } = await octokit.rest.users.getAuthenticated();

    // TODO: Fetch total connected repos from DB
    const totalRepos = 30;

    const calender = await fetchUserContribution(user.login);
    const totalCommits = calender.totalContributions || 0;

    //Count prs from DB or github api
    const { data: prs } = await octokit.rest.search.issuesAndPullRequests({
      q: `user:${user.login} type:pr`,
      per_page: 1,
    });

    const totalPrs = prs.total_count || 0;

    // TODO: Fetch total reviews from DB
    const totalReviews = 44;

    return {
      totalCommits,
      totalPrs,
      totalReviews,
      totalRepos,
    };
  } catch (error) {
    console.error("Error getting dashboard stats:", error);
    throw error;
  }
}

export async function getMonthlyActivity() {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user) {
      throw new Error("Unauthorized");
    }

    const octokit = await getOctokit();

    // Get users github username
    const { data: user } = await octokit.rest.users.getAuthenticated();

    const calender = await fetchUserContribution(user.login);

    if (!calender) {
        return [];
    }

    const monthlyData: {
        [key: string]: {commits: number, prs: number, reviews: number}
    } = {};

    // Initialize last 6 months with empty data
    const today = new Date();
    for (let i = 5; i >= 0; i--) {
        const date = new Date(today.getFullYear(), today.getMonth() - i, 1);
        const monthKey = MONTH_NAMES[date.getMonth()];

        monthlyData[monthKey] = {commits: 0, prs: 0, reviews: 0};
    }

    calender.weeks.forEach((week) => {
        week.contributionDays.forEach((day) => {
            const date = new Date(day.date);
            const monthKey = MONTH_NAMES[date.getMonth()];
            if(monthlyData[monthKey]) {
                monthlyData[monthKey].commits += day.contributionCount;
            }
        })
    })

    // Fetch reviews from DB for last 6 months
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
    
  } catch (error) {
    console.error("Error getting monthly activity:", error);
    throw error;
  }
}
