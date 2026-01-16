import type { AuthClient } from "../../types";

export const mockAuthClient: AuthClient = {
  getSession: async () => ({ data: { user: { id: "1", name: "Test User", email: "test@example.com" } } }),
  signIn: {
    social: async () => {
      console.log("Sign in triggered");
    },
  },
  linkSocial: async () => {
    console.log("Link social triggered");
  },
  signOut: async () => {
    console.log("Sign out triggered");
  },
};

