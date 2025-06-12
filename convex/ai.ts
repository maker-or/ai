"use node";

import { v } from "convex/values";
import { action } from "./_generated/server";
import { api, internal } from "./_generated/api";
import { getAuthUserId } from "@convex-dev/auth/server";
import OpenAI from "openai";

// Use OpenRouter for all models
const getOpenRouterClient = () => {
  const openRouterKey = process.env.OPENROUTER_API_KEY;
  if (!openRouterKey) {
    throw new Error("OPENROUTER_API_KEY environment variable is required");
  }

  return new OpenAI({
    baseURL: "https://openrouter.ai/api/v1",
    apiKey: openRouterKey,
  });
};

export const streamChatCompletion = action({
  args: {
    chatId: v.id("chats"),
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
    model: v.string(),
    parentMessageId: v.optional(v.id("messages")),
    branchId: v.optional(v.id("branches")),
  },
  handler: async (ctx, args): Promise<any> => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");
    const prompt = await ctx.runQuery(api.users.getPrompt, {});

    // Create assistant message
    const assistantMessageId: any = await ctx.runMutation(
      api.messages.addMessage,
      {
        chatId: args.chatId,
        role: "assistant",
        content: "",
        parentId: args.parentMessageId,
        model: args.model,
        branchId: args.branchId,
      },
    );

    // Create resumable stream
    const streamId = await ctx.runMutation(
      internal.resumable.createResumableStream,
      {
        chatId: args.chatId,
        messageId: assistantMessageId,
        model: args.model,
        messages: args.messages,
      },
    );

    // Create streaming session
    const sessionId = await ctx.runMutation(
      api.messages.createStreamingSession,
      {
        chatId: args.chatId,
        messageId: assistantMessageId,
      },
    );

    try {
      const client = getOpenRouterClient();

      const response = await client.chat.completions.create({
        model: args.model,
        messages: [{ role: "system", content: prompt }, ...args.messages],
        stream: true,
        temperature: 0.7,
        max_tokens: 4096,
      });

      let fullContent = "";
      let tokenCount = 0;

      for await (const chunk of response) {
        const content = chunk.choices?.[0]?.delta?.content;

        if (content) {
          fullContent += content;
          tokenCount++;

          // Update streaming session
          await ctx.runMutation(internal.messages.updateStreamingSession, {
            sessionId,
            chunk: content,
          });

          // Update resumable stream progress
          const progress = Math.min((tokenCount / 100) * 100, 99); // Estimate progress
          await ctx.runMutation(internal.resumable.updateStreamProgress, {
            streamId,
            progress,
            checkpoint: fullContent,
            tokens: tokenCount,
          });
        }
      }

      // Mark streaming as complete
      await ctx.runMutation(internal.messages.updateStreamingSession, {
        sessionId,
        chunk: "",
        isComplete: true,
      });

      // Complete resumable stream
      await ctx.runMutation(internal.resumable.completeStreamInternal, {
        streamId,
      });

      return assistantMessageId;
    } catch (error) {
      // Update message with error
      await ctx.runMutation(api.messages.updateMessage, {
        messageId: assistantMessageId,
        content: `Error: ${error instanceof Error ? error.message : "Unknown error"}`,
      });

      // Complete stream with error
      await ctx.runMutation(internal.resumable.completeStreamInternal, {
        streamId,
      });

      throw error;
    }
  },
});

export const getAvailableModels = action({
  args: {},
  handler: async () => {
    // Return only the two supported models
    return [
      {
        id: "nvidia/llama-3.3-nemotron-super-49b-v1:free",
        name: "Llama 3.3 Nemotron",
        description: "Advanced open-source model by NVIDIA",
      },
      {
        id: "deepseek/deepseek-chat-v3-0324:free",
        name: "DeepSeek Chat",
        description: "Fast reasoning model by DeepSeek",
      },
    ];
  },
});
