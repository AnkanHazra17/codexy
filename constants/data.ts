import { envConfig } from "@/lib/env-config";
import { CogIcon, LayoutDashboardIcon } from "lucide-react";


export const APP_NAVIGATOR_ITEMS = [
    {
        label: "Dashboard",
        href: "/dashboard",
        icon: LayoutDashboardIcon
    },
    {
        label: "Repositories",
        href: "/dashboard/repositories",
        icon: LayoutDashboardIcon
    },
    {
        label: "Reviews",
        href: "/dashboard/reviews",
        icon: LayoutDashboardIcon
    },
    {
        label: "Subscriptions",
        href: "/dashboard/subscriptions",
        icon: LayoutDashboardIcon
    },
    {
        label: "Settings",
        href: "/dashboard/settings",
        icon: CogIcon
    }
]

export const MONTH_NAMES = [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "Jun",
    "Jul",
    "Aug",
    "Sep",
    "Oct",
    "Nov",
    "Dec"
]

export const DEFAULT_PER_PAGE = 10;

export const WEBHOOK_URL = `${envConfig.NEXT_PUBLIC_APP_BASE_URL}/api/webhooks/github`;

export const INNGEST_EVENT = {
    REPOSITORY_CONNECTED: "repository.connected",
    PR_REVIEW_REQUESTED: "pr.review.requested",
} as const;

export const INNGEST_REVIEW_STEPS = {
    FETCH_PR_DATA: "fetch-pr-data",
    RETRIEVE_CONTEXT: "retrieve-context",
    GENERATE_AI_REVIEW: "generate-ai-review",
    POST_COMMENT: "post-comment",
    SAVE_REVIEW_TO_DB: "save-review-to-db",
} as const;

export const INNGEST_REPO_CONNECT_STEPS = {
    FETCH_FILES: "fetch-files",
    INDEX_CODEBASE: "index-codebase",
} as const;
