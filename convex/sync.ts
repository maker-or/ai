import { v } from "convex/values";
import { query, mutation, internalMutation } from "./_generated/server";
import { getAuthUserId } from "@convex-dev/auth/server";
import { Id } from "./_generated/dataModel";

// Real-time sync for multiple instances
export const getSyncState = query({
  args: { chatId: v.id("chats") },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return null;

    const chat = await ctx.db.get(args.chatId);
    if (!chat || (chat.userId !== userId && !chat.isShared)) {
      return null;
    }

    // Get latest sync state
    const syncState = await ctx.db
      .query("syncStates")
      .withIndex("by_chat", (q) => q.eq("chatId", args.chatId))
      .order("desc")
      .first();

    return syncState;
  },
});

export const updateSyncState = mutation({
  args: {
    chatId: v.id("chats"),
    lastMessageId: v.optional(v.id("messages")),
    activeUsers: v.array(v.string()),
    typingUsers: v.array(v.string()),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    const chat = await ctx.db.get(args.chatId);
    if (!chat || chat.userId !== userId) {
      throw new Error("Unauthorized");
    }

    // Update or create sync state
    const existingState = await ctx.db
      .query("syncStates")
      .withIndex("by_chat", (q) => q.eq("chatId", args.chatId))
      .first();

    const syncData = {
      chatId: args.chatId,
      lastMessageId: args.lastMessageId,
      activeUsers: args.activeUsers,
      typingUsers: args.typingUsers,
      lastUpdated: Date.now(),
    };

    if (existingState) {
      await ctx.db.patch(existingState._id, syncData);
      return existingState._id;
    } else {
      return await ctx.db.insert("syncStates", syncData);
    }
  },
});

export const setTypingStatus = mutation({
  args: {
    chatId: v.id("chats"),
    isTyping: v.boolean(),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    const user = await ctx.db.get(userId);
    if (!user) throw new Error("User not found");

    const userName = user.name || user.email || "Anonymous";

    // Get current sync state
    const syncState = await ctx.db
      .query("syncStates")
      .withIndex("by_chat", (q) => q.eq("chatId", args.chatId))
      .first();

    if (syncState) {
      const typingUsers = syncState.typingUsers || [];
      let updatedTypingUsers;

      if (args.isTyping) {
        updatedTypingUsers = [...new Set([...typingUsers, userName])];
      } else {
        updatedTypingUsers = typingUsers.filter(name => name !== userName);
      }

      await ctx.db.patch(syncState._id, {
        typingUsers: updatedTypingUsers,
        lastUpdated: Date.now(),
      });
    }
  },
});
