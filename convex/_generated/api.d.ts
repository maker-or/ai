/* eslint-disable */
/**
 * Generated `api` utility.
 *
 * THIS CODE IS AUTOMATICALLY GENERATED.
 *
 * To regenerate, run `npx convex dev`.
 * @module
 */

import type {
  ApiFromModules,
  FilterApi,
  FunctionReference,
} from "convex/server";
import type * as ai from "../ai.js";
import type * as auth from "../auth.js";
import type * as branches from "../branches.js";
import type * as chats from "../chats.js";
import type * as cleanup from "../cleanup.js";
import type * as http from "../http.js";
import type * as messages from "../messages.js";
import type * as parseNestedJson from "../parseNestedJson.js";
import type * as resumable from "../resumable.js";
import type * as router from "../router.js";
import type * as saveApiKey from "../saveApiKey.js";
import type * as sync from "../sync.js";
import type * as test from "../test.js";
import type * as testWebSearch from "../testWebSearch.js";
import type * as transfer from "../transfer.js";
import type * as users from "../users.js";

/**
 * A utility for referencing Convex functions in your app's API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = api.myModule.myFunction;
 * ```
 */
declare const fullApi: ApiFromModules<{
  ai: typeof ai;
  auth: typeof auth;
  branches: typeof branches;
  chats: typeof chats;
  cleanup: typeof cleanup;
  http: typeof http;
  messages: typeof messages;
  parseNestedJson: typeof parseNestedJson;
  resumable: typeof resumable;
  router: typeof router;
  saveApiKey: typeof saveApiKey;
  sync: typeof sync;
  test: typeof test;
  testWebSearch: typeof testWebSearch;
  transfer: typeof transfer;
  users: typeof users;
}>;
export declare const api: FilterApi<
  typeof fullApi,
  FunctionReference<any, "public">
>;
export declare const internal: FilterApi<
  typeof fullApi,
  FunctionReference<any, "internal">
>;
