/** Role values must match frontend `UserRole` type: lowercase strings. */
export const UserRole = {
  ADMIN: "admin",
  RECRUITER: "recruiter",
  CANDIDATE: "candidate",
} as const;

export type UserRole = (typeof UserRole)[keyof typeof UserRole];

export const UserRoleValues = ["admin", "recruiter", "candidate"] as const;

export const ALL_ROLES = ["admin", "recruiter", "candidate"] as const;
