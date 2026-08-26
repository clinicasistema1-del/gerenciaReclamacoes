import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { nextCookies } from "better-auth/next-js";
import { prisma } from "@/lib/prisma";

export const auth = betterAuth({
  database: prismaAdapter(prisma, {
    provider: "postgresql",
  }),
  baseURL: process.env.BETTER_AUTH_URL || process.env.NEXT_PUBLIC_APP_URL,
  trustedOrigins: [
    "https://www.sorriagrc.com.br",
    "https://sorriagrc.com.br",
    "http://localhost:3000",
  ],
  emailAndPassword: {
    enabled: true,
    minPasswordLength: 5,
  },
  user: {
    additionalFields: {
      role: {
        type: "string",
        required: true,
        defaultValue: "PADRAO",
        input: false,
      },
      cargo: {
        type: "string",
        required: false,
        input: false,
      },
      clinicId: {
        type: "string",
        required: false,
        input: true,
      },
      active: {
        type: "boolean",
        required: false,
        defaultValue: true,
        input: false,
      },
    },
  },
  plugins: [nextCookies()],
});

export type Session = typeof auth.$Infer.Session;
