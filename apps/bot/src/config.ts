import * as dotenv from "dotenv";
import { z } from "zod";
import { DatabaseOptions } from "./database/DatabaseOptions";
import { RawCommandOptions } from "./client/Command";

dotenv.config({ quiet: true });

// Validate the environment once, at startup, so misconfiguration fails fast
// with a clear message instead of surfacing as a confusing runtime error.
const envSchema = z
  .object({
    DISCORD_TOKEN: z.string().min(1, "DISCORD_TOKEN is required"),
    CLIENT_ID: z.string().min(1, "CLIENT_ID is required"),
    PREFIX: z.string().min(1, "PREFIX is required"),
    MONGO_ROOT_USER: z.string().min(1, "MONGO_ROOT_USER is required"),
    MONGO_ROOT_PASSWORD: z.string().min(1, "MONGO_ROOT_PASSWORD is required"),
    MONGO_DATABASE: z.string().min(1, "MONGO_DATABASE is required"),
    MONGO_INTERNAL_PORT: z
      .string()
      .regex(/^\d+$/, "MONGO_INTERNAL_PORT must be a port number"),
    MONGO_OPTIONS: z.string().optional().default(""),
    ENV: z.string().optional(),
    MONGO_HOST_NAME: z.string().optional(),
  })
  .superRefine((env, ctx) => {
    // The Mongo host is only read from MONGO_HOST_NAME when running in a
    // container; require it in that case so we don't silently connect nowhere.
    if (env.ENV === "CONTAINER" && !env.MONGO_HOST_NAME) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["MONGO_HOST_NAME"],
        message: "MONGO_HOST_NAME is required when ENV=CONTAINER",
      });
    }
  });

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  console.error("Invalid environment configuration - fix these variables:");
  for (const issue of parsed.error.issues) {
    const key = issue.path.join(".") || "(root)";
    console.error(`  - ${key}: ${issue.message}`);
  }
  process.exit(1);
}

const env = parsed.data;
const mongoHost =
  env.ENV === "CONTAINER" ? (env.MONGO_HOST_NAME as string) : "localhost";

const databaseOptions: DatabaseOptions = {
  username: env.MONGO_ROOT_USER,
  password: env.MONGO_ROOT_PASSWORD,
  url: mongoHost,
  port: env.MONGO_INTERNAL_PORT,
  dbName: env.MONGO_DATABASE,
  dbOptions: env.MONGO_OPTIONS,
};

const rawCommandOptions: RawCommandOptions = {
  prefix: env.PREFIX,
};

export const config = {
  discordToken: env.DISCORD_TOKEN,
  clientId: env.CLIENT_ID,
  databaseOptions,
  rawCommandOptions,
};
