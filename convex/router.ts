import { httpRouter } from "convex/server";
import { httpAction } from "./_generated/server";
import { api } from "./_generated/api";

const http = httpRouter();

// Example API endpoint
http.route({
  path: "/api/health",
  method: "GET",
  handler: httpAction(async (ctx, req) => {
    return new Response(JSON.stringify({ status: "ok", timestamp: Date.now() }), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
      },
    });
  }),
});

// Shared chat endpoint
http.route({
  path: "/api/shared/:shareId",
  method: "GET",
  handler: httpAction(async (ctx, req) => {
    const url = new URL(req.url);
    const shareId = url.pathname.split('/').pop();
    
    if (!shareId) {
      return new Response("Share ID required", { status: 400 });
    }

    try {
      const chat = await ctx.runQuery(api.chats.getChatByShareId, { shareId });
      
      if (!chat) {
        return new Response("Chat not found", { status: 404 });
      }

      return new Response(JSON.stringify(chat), {
        status: 200,
        headers: {
          "Content-Type": "application/json",
        },
      });
    } catch (error) {
      return new Response("Internal server error", { status: 500 });
    }
  }),
});

export default http;
