// "use node";
// import { setDefaultOpenAIClient } from "@openai/agents";
// import { z } from "zod";
// import subjects from "../src/syllabus.json";
// import { setOpenAIAPI } from "@openai/agents";
// import { AgentOutputSchema } from "../src/SlidesSchema";
// import Exa from "exa-js";
// import OpenAI from "openai";
// import { api } from "./_generated/api";
// import { getEmbedding } from "../src/utils/embeddings";
// import { Pinecone } from "@pinecone-database/pinecone";

// import { v } from "convex/values";
// import { action } from "./_generated/server";
// import { getAuthUserId } from "@convex-dev/auth/server";
// import { Agent } from "@mastra/core/agent";
// import { createOpenRouter } from "@openrouter/ai-sdk-provider";
// import { createTool } from "@mastra/core/tools";

// export const mastra = action({
//   args: {
//     chatId: v.id("chats"),
//     messages: v.string(),
//     parentMessageId: v.optional(v.id("messages")),
//   },
//   handler: async (ctx, args): Promise<any> => {
//     const userId = await getAuthUserId(ctx);
//     if (!userId) throw new Error("Not authenticated");
//     console.log(
//       "this is from the agent the message i have recived is",
//       args.messages,
//     );

//     // const model = aisdk(openai("o4-mini"));

//     console.log("Calling api.saveApiKey.getkey");
//     // const decryptedKey = await ctx.runQuery(api.saveApiKey.getkey, {});

//     // let openRouterKey = decryptedKey || "";

//     // Fallback to environment variable if no user key is stored

//     const openRouterKey = process.env.OPENROUTER_API_KEY || "";

//     if (!openRouterKey) {
//       throw new Error(
//         "OpenRouter API key is required. Please add your API key in settings.",
//       );
//     }

//     // Validate API key format
//     if (!openRouterKey.startsWith("sk-")) {
//       throw new Error(
//         "Invalid OpenRouter API key format. Key should start with 'sk-'",
//       );
//     }

//     const openrouter = createOpenRouter({
//       apiKey: process.env.OPENROUTER_API_KEY,
//     });

//     // Create assistant message
//     const assistantMessageId: any = await ctx.runMutation(
//       api.messages.addMessage,
//       {
//         chatId: args.chatId,
//         role: "assistant",
//         content: "",
//         parentId: args.parentMessageId,
//       },
//     );

//     const _token = process.env["GITHUB_TOKEN"];
//     const _endpoint = "https://models.github.ai/inference";

//     const client = new OpenAI({
//       baseURL: "https://openrouter.ai/api/v1/chat/completions",
//       apiKey: openRouterKey,
//       defaultHeaders: {
//         "HTTP-Referer": "https://sphereai.in/", // Optional: for OpenRouter analytics
//         "X-Title": "sphereai.in",
//       },
//     });

//     //openAI
//     // const via_github = new OpenAI({ baseURL: endpoint, apiKey: token });
//     //alreting the openAI sdk to make sure that it uses openrouter models intsead of openAi models
//     setDefaultOpenAIClient(client);
//     setOpenAIAPI("chat_completions");
//     // for vector search using pinecone
//     if (!process.env.PINECONE_API_KEY) {
//       throw new Error("Pinecone API key is required");
//     }

//     const PineconeClient = new Pinecone({
//       apiKey: process.env.PINECONE_API_KEY,
//     });
//     //index name where vector similarity will search
//     const index = PineconeClient.index("docling");

//     //defining the schema for the output for the llm tools
//     //*****************************************************************************************************************************
//     const GetCodeSchema = z.object({
//       language: z
//         .string()
//         .describe(
//           "it is used to specify the programming language that the actual code must be in ",
//         ),
//       code: z
//         .string()
//         .min(10)
//         .describe("it contain the actaul code in the described language"),
//       explanation: z
//         .string()
//         .describe("it contains the explanation of the code"),
//     });

//     const TestQuestionSchema = z.object({
//       questions: z.array(
//         z.object({
//           question: z
//             .string()
//             .describe("this usually contains the actual question"),
//           options: z
//             .array(z.string())
//             .length(4)
//             .describe(
//               "thse usually consist of 4 options which are dispayed with the corressponding question",
//             ),
//           answer: z
//             .string()
//             .describe(
//               "this usually contain the the correct answer or the option corresponding to that particular question",
//             ),
//         }),
//       ),
//     });

//     const FlashcardSchema = z.object({
//       flashcards: z.array(
//         z.object({
//           front: z
//             .string()
//             .describe(
//               "this usually consists of a question or concept that is displayed at the front of a flashcard",
//             ), // question/concept
//           back: z
//             .string()
//             .describe(
//               "this usually consists of a summary or explanation that is displayed at the back of a flashcard",
//             ), // summary/explanation
//         }),
//       ),
//     });
//     //************************************************************************************************************************************
//     // creating different tools that your agent as use
//     // ###################################################################################################################################

//     const getsyllabus = createTool({
//       id: "get_syllabus",
//       description: "Get the syllabus for a course.",
//       inputSchema: z.object({}),
//       outputSchema: z.object({
//         units: z.array(
//           z.object({
//             unit: z.number(),
//             topics: z.array(z.string()),
//           }),
//         ),
//       }),
//       execute: async () => {
//         console.log("the getsyllabus tool is called to know the syllabus");
//         return subjects;
//       },
//     });

//     const websearch = createTool({
//       id: "web_search",
//       description: "Search the web to get more information about a topic.",
//       inputSchema: z.object({
//         query: z.string().min(2).describe("The query to search for."),
//       }),
//       execute: async ({ context: { query } }) => {
//         console.log(`the wrb search tool is called to search ${query}`);
//         const exaApiKeyValue = process.env.EXA_API_KEY;
//         if (!exaApiKeyValue) {
//           throw new Error("EXA API key is required for web search");
//         }

//         try {
//           const exa = new Exa(exaApiKeyValue);
//           const response = await exa.searchAndContents(query, {
//             type: "neural",
//             numResults: 5,
//             text: true,
//             outputSchema: {
//               title: z.string().min(2).describe("The title of the article."),
//               url: z.string().url().describe("The URL of the article."),
//               content: z
//                 .string()
//                 .min(10)
//                 .describe("The content of the article."),
//             },
//           });
//           return `Results for ${query} is ${JSON.stringify(response, null, 2)}`;
//         } catch (error) {
//           console.error("Web search error:", error);
//           return `Web search failed for "${query}": ${error instanceof Error ? error.message : "Unknown error"}`;
//         }
//       },
//     });

//     const knowledgesearch = createTool({
//       id: "knowledge_search",
//       description:
//         "Search the knowledge base to get more information about a topic.",
//       inputSchema: z.object({
//         query: z.string().min(2).describe("The query to search for."),
//       }),
//       async execute({ context: { query } }) {
//         try {
//           console.log(
//             "the knowledge search qurey is called to get info from the knowledge base",
//             query,
//           );
//           const embeddings = await getEmbedding(query);
//           const Semantic_search = await index.namespace("__default__").query({
//             vector: embeddings,
//             topK: 5,
//             includeMetadata: true,
//             includeValues: false,
//           });
//           console.log("@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@");
//           console.log("the Semantic_search is : ", Semantic_search);
//           console.log("@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@");

//           // Extract only the text content from semantic search results
//           const textContent = Semantic_search.matches
//             .map((match) => match.metadata?.text)
//             .filter(Boolean);
//           console.log("the textcontent is : ", textContent);
//           const resultsString = textContent.join("\n\n");
//           console.log("the resultsString is : ", resultsString);

//           if (resultsString.trim() === "") {
//             return `No relevant information found for "${query}"`;
//           }

//           return `Results for ${query} is ${resultsString}`;
//         } catch (error) {
//           console.error("Knowledge search error:", error);
//           return `Knowledge search failed for "${query}": ${error instanceof Error ? error.message : "Unknown error"}`;
//         }
//       },
//     });

//     const getcode = createTool({
//       id: "get_code",
//       description:
//         "Get the code for any Programming topic based on your required language. If no language is provided, default to Python.",
//       inputSchema: z.object({
//         query: z.string().min(2).describe("The query to search for."),
//         language: z.string().min(1).describe("The Programming language."),
//       }),
//       outputSchema: GetCodeSchema,
//       execute: async ({ context }) => {
//         const { query, language } = context;

//         console.log(
//           "Executing get_code tool with query:",
//           query,
//           "and language:",
//           language,
//         );

//         const result = await client.chat.completions.create({
//           model: "deepseek/deepseek-chat-v3-0324:free",
//           messages: [
//             { role: "user", content: `$${query} in ${language}` },
//             {
//               role: "system",
//               content:
//                 "You are a highly skilled coding assistant dedicated to helping students fully understand programming concepts. Your primary goal is to ensure clarity and foster mastery of each topic. Always adhere strictly to the provided instructions and output format. For every response, structure your output in the following order: language, code, and explanation. Make sure each section is clearly labeled and that your explanations are concise, accessible, and tailored to the student’s level.",
//             },
//           ],
//         });

//         const content = result.choices?.[0]?.message?.content ?? "";
//         console.log("Raw response content:", content);

//         // ✅ Use Zod to validate & parse the LLM response
//         const parsed = GetCodeSchema.safeParse(JSON.parse(content));

//         if (!parsed.success) {
//           console.error("Failed to parse LLM output:", parsed.error);
//           throw new Error("Invalid response format from model");
//         }

//         return parsed.data;
//       },
//     });

//     const test = createTool({
//       id: "test",
//       description:
//         "It is used to generate a test or exam on any concept to test the understanding of the student.",
//       inputSchema: z.object({
//         topic: z
//           .string()
//           .min(1)
//           .describe("The topic on which the question must be generated"),
//         no: z
//           .number()
//           .min(1)
//           .max(10)
//           .describe("The number of questions to generate"),
//       }),
//       outputSchema: TestQuestionSchema,
//       execute: async ({ context }) => {
//         const { topic, no } = context;

//         console.log(
//           `Generating test for query: ${topic}, number of questions: ${no}`,
//         );

//         const result = await client.chat.completions.create({
//           model: "deepseek/deepseek-chat-v3-0324:free",
//           messages: [
//             {
//               role: "user",
//               content: `create ${no} questions on the topic ${topic}`,
//             },
//             {
//               role: "system",
//               content:
//                 "You are a specialized assistant designed to create test questions that help students assess and deepen their understanding of key concepts. Only generate 'Choose the correct option' type questions, ensuring that each question has exactly four options with a single correct answer. For every question, provide the question, the four options, and clearly indicate the correct answer. Strictly adhere to the required output schema: questions, options, answer.",
//             },
//           ],
//         });

//         const content = result.choices?.[0]?.message?.content ?? "";
//         console.log("Raw response content:", content);

//         // ✅ Parse with Zod to match the outputSchema
//         const parsed = TestQuestionSchema.safeParse(JSON.parse(content));

//         if (!parsed.success) {
//           console.error("Failed to parse LLM output:", parsed.error);
//           throw new Error("Invalid response format from model");
//         }

//         return parsed.data;
//       },
//     });

//     const flashcards = createTool({
//       id: "flash_cards",
//       description:
//         "It is a tool that will create flashcards for students so that they can easily recap and memorize the concept easily",
//       inputSchema: z.object({
//         query: z
//           .string()
//           .min(2)
//           .describe("The topic on which the flashcards must be generated"),
//         no: z
//           .number()
//           .min(1)
//           .max(3)
//           .describe("The number of flashcards to generate"),
//       }),
//       outputSchema: FlashcardSchema,
//       execute: async ({ context }) => {
//         const { query, no } = context;

//         console.log(
//           `Generating flashcards for topic "${query}" with count ${no}`,
//         );

//         const result = await client.chat.completions.create({
//           model: "deepseek/deepseek-chat-v3-0324:free",
//           messages: [
//             {
//               role: "system",
//               content:
//                 "You are a flashcard generator dedicated to helping students efficiently review and memorize concepts. For each flashcard, strictly follow the required output schema: the 'front' must contain a clear question or the topic name, while the 'back' must provide a concise answer or explanation. Ensure that each flashcard is focused, accurate, and easy to understand. Return valid JSON.",
//             },
//             {
//               role: "user",
//               content: `Generate ${no} flashcards on the topic ${query}`,
//             },
//           ],
//         });

//         const content = result.choices?.[0]?.message?.content ?? "";
//         console.log("Raw response content:", content);

//         // ✅ Parse using Zod
//         const parsed = FlashcardSchema.safeParse(JSON.parse(content));

//         if (!parsed.success) {
//           console.error("Failed to parse LLM output:", parsed.error);
//           throw new Error("Invalid response format from model");
//         }

//         return parsed.data;
//       },
//     });

//     // ###################################################################################################################################
//     // agent orchestration
//     // @@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@
//     console.log("oh stated agent orchestration");

//     const agent = new Agent({
//       name: "sphereai",
//       instructions: `You are SphereAI, an advanced educational agent dedicated to guiding students from complete beginners to true mastery in any subject. Your mission is to ensure every learner develops a rock-solid understanding of foundational concepts before progressing to more advanced material. Build upon these basics systematically, using clear explanations, real-world scenarios, and practical exercises to deepen comprehension and retention.

//   You have access to powerful tools to enhance your responses:
// 	1.	getsyllabus: Retrieve comprehensive syllabi for any concept, helping you identify prerequisites and structure learning paths.
// 	2.	websearch: Gather up-to-date information and diverse perspectives from the internet.
// 	3.	knowledgesearch: Access internal notes and documents for authoritative insights.
// 	4.	getcode: Obtain complete code samples or pseudocode for programming topics in various languages.
// 	5. flashcards : the flashcards are help you generate flashcards for any topic so that student can learn and memorize the key concepts at max 3 per slide or block i.e can at max create only 3 card per one request .
// 	6. test: it is used to create test or exam questions , so that student's can test their understanding of the topic

//   Your workflow:
// 	•	Upon receiving a question, always start by using getsyllabus to map out the topic and its prerequisites.
// 	•	Design a logical learning path, beginning with core basics and building toward advanced applications.
// 	•	Develop a series of targeted questions and use websearch and knowledgesearch as needed to gather comprehensive, accurate information.
// 	•	For programming topics, use getcode to provide clear, fully explained code examples.
// 	•	Integrate real-world examples and practical exercises to reinforce each stage of learning.
// 	•	Use each tool as often as necessary to ensure your answers are thorough, well-informed, and tailored to the student's needs.
// 	•	We will be representing the content to user in the form of slides/blocks so when start a particular topic in one slide you need not to end it up the end of the slide, you can continue to multiple slides/blocks.
// 		• Remember this it very important for you provide the correct and long enough information to the student , if you failed to do so , you will be penalized. because you are responsible failure of the student due to this student can loose a life beacuse your your mistake .

//   Your ultimate goal is to empower students to achieve true mastery, ensuring they can confidently apply their knowledge in real-world situations.per request it can only genrate max 10 questions`,
//       model: openrouter("anthropic/claude-sonnet-4"),
//       tools: {
//         getsyllabus,
//         getcode,
//         websearch,
//         knowledgesearch,
//         test,
//         flashcards,
//       },
//     });

//     try {
//       const result = await agent.generate(
//         [
//           {
//             role: "user",
//             content: `${args.messages}`,
//           },
//         ],
//         {
//           output: AgentOutputSchema,
//         },
//       );

//       // Additional debugging logs
//       console.log("Raw agent result:", result);
//       console.log("Type of result.object:", typeof result.object);
//       console.log("Result.object value:", result.object);
//       console.log("Raw result.object:", JSON.stringify(result.object));

//       if (result.object === null || typeof result.object !== "object") {
//         throw new Error(
//           `Expected result.object to be an object but got ${typeof result.object}. Value: ${JSON.stringify(result.object)}`,
//         );
//       }

//       const parsed = AgentOutputSchema.safeParse(result.object);
//       if (!parsed.success) {
//         console.error("❌ Invalid structured output:");
//         console.dir(result.object, { depth: null }); // what the agent actually returned
//         console.dir(parsed.error.format(), { depth: null }); // detailed schema error
//       }
//       console.log(result.object);
//       console.log("Parsed agent output:", parsed.data);

//       if (!result.object) {
//         throw new Error("Agent returned no output.");
//       }

//       // Update message with successful result
//       await ctx.runMutation(api.messages.updateMessage, {
//         messageId: assistantMessageId,
//         content: JSON.stringify({ slides: result.object }),
//       });

//       await ctx.runMutation(api.messages.signalProcessingComplete, {
//         parentMessageId: args.parentMessageId,
//         assistantMessageId: assistantMessageId,
//       });

//       return assistantMessageId;
//     } catch (error) {
//       console.error("Agent processing error:", error);

//       // Update message with error information
//       const errorMessage =
//         error instanceof Error ? error.message : "Unknown error occurred";

//       try {
//         await ctx.runMutation(api.messages.updateMessage, {
//           messageId: assistantMessageId,
//           content: JSON.stringify({
//             error: true,
//             message: errorMessage,
//             slides: [],
//           }),
//         });

//         await ctx.runMutation(api.messages.signalProcessingComplete, {
//           parentMessageId: args.parentMessageId,
//           assistantMessageId: assistantMessageId,
//         });
//       } catch (updateError) {
//         console.error("Failed to update message with error:", updateError);
//       }

//       // Provide more detailed error information
//       if (error instanceof Error) {
//         throw new Error(`Agent processing failed: ${error.message}`);
//       } else {
//         throw new Error("Agent processing failed with unknown error");
//       }
//     }
//   },
// });
