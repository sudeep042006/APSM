// ── Role Routing ─────────────────────────────────────────────────────
// One place that answers "where does this user belong?".
//
// Before this existed the destination was hardcoded as /dashboard/youtube in
// four different files, so a creator who signed in landed on an analytics page
// they have no connected accounts for, and /creator-preview was reachable by
// anyone at all. Both the post-auth redirect and the router's index route now
// read from here, so they cannot drift apart.

export const ROLES = {
  ADMIN: "admin",
  CREATOR: "creator",
};

/** Where each role lands after signing in or registering. */
export const ROLE_HOME = {
  [ROLES.ADMIN]: "/dashboard",
  [ROLES.CREATOR]: "/creator",
};

/**
 * The landing route for a user. Falls back to the admin dashboard for anyone
 * with no readable role rather than rendering nothing — the API is still the
 * authority on what they may actually call.
 */
export const homeForRole = (role) => ROLE_HOME[String(role || "").toLowerCase()] || ROLE_HOME[ROLES.ADMIN];

/** True when `role` is in `allowed` (an empty/absent allow-list means any role). */
export const hasRole = (role, allowed) => {
  if (!allowed || allowed.length === 0) return true;
  return allowed.includes(String(role || "").toLowerCase());
};

// ── Signup role selector options ────────────────────────────────────
// Rendered on the register form. Each explains what the role actually gets,
// because "admin" is not self-explanatory and it is the choice that decides
// which dashboard the account lands on.
export const SIGNUP_ROLE_OPTIONS = [
  {
    value: ROLES.CREATOR,
    label: "Creator",
    summary: "Submit content for an admin to review and publish.",
    points: ["Submit drafts to the review queue", "Track approval status", "Read reviewer feedback"],
  },
  {
    value: ROLES.ADMIN,
    label: "Admin",
    summary: "Run the workspace: analytics, publishing and review.",
    points: ["All platform analytics", "Cross-post and approve submissions", "Manage linked accounts"],
  },
];