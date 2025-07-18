// Test web search functionality directly
"use node";

import { v } from "convex/values";
import { action } from "./_generated/server";
import Exa from "exa-js";

export const testWebSearch = action({
  args: {
    query: v.string(),
  },
  handler: async (ctx, args) => {
    try {
      console.log("🧪 Testing web search with query:", args.query);
      
      // Check if EXA_API_KEY is available
      const exaApiKeyValue = process.env.EXA_API_KEY;
      if (!exaApiKeyValue) {
        throw new Error("EXA_API_KEY environment variable is required for web search");
      }
      
      console.log("✅ EXA API key found");
      
      const exa = new Exa(exaApiKeyValue);
      const response = await exa.searchAndContents(args.query, {
        type: "neural",
        numResults: 2,
        text: true,
        highlights: {
          numSentences: 2,
          query: args.query
        }
      });
      
      console.log("🔍 Web search response:", {
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
            return `## Result ${i + 1}: ${title}\nURL: ${url}\nContent: ${content.substring(0, 300)}...`;
          })
          .join("\n\n");
      } else {
        searchResults = "No relevant web search results found.";
      }
      
      return {
        success: true,
        query: args.query,
        resultsCount: response.results?.length || 0,
        searchResults
      };
      
    } catch (error) {
      console.error("❌ Web search test failed:", error);
      return {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error"
      };
    }
  },
});
