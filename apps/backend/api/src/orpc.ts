import { os } from "@orpc/server";
import type { User } from "better-auth";
import type { Session } from "better-auth";

export const errors = {
  UNAUTHORIZED: {
    message: "Unauthorized",
    status: 401,
  },
  BAD_REQUEST: {
    message: "Bad request",
    status: 400,
  },
  FORBIDDEN: {
    message: "Forbidden",
    status: 403,
  },
  NOT_FOUND: {
    message: "Not found",
    status: 404,
  },
  INTERNAL_SERVER_ERROR: {
    message: "Internal server error",
    status: 500,
  },
  NO_DATA: {
    message: "No data",
    status: 204,
  },
};

export const orpc = os
  .$context<{
    headers: Headers;
    user:
      | (User & {
          role: string;
          permissions: string[];
          banned: boolean;
          banReason: string | null;
          bannedAt: Date | null;
        })
      | null;
    session: Session | null;
    clientIp?: string;
    clientUserAgent?: string;
  }>()
  .errors(errors);
