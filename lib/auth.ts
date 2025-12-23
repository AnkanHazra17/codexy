import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import prisma from "./db";
import { envConfig } from "./env-config";

export const auth = betterAuth({
  database: prismaAdapter(prisma, {
    provider: "postgresql",
  }),
  secret: envConfig.BETTER_AUTH_SECRET,
  baseURL: envConfig.BETTER_AUTH_URL,
  socialProviders: {
    github: {
      clientId: envConfig.GITHUB_CLIENT_ID,
      clientSecret: envConfig.GITHUB_CLIENT_SECRET,
      // Start with minimal scope - expand when you actually need repo access
      scope: ["read:user", "user:email"],
    },
  },
});
