"use node";

import { v } from "convex/values";
import { action } from "./_generated/server";
import { api, internal } from "./_generated/api";
import { getAuthUserId } from "@convex-dev/auth/server";
import OpenAI from "openai";
import Exa from "exa-js";

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
    console.log(`🚀 streamChatCompletion called with webSearch=${args.webSearch}`);
    console.log(`📝 Full args received:`, JSON.stringify(args, null, 2));
    
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
      throw new Error(
        "OpenRouter API key is required. Please add your API key in settings.",
      );
    }

    // Validate API key format
    if (!openRouterKey.startsWith("sk-")) {
      throw new Error(
        "Invalid OpenRouter API key format. Key should start with 'sk-'",
      );
    }

    const prompt = await ctx.runQuery(api.users.getPrompt, {});

    console.log(`🔍 Web search requested: ${args.webSearch}`);

    // Optionally augment with web search
    if (args.webSearch) {
      console.log("🌐 Starting web search process...");
      const userMessage = args.messages.find((m) => m.role === "user");
      if (userMessage) {
        try {
          // Check if EXA_API_KEY is available
          const exaApiKeyValue = process.env.EXA_API_KEY;
          console.log("EXA_API_KEY status:", exaApiKeyValue ? "Available" : "Missing");
          
          if (!exaApiKeyValue) {
            throw new Error(
              "EXA_API_KEY environment variable is required for web search",
            );
          }

          console.log("Starting web search for:", userMessage.content.substring(0, 100) + "...");
          
          const exa = new Exa(exaApiKeyValue);
          console.log("Exa client created successfully");
          
          const response = await exa.searchAndContents(userMessage.content, {
            type: "neural",
            numResults: 3,
            text: true,
            highlights: {
              numSentences: 3,
              query: userMessage.content
            }
          });
          console.log("Exa search completed successfully");
          
          console.log("Web search response received:", {
            resultsCount: response.results?.length || 0,
            autopromptString: response.autopromptString
          });

          let searchResults = "";
          if (response.results && response.results.length > 0) {
            searchResults = response.results
              .map((r: any, i: number) => {
                const content = r.text || r.highlights?.join(" ") || r.snippet || "No content available";
                const title = r.title || "Untitled";
                const url = r.url || "No URL";
                return `## Result ${i + 1}: ${title}\nURL: ${url}\nContent: ${content}`;
              })
              .join("\n\n");
          } else {
            searchResults = "No relevant web search results found.";
          }

          // Add web search context to messages
          args.messages = [
            ...args.messages,
            {
              role: "system",
              content: `Web search results for "${userMessage.content}":\n\n${searchResults}\n\nPlease use this information to provide a comprehensive answer.`,
            },
          ];
          
          console.log("Web search results added to context successfully");
          
        } catch (error) {
          console.error("Web search error:", error);
          console.error("Error details:", {
            message: error instanceof Error ? error.message : "Unknown error",
            stack: error instanceof Error ? error.stack : undefined,
            name: error instanceof Error ? error.name : undefined,
          });
          const errorMessage = error instanceof Error ? error.message : "Unknown error";
          
          args.messages = [
            ...args.messages,
            {
              role: "system",
              content: `Web search failed (${errorMessage}). Proceeding without search results.`,
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
        webSearchUsed: args.webSearch, // Track if web search was used
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
        defaultHeaders: {
          "HTTP-Referer": "https://localhost:3000", // Optional: for OpenRouter analytics
          "X-Title": "AI Chat App", // Optional: for OpenRouter analytics
        },
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

      console.log("OpenAI response created successfully");

      let fullContent = "";
      let tokenCount = 0;

      try {
        console.log("Starting stream iteration");
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
        console.log("Stream iteration completed successfully");
      } catch (streamError) {
        console.error("Streaming error:", streamError);
        throw new Error(
          `Streaming failed: ${streamError instanceof Error ? streamError.message : "Unknown streaming error"}`,
        );
      }

      // Mark streaming as complete
      await ctx.runMutation(internal.messages.updateStreamingSession, {
        sessionId,
        chunk: "",
        isComplete: true,
      });

      // Update final message content
      if (fullContent) {
        await ctx.runMutation(api.messages.updateMessage, {
          messageId: assistantMessageId,
          content: fullContent,
        });
      }

      // Complete resumable stream
      await ctx.runMutation(internal.resumable.completeStreamInternal, {
        streamId,
      });

      return assistantMessageId;
    } catch (error) {
      console.error("AI streaming error:", error);

      // Update message with error
      await ctx.runMutation(api.messages.updateMessage, {
        messageId: assistantMessageId,
        content: `Error: ${error instanceof Error ? error.message : "Unknown error"}`,
      });

      // Complete stream with error
      await ctx.runMutation(internal.resumable.completeStreamInternal, {
        streamId,
      });

      // Provide more detailed error information
      if (error instanceof Error) {
        throw new Error(`Chat completion failed: ${error.message}`);
      } else {
        throw new Error("Chat completion failed with unknown error");
      }
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
