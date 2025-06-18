import { convexAuth, getAuthUserId } from "@convex-dev/auth/server";
import GitHub from "@auth/core/providers/github";
import { query } from "./_generated/server";

export const { auth, signIn, signOut, store, isAuthenticated } = convexAuth({
  providers: [GitHub],

});

export const loggedInUser = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    return userId ? await ctx.db.get(userId) : null;
  },
});
