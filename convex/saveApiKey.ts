import { mutation, query } from "./_generated/server";
import { v } from "convex/values";
import { getAuthUserId } from "@convex-dev/auth/server";
import forge from "node-forge";
import { Id } from "./_generated/dataModel";

const key = forge.random.getBytesSync(16);
const iv = forge.random.getBytesSync(8);

export const saveApiKey = mutation({
  args: {
    apiKey: v.string(),
  },
  handler: async (ctx, args) => {
    const userIdString = await getAuthUserId(ctx);
    if (!userIdString) return false;

    const userId = userIdString as Id<"users">;

    const cipher = forge.rc2.createEncryptionCipher(key);
    cipher.start(iv);
    cipher.update(forge.util.createBuffer(args.apiKey));
    cipher.finish();
    const encrypted = cipher.output.getBytes();
    console.log(encrypted);

    await ctx.db.patch(userId, {
      encryptedApiKey: encrypted,
    });

    return true;
  },
});

export const getkey = query({
  args: {},
  handler: async (ctx) => {
    const userIdString = await getAuthUserId(ctx);
    if (!userIdString) return null;

    const userId = userIdString as Id<"users">;
    const user = await ctx.db.get(userId);

    const encryptedApiKey = user?.encryptedApiKey;
    if (!encryptedApiKey) return null; // Handle undefined

    const decipher = forge.rc2.createDecryptionCipher(key);
    decipher.start(iv);
    decipher.update(forge.util.createBuffer(encryptedApiKey));
    decipher.finish();
    const decrypted = decipher.output.getBytes();

    return decrypted;
  },
});
