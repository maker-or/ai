"use node";

import { v } from "convex/values";
import { action } from "./_generated/server";
import { api, internal } from "./_generated/api";
import { getAuthUserId } from "@convex-dev/auth/server";
import OpenAI from "openai";

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
    webSearch: v.optional(v.boolean()),
  },
  handler: async (ctx, args): Promise<any> => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");
    
    // Get user's stored API key
    const decryptedKey = await ctx.runQuery(api.saveApiKey.getkey, {});

    let openRouterKey = decryptedKey || "";
    
    // Fallback to environment variable if no user key is stored
    if (!openRouterKey) {
      openRouterKey = process.env.OPENROUTER_API_KEY || "";
    }
    
    if (!openRouterKey) {
      throw new Error("OpenRouter API key is required. Please add your API key in settings.");
    }
    
    const prompt = await ctx.runQuery(api.users.getPrompt, {});

    // Optionally augment with web search
    if (args.webSearch) {
      const userMessage = args.messages.find((m) => m.role === "user");
      if (userMessage) {
        try {
          // Only require and instantiate Exa if needed
          const { Exa } = await import("exa-js");
          const exaApiKey =
            process.env.EXA_API_KEY || process.env.EXASEARCH_API_KEY || "";
          if (!exaApiKey)
            throw new Error(
              "EXA_API_KEY or EXASEARCH_API_KEY environment variable is required",
            );
          const exa = new Exa(exaApiKey);

          const response = await exa.searchAndContents(userMessage.content, {
            type: "neural",
            numResults: 5,
            text: true,
          });
          const searchResults =
            response.results
              ?.map(
                (r: any, i: number) =>
                  `Result ${i + 1}: ${r.text || r.snippet || ""}`,
              )
              .join("\n\n") || "No results found.";

          args.messages = [
            ...args.messages,
            {
              role: "system",
              content: `Web search results:\n${searchResults}`,
            },
          ];
        } catch (error) {
          console.error("Web search error:", error);
          args.messages = [
            ...args.messages,
            {
              role: "system",
              content: "Web search failed. Proceeding without search results.",
            },
          ];
        }
      } else {
        console.error("No user content found for web search.");
      }
    }

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
      // OpenRouter client - use the retrieved API key
      const client = new OpenAI({
        baseURL: "https://openrouter.ai/api/v1",
        apiKey: openRouterKey,
      });

      const allMessages = [...args.messages];
      if (prompt) {
        allMessages.unshift({ role: "system", content: prompt });
      }

      const response = await client.chat.completions.create({
        model: args.model,
        messages: allMessages,
        stream: true,
        temperature: 0.7,
        max_tokens: 4096,
      });

      let fullContent = "";
      let tokenCount = 0;

      for await (const chunk of response as any) {
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

      {
        id: "openai/gpt-4.1",
        name: "GPT-4.1",
        description: "Advanced open-source model by openai",
      },
      {
        id: "anthropic/claude-sonnet-4",
        name: "claude-sonnet-4",
        description: "Advanced open-source model by openai",
      },
    ];
  },
});
