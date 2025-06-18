import { mutation, query } from "./_generated/server";
import { v } from "convex/values";
import { getAuthUserId } from "@convex-dev/auth/server";
import forge from "node-forge";
import { Id } from "./_generated/dataModel";



export const saveApiKey = mutation({
  args: {
    apiKey: v.string(),
  },
  handler: async (ctx, args) => {
    const userIdString = await getAuthUserId(ctx);
    if (!userIdString) return false;

    const userId = userIdString as Id<"users">;



    await ctx.db.patch(userId, {
      encryptedApiKey: args.apiKey,
    });

    return true;
  },
});

export const getkey = query({
  args: {},
  handler: async (ctx) => {
    const userIdString = await getAuthUserId(ctx);
    if (!userIdString) return null;

    const userId = userIdString as Id<"users">;
    const user = await ctx.db.get(userId);

    const encryptedApiKey = user?.encryptedApiKey;
    if (!encryptedApiKey) return null; // Handle undefined

 

    return encryptedApiKey;
  },
});
