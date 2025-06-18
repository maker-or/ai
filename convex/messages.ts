import { v } from "convex/values";
import { query, mutation, internalMutation } from "./_generated/server";
import { getAuthUserId } from "@convex-dev/auth/server";
import { Id } from "./_generated/dataModel";

export const getMessages = query({
  args: {
    chatId: v.id("chats"),
    branchId: v.optional(v.id("branches")),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return [];

    const chat = await ctx.db.get(args.chatId);
    if (!chat || (chat.userId !== userId && !chat.isShared)) {
      return [];
    }

    if (!args.branchId) {
      // Return main thread messages (no branchId)
      const messages = await ctx.db
        .query("messages")
        .withIndex("by_chat", (q) => q.eq("chatId", args.chatId))
        .filter((q) => q.eq(q.field("isActive"), true))
        .filter((q) => q.eq(q.field("branchId"), undefined))
        .order("asc")
        .collect();

      return messages;
    }

    // Get branch-specific messages
    const branch = await ctx.db.get(args.branchId);
    if (!branch) return [];

    // Get messages up to the branch point (from main thread)
    const branchPoint = await ctx.db.get(branch.fromMessageId);
    if (!branchPoint) return [];

    const beforeBranchMessages = await ctx.db
      .query("messages")
      .withIndex("by_chat", (q) => q.eq("chatId", args.chatId))
      .filter((q) => q.eq(q.field("isActive"), true))
      .filter((q) => q.eq(q.field("branchId"), undefined))
      .filter((q) => q.lte(q.field("createdAt"), branchPoint.createdAt))
      .order("asc")
      .collect();

    // Get messages specific to this branch
    const branchMessages = await ctx.db
      .query("messages")
      .withIndex("by_branch", (q) => q.eq("branchId", args.branchId))
      .filter((q) => q.eq(q.field("isActive"), true))
      .order("asc")
      .collect();

    return [...beforeBranchMessages, ...branchMessages];
  },
});

export const addMessage = mutation({
  args: {
    chatId: v.id("chats"),
    role: v.union(
      v.literal("user"),
      v.literal("assistant"),
      v.literal("system"),
    ),
    content: v.string(),
    parentId: v.optional(v.id("messages")),
    model: v.optional(v.string()),
    branchId: v.optional(v.id("branches")),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    const chat = await ctx.db.get(args.chatId);
    if (!chat || (chat.userId !== userId && !chat.isShared)) {
      throw new Error("Unauthorized");
    }

    const messageId = await ctx.db.insert("messages", {
      chatId: args.chatId,
      role: args.role,
      content: args.content,
      parentId: args.parentId,
      model: args.model,
      isActive: true,
      branchId: args.branchId,
      createdAt: Date.now(),
    });

    return messageId;
  },
});

export const updateMessage = mutation({
  args: {
    messageId: v.id("messages"),
    content: v.string(),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    const message = await ctx.db.get(args.messageId);
    if (!message) throw new Error("Message not found");

    const chat = await ctx.db.get(message.chatId);
    if (!chat || chat.userId !== userId) {
      throw new Error("Unauthorized");
    }

    await ctx.db.patch(args.messageId, {
      content: args.content,
    });
  },
});

export const deleteMessage = mutation({
  args: { messageId: v.id("messages") },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    const message = await ctx.db.get(args.messageId);
    if (!message) throw new Error("Message not found");

    const chat = await ctx.db.get(message.chatId);
    if (!chat || chat.userId !== userId) {
      throw new Error("Unauthorized");
    }

    await ctx.db.patch(args.messageId, { isActive: false });
  },
});

// Streaming session management
export const createStreamingSession = mutation({
  args: {
    chatId: v.id("chats"),
    messageId: v.id("messages"),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    const sessionId = await ctx.db.insert("streamingSessions", {
      chatId: args.chatId,
      messageId: args.messageId,
      userId,
      isActive: true,
      createdAt: Date.now(),
    });

    return sessionId;
  },
});

export const updateStreamingSession = internalMutation({
  args: {
    sessionId: v.id("streamingSessions"),
    chunk: v.string(),
    isComplete: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    const session = await ctx.db.get(args.sessionId);
    if (!session) return;

    if (args.isComplete) {
      await ctx.db.patch(args.sessionId, {
        isActive: false,
        lastChunk: args.chunk,
      });
    } else {
      await ctx.db.patch(args.sessionId, {
        lastChunk: args.chunk,
      });

      // Update the message content with the chunk
      const message = await ctx.db.get(session.messageId);
      if (message) {
        const newContent = (message.content || "") + args.chunk;
        await ctx.db.patch(session.messageId, {
          content: newContent,
        });
      }
    }
  },
});

export const getActiveStreamingSession = query({
  args: { chatId: v.id("chats") },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return null;

    const session = await ctx.db
      .query("streamingSessions")
      .withIndex("by_chat", (q) => q.eq("chatId", args.chatId))
      .filter((q) => q.eq(q.field("userId"), userId))
      .filter((q) => q.eq(q.field("isActive"), true))
      .order("desc")
      .first();

    return session;
  },
});

export const getLastMessageInChat = query({
  args: { chatId: v.id("chats") },
  handler: async (ctx, args) => {
    const messages = await ctx.db
      .query("messages")
      .withIndex("by_chat", (q) => q.eq("chatId", args.chatId))
      .order("desc")
      .collect();
    return messages[0] ?? null;
  },
});
