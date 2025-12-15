import { mutation } from "./_generated/server";
import { Id } from "./_generated/dataModel";

export const transferChatsToCurrentUser = mutation({
  handler: async (ctx) => {
    // Hardcoded current user ID for this transfer operation
    const currentUserId = "k979b6aa0kwm7p139j2qez7fh57qd735" as Id<"users">;

    // Transfer chats from old users to current user
    const oldUserIds = [
      "k97cb1x8ec0541c31k9kje9pvh7j3z2r",
      "k974jrpdd2x2wp0e2es3a6750h7j30fs",
    ] as Id<"users">[];

    let transferredCount = 0;

    for (const oldUserId of oldUserIds) {
      const chats = await ctx.db
        .query("chats")
        .withIndex("by_user", (q) => q.eq("userId", oldUserId))
        .collect();

      for (const chat of chats) {
        await ctx.db.patch(chat._id, { userId: currentUserId });
        transferredCount++;
      }
    }

    return { success: true, transferredChats: transferredCount };
  },
});
