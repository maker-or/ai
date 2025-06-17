// // convex/attachments.ts

// import { mutation } from "./_generated/server";
// import { v } from "convex/values";

// export const addAttachment = mutation({
//   args: {
//     userId: v.id("users"),
//     chatId: v.id("chats"),
//     fileName: v.string(),
//     fileType: v.string(),
//     fileUrl: v.string(),
//   },
//   handler: async (ctx, args) => {
//     const now = Date.now();
//     return await ctx.db.insert("attachments", {
//       ...args,
//       createdAt: now,
//     });
//   },
// });
