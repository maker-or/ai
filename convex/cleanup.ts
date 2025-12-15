import { mutation } from "./_generated/server";

export const cleanupOrphanedAuthData = mutation({
  handler: async (ctx) => {
    // Clean up refresh tokens for sessions that no longer exist
    const refreshTokens = await ctx.db.query("authRefreshTokens").collect();
    for (const token of refreshTokens) {
      const session = await ctx.db.get(token.sessionId);
      if (!session) {
        await ctx.db.delete(token._id);
      }
    }
    
    // Clean up verifiers for sessions that no longer exist
    const verifiers = await ctx.db.query("authVerifiers").collect();
    for (const verifier of verifiers) {
      if (verifier.sessionId) {
        const session = await ctx.db.get(verifier.sessionId);
        if (!session) {
          await ctx.db.delete(verifier._id);
        }
      }
    }
    
    return { success: true };
  },
});
