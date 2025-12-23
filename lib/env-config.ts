function getEnvVar(key: string, required = true): string {
  const value = process.env[key];
  if (required && !value) {
    throw new Error(`Missing required environment variable: ${key}`);
  }
  return value || "";
}

export const envConfig = {
  DATABASE_URL: getEnvVar("DATABASE_URL"),
  GITHUB_CLIENT_ID: getEnvVar("GITHUB_CLIENT_ID"),
  GITHUB_CLIENT_SECRET: getEnvVar("GITHUB_CLIENT_SECRET"),
  BETTER_AUTH_SECRET: getEnvVar("BETTER_AUTH_SECRET"),
  BETTER_AUTH_URL: getEnvVar("BETTER_AUTH_URL", false) || process.env.NEXT_PUBLIC_APP_URL || "http://localhost:4000",
} as const;