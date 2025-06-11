import { v } from "convex/values";
import { query, mutation, internalMutation } from "./_generated/server";
import { getAuthUserId } from "@convex-dev/auth/server";
import { Id } from "./_generated/dataModel";

export const listChats = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return [];

    const chats = await ctx.db
      .query("chats")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .order("desc")
      .collect();

    return chats;
  },
});

export const getChat = query({
  args: { chatId: v.id("chats") },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    const chat = await ctx.db.get(args.chatId);
    
    if (!chat) return null;
    
    // Check if user owns the chat or if it's shared
    if (chat.userId !== userId && !chat.isShared) {
      return null;
    }

    return chat;
  },
});

export const getChatByShareId = query({
  args: { shareId: v.string() },
  handler: async (ctx, args) => {
    const chat = await ctx.db
      .query("chats")
      .withIndex("by_share_id", (q) => q.eq("shareId", args.shareId))
      .unique();

    if (!chat || !chat.isShared) return null;
    return chat;
  },
});

export const createChat = mutation({
  args: {
    title: v.string(),
    model: v.string(),
    systemPrompt: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    const now = Date.now();
    const chatId = await ctx.db.insert("chats", {
      title: args.title,
      userId,
      model: args.model,
      systemPrompt: args.systemPrompt,
      createdAt: now,
      updatedAt: now,
    });

    return chatId;
  },
});

export const updateChat = mutation({
  args: {
    chatId: v.id("chats"),
    title: v.optional(v.string()),
    model: v.optional(v.string()),
    systemPrompt: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    const chat = await ctx.db.get(args.chatId);
    if (!chat || chat.userId !== userId) {
      throw new Error("Chat not found or unauthorized");
    }

    const updates: any = { updatedAt: Date.now() };
    if (args.title !== undefined) updates.title = args.title;
    if (args.model !== undefined) updates.model = args.model;
    if (args.systemPrompt !== undefined) updates.systemPrompt = args.systemPrompt;

    await ctx.db.patch(args.chatId, updates);
  },
});

export const shareChat = mutation({
  args: { chatId: v.id("chats") },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    const chat = await ctx.db.get(args.chatId);
    if (!chat || chat.userId !== userId) {
      throw new Error("Chat not found or unauthorized");
    }

    const shareId = crypto.randomUUID();
    await ctx.db.patch(args.chatId, {
      isShared: true,
      shareId,
      updatedAt: Date.now(),
    });

    return shareId;
  },
});

export const deleteChat = mutation({
  args: { chatId: v.id("chats") },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    const chat = await ctx.db.get(args.chatId);
    if (!chat || chat.userId !== userId) {
      throw new Error("Chat not found or unauthorized");
    }

    // Delete all messages in the chat
    const messages = await ctx.db
      .query("messages")
      .withIndex("by_chat", (q) => q.eq("chatId", args.chatId))
      .collect();

    for (const message of messages) {
      await ctx.db.delete(message._id);
    }

    // Delete streaming sessions
    const sessions = await ctx.db
      .query("streamingSessions")
      .withIndex("by_chat", (q) => q.eq("chatId", args.chatId))
      .collect();

    for (const session of sessions) {
      await ctx.db.delete(session._id);
    }

    await ctx.db.delete(args.chatId);
  },
});

export const searchChats = query({
  args: { query: v.string() },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return [];

    const chats = await ctx.db
      .query("chats")
      .withSearchIndex("search_title", (q) =>
        q.search("title", args.query).eq("userId", userId)
      )
      .take(20);

    return chats;
  },
});
