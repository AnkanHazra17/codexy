function getEnvVar(key: string): string {
  const value = process.env[key];
  return value || "";
}

export const envConfig = {
  DATABASE_URL: getEnvVar("DATABASE_URL"),
  GITHUB_CLIENT_ID: getEnvVar("GITHUB_CLIENT_ID"),
  GITHUB_CLIENT_SECRET: getEnvVar("GITHUB_CLIENT_SECRET"),
  BETTER_AUTH_SECRET: getEnvVar("BETTER_AUTH_SECRET"),
  BETTER_AUTH_URL: getEnvVar("BETTER_AUTH_URL"),
  NEXT_PUBLIC_APP_BASE_URL: getEnvVar("NEXT_PUBLIC_APP_BASE_URL"),
  PINECONE_DB_API_KEY: getEnvVar("PINECONE_DB_API_KEY"),
  GOOGLE_GENERATIVE_AI_API_KEY: getEnvVar("GOOGLE_GENERATIVE_AI_API_KEY"),
} as const;