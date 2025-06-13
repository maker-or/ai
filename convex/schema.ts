import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";
import { authTables } from "@convex-dev/auth/server";

const applicationTables = {
  chats: defineTable({
    title: v.string(),
    userId: v.id("users"),
    model: v.string(),
    systemPrompt: v.optional(v.string()),
    isShared: v.optional(v.boolean()),
    shareId: v.optional(v.string()),
    createdAt: v.number(),
    updatedAt: v.number(),
    pinned: v.boolean(),
  })
    .index("by_user", ["userId"])
    .index("by_share_id", ["shareId"])
    .searchIndex("search_title", {
      searchField: "title",
      filterFields: ["userId"],
    }),

  users: defineTable({
    email: v.optional(v.string()),
    emailVerificationTime: v.optional(v.float64()),
    image: v.optional(v.string()),
    name: v.optional(v.string()),
    prompt: v.optional(v.string()),
    encryptedApiKey: v.optional(v.string()),
  }).index("email", ["email"]),

  messages: defineTable({
    chatId: v.id("chats"),
    role: v.union(
      v.literal("user"),
      v.literal("assistant"),
      v.literal("system"),
    ),
    content: v.string(),
    parentId: v.optional(v.id("messages")),
    model: v.optional(v.string()),
    isActive: v.boolean(),
    branchId: v.optional(v.id("branches")),
    createdAt: v.number(),
  })
    .index("by_chat", ["chatId"])
    .index("by_chat_and_parent", ["chatId", "parentId"])
    .index("by_parent", ["parentId"])
    .index("by_branch", ["branchId"]),

  streamingSessions: defineTable({
    chatId: v.id("chats"),
    messageId: v.id("messages"),
    userId: v.id("users"),
    isActive: v.boolean(),
    lastChunk: v.optional(v.string()),
    createdAt: v.number(),
  })
    .index("by_chat", ["chatId"])
    .index("by_message", ["messageId"])
    .index("by_user", ["userId"]),

  // New tables for advanced features
  syncStates: defineTable({
    chatId: v.id("chats"),
    lastMessageId: v.optional(v.id("messages")),
    activeUsers: v.array(v.string()),
    typingUsers: v.array(v.string()),
    lastUpdated: v.number(),
  }).index("by_chat", ["chatId"]),

  branches: defineTable({
    chatId: v.id("chats"),
    fromMessageId: v.id("messages"),
    name: v.string(),
    isActive: v.boolean(),
    createdAt: v.number(),
  })
    .index("by_chat", ["chatId"])
    .index("by_message", ["fromMessageId"]),

  resumableStreams: defineTable({
    chatId: v.id("chats"),
    messageId: v.id("messages"),
    userId: v.id("users"),
    model: v.string(),
    messages: v.array(
      v.object({
        role: v.union(
          v.literal("user"),
          v.literal("assistant"),
          v.literal("system"),
        ),
        content: v.string(),
      }),
    ),
    checkpoint: v.string(),
    isActive: v.boolean(),
    isPaused: v.boolean(),
    progress: v.number(),
    totalTokens: v.number(),
    createdAt: v.number(),
    lastResumed: v.number(),
    lastPaused: v.optional(v.number()),
    lastUpdated: v.optional(v.number()),
    completedAt: v.optional(v.number()),
  })
    .index("by_chat", ["chatId"])
    .index("by_user", ["userId"])
    .index("by_message", ["messageId"]),
};

export default defineSchema({
  ...authTables,
  ...applicationTables,
});
