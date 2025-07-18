// "use node";

// import { v } from "convex/values";
// import { action } from "./_generated/server";
// import { api } from "./_generated/api";
// import { getAuthUserId } from "@convex-dev/auth/server";
// import OpenAI from "openai";
// import { getEmbedding } from "../src/utils/embeddings";
// import { Pinecone } from "@pinecone-database/pinecone";
// import { z } from "zod";
// import { zodResponseFormat } from "openai/helpers/zod";
// import subjects from "../src/syllabus.json";

// // TypeScript type definitions
// type ExecutionHistoryEntry = {
//   type: "decision" | "execution" | "pivot";
//   iteration: number;
//   tool?: string;
//   decision?: string;
//   reasoning?: string;
//   confidence?: number;
//   timestamp: string;
//   budgetUsed?: number;
//   result?: any;
//   reason?: string;
// };

// type OrchestrationState = {
//   usedBudget: number;
//   maxBudget: number;
//   qualityTarget: number;
//   currentQuality: number;
//   executionHistory: ExecutionHistoryEntry[];
//   accumulatedResults: any;
//   iterationCount: number;
//   maxIterations: number;
// };

// // Tool execution context type
// type ToolExecutionContext = {
//   ctx: any;
//   assistantMessageId: string;
//   index: any;
//   client: OpenAI;
//   model: string;
//   args: any;
// };

// // Agent Orchestration Schemas
// const ToolDecisionSchema = z.object({
//   toolName: z.enum([
//     "knowledge_base_search",
//     "web_search",
//     "academic_search",
//     "code_analysis",
//     "visual_analysis",
//     "fact_checker",
//     "trend_analyzer",
//     "synthesis_engine",
//     "test",
//     "flashcards",
//     "getsyllabus",
//   ]),
//   priority: z.number().min(1).max(10),
//   executionCount: z.number().min(1).max(5),
//   queries: z.array(z.string()),
//   rationale: z.string(),
//   expectedOutcome: z.string(),
//   qualityThreshold: z.number().min(0).max(1),
//   fallbackTool: z.string().optional(),
// });

// const OrchestrationPlanSchema = z.object({
//   researchStrategy: z.enum([
//     "breadth_first",
//     "depth_first",
//     "adaptive",
//     "quality_driven",
//     "deep_search_systematic",
//   ]),
//   totalBudget: z.number().min(1).max(100),
//   qualityTarget: z.number().min(0.7).max(1.0),
//   toolSequence: z.array(ToolDecisionSchema),
//   contingencyPlans: z.array(
//     z.object({
//       trigger: z.string(),
//       action: z.string(),
//       alternativeTools: z.array(z.string()),
//     }),
//   ),
//   successCriteria: z.array(z.string()),
//   stopConditions: z.array(z.string()),
// });

// const QualityAssessmentSchema = z.object({
//   completeness: z.number().min(0).max(1),
//   accuracy: z.number().min(0).max(1),
//   relevance: z.number().min(0).max(1),
//   novelty: z.number().min(0).max(1),
//   credibility: z.number().min(0).max(1),
//   overallScore: z.number().min(0).max(1),
//   gaps: z.array(z.string()),
//   recommendations: z.array(z.string()),
//   needsMoreResearch: z.boolean(),
//   suggestedNextTools: z.array(z.string()),
// });

// const AgentDecisionSchema = z.object({
//   decision: z.enum(["continue", "pivot", "deep_dive", "synthesize", "stop"]),
//   nextTool: z.string().optional(),
//   reasoning: z.string(),
//   confidence: z.number().min(0).max(1),
//   resourceAllocation: z.object({
//     remainingBudget: z.number(),
//     priorityAdjustment: z.array(z.string()),
//   }),
// });

// // Helper function to update progress
// async function updateProgress(
//   ctx: any,
//   messageId: string,
//   content: string
// ): Promise<void> {
//   await ctx.runMutation(api.messages.updateMessage, {
//     messageId,
//     content,
//   });
// }

// // Helper function to generate intelligent slides
// async function generateIntelligentSlides(
//   synthesis: string,
//   state: OrchestrationState,
//   client: OpenAI,
//   model: string
// ): Promise<any> {
//   const response = await client.chat.completions.create({
//     model: model,
//     messages: [
//       {
//         role: "system",
//         content: "Generate comprehensive educational slides based on the research synthesis.",
//       },
//       {
//         role: "user",
//         content: `Create slides from this synthesis: ${synthesis}`,
//       },
//     ],
//     temperature: 0.7,
//   });

//   return {
//     slides: response.choices[0].message.content,
//     metadata: {
//       qualityScore: state.currentQuality,
//       budgetUsed: state.usedBudget,
//       iterations: state.iterationCount,
//     },
//   };
// }

// export const intelligentOrchestration = action({
//   args: {
//     chatId: v.id("chats"),
//     messages: v.string(),
//     parentMessageId: v.optional(v.id("messages")),
//     maxBudget: v.optional(v.number()),
//     qualityTarget: v.optional(v.number()),
//     strategy: v.optional(v.string()),
//   },
//   handler: async (ctx, args): Promise<string> => {
//     const userId = await getAuthUserId(ctx);
//     if (!userId) throw new Error("Not authenticated");

//     // Initialize AI clients and tools
//     const _decryptedKey = await ctx.runQuery(api.saveApiKey.getkey, {});
//     const token = process.env["GITHUB_TOKEN"];
//     const endpoint = "https://models.github.ai/inference";
//     const model = "openai/gpt-4.1-mini";

//     if (!token) {
//       throw new Error("GitHub token not found");
//     }

//     const PineconeClient = new Pinecone({
//       apiKey: process.env.PINECONE_API_KEY!,
//     });
//     const index = PineconeClient.index("docling");
//     const client = new OpenAI({ baseURL: endpoint, apiKey: token });

//     // Initialize orchestration state with deep search capabilities
//     const orchestrationState: OrchestrationState = {
//       usedBudget: 0,
//       maxBudget: args.maxBudget || 80,
//       qualityTarget: args.qualityTarget || 0.90,
//       currentQuality: 0,
//       executionHistory: [],
//       accumulatedResults: {},
//       iterationCount: 0,
//       maxIterations: 15,
//     };

//     // Define core tools that must be used (like deep search)
//     const coreTools = [
//       "getsyllabus",
//       "knowledge_base_search",
//       "web_search",
//       "academic_search",
//       "synthesis_engine",
//       "test",
//       "flashcards"
//     ];

//     // Tools execution tracking
//     const toolsExecuted = new Set<string>();

//     const assistantMessageId = await ctx.runMutation(api.messages.addMessage, {
//       chatId: args.chatId,
//       role: "assistant",
//       content: "🤖 Deep Search Agent initializing comprehensive research...",
//       parentId: args.parentMessageId,
//     });

//     try {
//       // PHASE 1: Deep Search Initialization
//       await updateProgress(
//         ctx,
//         assistantMessageId,
//         "🧠 Deep Search Agent analyzing query and planning comprehensive research...",
//       );

//       const masterAgent = new MasterAgent(client, "openai/o3-mini", subjects);
//       const orchestrationPlan = await masterAgent.createOrchestrationPlan(
//         args.messages,
//         orchestrationState,
//         "deep_search_systematic",
//       );

//       console.log("🎯 Deep Search Plan:", JSON.stringify(orchestrationPlan, null, 2));

//       // PHASE 2: Systematic Tool Execution (Deep Search Style)
//       // Always start with core foundational tools

//       // Step 1: Get syllabus context first (foundation)
//       await updateProgress(ctx, assistantMessageId, "📚 Phase 1: Gathering syllabus context...");
//       await executeToolWithAgent("getsyllabus", orchestrationState, masterAgent, {
//         ctx, assistantMessageId, index, client, model, args
//       });
//       toolsExecuted.add("getsyllabus");

//       // Step 2: Search internal knowledge base
//       await updateProgress(ctx, assistantMessageId, "🔍 Phase 2: Searching knowledge base...");
//       await executeToolWithAgent("knowledge_base_search", orchestrationState, masterAgent, {
//         ctx, assistantMessageId, index, client, model, args
//       });
//       toolsExecuted.add("knowledge_base_search");

//       // Step 3: Web search
//       await updateProgress(ctx, assistantMessageId, "🌐 Phase 3: Conducting web search...");
//       await executeToolWithAgent("web_search", orchestrationState, masterAgent, {
//         ctx, assistantMessageId, index, client, model, args
//       });
//       toolsExecuted.add("web_search");

//       // Step 4: Academic search
//       await updateProgress(ctx, assistantMessageId, "🎓 Phase 4: Academic source analysis...");
//       await executeToolWithAgent("academic_search", orchestrationState, masterAgent, {
//         ctx, assistantMessageId, index, client, model, args
//       });
//       toolsExecuted.add("academic_search");

//       // Step 5: Initial synthesis
//       await updateProgress(ctx, assistantMessageId, "🔬 Phase 5: Initial synthesis...");
//       await executeToolWithAgent("synthesis_engine", orchestrationState, masterAgent, {
//         ctx, assistantMessageId, index, client, model, args
//       });
//       toolsExecuted.add("synthesis_engine");

//       let continueResearch = true;
//       let phase = 6;

//       while (
//         continueResearch &&
//         orchestrationState.iterationCount < orchestrationState.maxIterations &&
//         orchestrationState.usedBudget < orchestrationState.maxBudget
//       ) {
//         orchestrationState.iterationCount++;

//         await updateProgress(
//           ctx,
//           assistantMessageId,
//           `🔄 Phase ${phase}: Deep analysis iteration ${orchestrationState.iterationCount}...`,
//         );

//         // Quality assessment to guide next steps
//         const qualityAssessment = await masterAgent.assessQuality(
//           orchestrationState.accumulatedResults,
//           args.messages,
//         );

//         orchestrationState.currentQuality = qualityAssessment.overallScore;

//         // Deep Search Decision Making
//         const agentDecision = await masterAgent.makeToolDecision(
//           orchestrationState,
//           orchestrationPlan,
//           args.messages,
//         );

//         console.log(`📊 Deep Search Decision (Phase ${phase}):`, agentDecision);

//         // Execute based on intelligent decision making
//         switch (agentDecision.decision) {
//           case "continue":
//             if (agentDecision.nextTool) {
//               await executeToolWithAgent(
//                 agentDecision.nextTool,
//                 orchestrationState,
//                 masterAgent,
//                 { ctx, assistantMessageId, index, client, model, args },
//               );
//               toolsExecuted.add(agentDecision.nextTool);
//             }
//             break;

//           case "deep_dive":
//             await performDeepDive(
//               agentDecision.nextTool,
//               orchestrationState,
//               masterAgent,
//               { ctx, assistantMessageId, index, client, model, args },
//             );
//             if (agentDecision.nextTool) {
//               toolsExecuted.add(agentDecision.nextTool);
//             }
//             break;

//           case "pivot":
//             await performPivot(orchestrationState, masterAgent, {
//               ctx,
//               assistantMessageId,
//               index,
//               client,
//               model,
//               args,
//             });
//             break;

//           case "synthesize":
//             await updateProgress(
//               ctx,
//               assistantMessageId,
//               "🔬 Deep Search synthesizing comprehensive findings...",
//             );
//             break;

//           case "stop":
//             continueResearch = false;
//             break;
//         }

//         // Ensure all core tools are used (Deep Search requirement)
//         const remainingCoreTools = coreTools.filter(tool => !toolsExecuted.has(tool));
//         if (remainingCoreTools.length > 0 && orchestrationState.usedBudget < orchestrationState.maxBudget - 5) {
//           const nextCoreTools = remainingCoreTools.slice(0, 2);
//           for (const tool of nextCoreTools) {
//             await updateProgress(
//               ctx,
//               assistantMessageId,
//               `🎯 Phase ${phase}: Executing core tool ${tool}...`,
//             );
//             await executeToolWithAgent(tool, orchestrationState, masterAgent, {
//               ctx, assistantMessageId, index, client, model, args
//             });
//             toolsExecuted.add(tool);
//           }
//         }

//         // Adaptive tool suggestion based on quality gaps
//         if (qualityAssessment.needsMoreResearch && orchestrationState.usedBudget < orchestrationState.maxBudget - 3) {
//           const suggestedTools = qualityAssessment.suggestedNextTools.filter(tool =>
//             coreTools.includes(tool) && !toolsExecuted.has(tool)
//           );

//           for (const tool of suggestedTools.slice(0, 2)) {
//             await executeToolWithAgent(tool, orchestrationState, masterAgent, {
//               ctx, assistantMessageId, index, client, model, args
//             });
//             toolsExecuted.add(tool);
//           }
//         }

//         phase++;
//       }

//       // PHASE 4: Final Educational Tools (Test & Flashcards)
//       await updateProgress(ctx, assistantMessageId, "🎓 Phase Final: Generating educational materials...");

//       // Generate test questions if not already done
//       if (!toolsExecuted.has("test")) {
//         await executeToolWithAgent("test", orchestrationState, masterAgent, {
//           ctx, assistantMessageId, index, client, model, args
//         });
//         toolsExecuted.add("test");
//       }

//       // Generate flashcards if not already done
//       if (!toolsExecuted.has("flashcards")) {
//         await executeToolWithAgent("flashcards", orchestrationState, masterAgent, {
//           ctx, assistantMessageId, index, client, model, args
//         });
//         toolsExecuted.add("flashcards");
//       }

//       // PHASE 5: Final Synthesis and Results
//       await updateProgress(
//         ctx,
//         assistantMessageId,
//         "🎯 Master Agent creating final synthesis...",
//       );

//       const finalSynthesis = await masterAgent.createFinalSynthesis(
//         orchestrationState.accumulatedResults,
//         orchestrationState.executionHistory,
//         args.messages,
//       );

//       // Generate enhanced slides with orchestration metadata
//       const enhancedSlides = await generateIntelligentSlides(
//         finalSynthesis,
//         orchestrationState,
//         client,
//         model,
//       );

//       // Final result with complete orchestration metadata
//       const finalResult = {
//         orchestrationPlan,
//         executionHistory: orchestrationState.executionHistory,
//         qualityMetrics: {
//           finalQuality: orchestrationState.currentQuality,
//           targetQuality: orchestrationState.qualityTarget,
//           budgetUsed: orchestrationState.usedBudget,
//           budgetTotal: orchestrationState.maxBudget,
//           iterations: orchestrationState.iterationCount,
//           efficiency: orchestrationState.currentQuality / (orchestrationState.usedBudget || 1),
//         },
//         researchResults: orchestrationState.accumulatedResults,
//         synthesis: finalSynthesis,
//         slides: enhancedSlides,
//         toolsUsed: Array.from(toolsExecuted),
//         metadata: {
//           timestamp: new Date().toISOString(),
//           strategy: orchestrationPlan.researchStrategy,
//           toolsUsed: Array.from(toolsExecuted),
//           totalApiCalls: orchestrationState.usedBudget,
//           averageQuality: orchestrationState.currentQuality,
//           masterAgentDecisions: orchestrationState.executionHistory.filter(
//             (h) => h.type === "decision",
//           ).length,
//         },
//       };

//       await ctx.runMutation(api.messages.updateMessage, {
//         messageId: assistantMessageId,
//         content: JSON.stringify(finalResult, null, 2),
//       });

//       await ctx.runMutation(api.messages.signalProcessingComplete, {
//         parentMessageId: args.parentMessageId,
//         assistantMessageId: assistantMessageId,
//       });

//       return assistantMessageId;
//     } catch (error) {
//       console.error("Deep Search orchestration error:", error);
//       await ctx.runMutation(api.messages.updateMessage, {
//         messageId: assistantMessageId,
//         content: `Deep Search orchestration error: ${error instanceof Error ? error.message : "Unknown error"}`,
//       });
//       throw error;
//     }
//   },
// });

// class MasterAgent {
//   private client: OpenAI;
//   private model: string;
//   private subjects: any;
//   private decisionHistory: any[] = [];

//   constructor(client: OpenAI, model: string, subjects: any) {
//     this.client = client;
//     this.model = model;
//     this.subjects = subjects;
//   }

//   async createOrchestrationPlan(query: string, state: OrchestrationState, strategy: string) {
//     const response = await this.client.chat.completions.create({
//       model: this.model,
//       messages: [
//         {
//           role: "system",
//           content: `You are a Master Research Agent responsible for orchestrating multiple research tools intelligently.

// Available Tools:
// 1. getsyllabus - Get comprehensive syllabus and course structure
// 2. knowledge_base_search - Internal vector database search
// 3. web_search - Real-time web information
// 4. academic_search - Scholarly articles and papers
// 5. code_analysis - Technical implementations
// 6. visual_analysis - Charts and visual content
// 7. fact_checker - Cross-reference validation
// 8. trend_analyzer - Pattern and trend identification
// 9. synthesis_engine - Information synthesis
// 10. test - Generate test questions for assessment
// 11. flashcards - Create flashcards for memorization

// Your job is to:
// - Create a comprehensive deep search plan like Gemini/ChatGPT
// - Prioritize foundational tools first (getsyllabus, knowledge_base_search)
// - Ensure systematic coverage of all educational aspects
// - Include assessment tools (test, flashcards) for complete learning
// - Balance depth with breadth for thorough understanding
// - Optimize for educational completeness and quality

// Deep Search Strategy:
// - Always start with getsyllabus for context
// - Use knowledge_base_search and web_search for comprehensive information
// - Include academic_search for authoritative sources
// - Generate practical assessments with test and flashcards
// - Synthesize everything into coherent educational content

// Current constraints:
// - Max budget: ${state.maxBudget} API calls
// - Quality target: ${state.qualityTarget}
// - Strategy: ${strategy}

// Syllabus context: ${JSON.stringify(this.subjects)}`,
//         },
//         {
//           role: "user",
//           content: `Create an intelligent orchestration plan for: ${query}`,
//         },
//       ],
//       temperature: 0.7,
//       response_format: zodResponseFormat(OrchestrationPlanSchema, "orchestration_plan"),
//     });

//     const content = response.choices[0].message.content;
//     if (!content) {
//       throw new Error("No response content from orchestration plan");
//     }

//     return JSON.parse(content);
//   }

//   async makeToolDecision(state: OrchestrationState, plan: any, originalQuery: string) {
//     const response = await this.client.chat.completions.create({
//       model: this.model,
//       messages: [
//         {
//           role: "system",
//           content: `You are the Master Agent making real-time decisions about tool usage.

// Current State:
// - Budget used: ${state.usedBudget}/${state.maxBudget}
// - Current quality: ${state.currentQuality}
// - Target quality: ${state.qualityTarget}
// - Iteration: ${state.iterationCount}
// - Execution history: ${JSON.stringify(state.executionHistory.slice(-3))}

// Available decisions:
// - continue: Execute next planned tool systematically
// - deep_dive: Focus intensively on one tool for comprehensive coverage
// - pivot: Change strategy based on findings
// - synthesize: Start final synthesis
// - stop: End research (quality achieved or budget exhausted)

// Deep Search Decision Making:
// 1. Prioritize foundational tools (getsyllabus, knowledge_base_search) early
// 2. Ensure comprehensive coverage across information sources
// 3. Include educational assessment tools (test, flashcards) for complete learning
// 4. Balance depth with breadth for thorough understanding
// 5. Focus on quality and educational completeness over speed
// 6. Always consider what tools haven't been used yet
// 7. Ensure synthesis happens after sufficient information gathering`,
//         },
//         {
//           role: "user",
//           content: `Current results: ${JSON.stringify(state.accumulatedResults)}

// Original query: ${originalQuery}

// What should I do next?`,
//         },
//       ],
//       temperature: 0.8,
//       response_format: zodResponseFormat(AgentDecisionSchema, "agent_decision"),
//     });

//     const content = response.choices[0].message.content;
//     if (!content) {
//       throw new Error("No response content from agent decision");
//     }

//     const decision = JSON.parse(content);

//     // Record decision in history
//     state.executionHistory.push({
//       type: "decision",
//       iteration: state.iterationCount,
//       decision: decision.decision,
//       reasoning: decision.reasoning,
//       confidence: decision.confidence,
//       timestamp: new Date().toISOString(),
//     });

//     return decision;
//   }

//   async assessQuality(results: any, originalQuery: string) {
//     const response = await this.client.chat.completions.create({
//       model: this.model,
//       messages: [
//         {
//           role: "system",
//           content: `You are a Quality Assessment Agent. Evaluate research results across multiple dimensions:

// 1. Completeness - How well does it cover the topic?
// 2. Accuracy - How factually correct is the information?
// 3. Relevance - How relevant is it to the original query?
// 4. Novelty - How much new insight does it provide?
// 5. Credibility - How trustworthy are the sources?

// Provide specific recommendations for improvement.`,
//         },
//         {
//           role: "user",
//           content: `Original query: ${originalQuery}

// Current results: ${JSON.stringify(results)}

// Assess the quality and suggest improvements.`,
//         },
//       ],
//       temperature: 0.3,
//       response_format: zodResponseFormat(QualityAssessmentSchema, "quality_assessment"),
//     });

//     const content = response.choices[0].message.content;
//     if (!content) {
//       throw new Error("No response content from quality assessment");
//     }

//     return JSON.parse(content);
//   }

//   async createFinalSynthesis(results: any, history: ExecutionHistoryEntry[], originalQuery: string) {
//     const response = await this.client.chat.completions.create({
//       model: this.model,
//       messages: [
//         {
//           role: "system",
//           content: `You are the Master Synthesis Agent. Create a comprehensive synthesis of all research findings.

// Include:
// 1. Key insights and discoveries
// 2. Synthesis of multiple perspectives
// 3. Identification of patterns and trends
// 4. Practical applications
// 5. Remaining knowledge gaps
// 6. Quality assessment of the research process
// 7. Recommendations for further research

// Be thorough and insightful.`,
//         },
//         {
//           role: "user",
//           content: `Original query: ${originalQuery}

// All results: ${JSON.stringify(results)}

// Execution history: ${JSON.stringify(history)}

// Create final synthesis.`,
//         },
//       ],
//       temperature: 0.7,
//     });

//     return response.choices[0].message.content || "No synthesis generated";
//   }
// }

// // Tool execution functions with agent intelligence
// async function executeToolWithAgent(
//   toolName: string,
//   state: OrchestrationState,
//   agent: MasterAgent,
//   context: ToolExecutionContext,
// ) {
//   const { ctx, assistantMessageId, index, client, model, args } = context;

//   await updateProgress(ctx, assistantMessageId, `🔧 Executing ${toolName}...`);

//   state.usedBudget += 1;

//   let result: any;
//   switch (toolName) {
//     case "knowledge_base_search":
//       result = await executeKnowledgeBaseSearch(args.messages, index);
//       break;
//     case "web_search":
//       result = await executeWebSearch(args.messages, client, model);
//       break;
//     case "academic_search":
//       result = await executeAcademicSearch(args.messages, client, model);
//       break;
//     case "code_analysis":
//       result = await executeCodeAnalysis(args.messages, client, model);
//       break;
//     case "visual_analysis":
//       result = await executeVisualAnalysis(args.messages, client, model);
//       break;
//     case "fact_checker":
//       result = await executeFactChecker(state.accumulatedResults, client, model);
//       break;
//     case "trend_analyzer":
//       result = await executeTrendAnalyzer(args.messages, client, model);
//       break;
//     case "synthesis_engine":
//       result = await executeSynthesisEngine(state.accumulatedResults, client, model);
//       break;
//     case "test":
//       result = await executeTest(args.messages, client, model);
//       break;
//     case "flashcards":
//       result = await executeFlashcards(args.messages, client, model);
//       break;
//     case "getsyllabus":
//       result = await executeGetSyllabus();
//       break;
//     default:
//       result = { error: `Unknown tool: ${toolName}` };
//   }

//   // Store result
//   if (!state.accumulatedResults[toolName]) {
//     state.accumulatedResults[toolName] = [];
//   }
//   state.accumulatedResults[toolName].push(result);

//   // Record execution
//   state.executionHistory.push({
//     type: "execution",
//     tool: toolName,
//     iteration: state.iterationCount,
//     budgetUsed: state.usedBudget,
//     result: result,
//     timestamp: new Date().toISOString(),
//   });

//   console.log(`✅ ${toolName} executed. Budget: ${state.usedBudget}/${state.maxBudget}`);
// }

// async function performDeepDive(
//   toolName: string | undefined,
//   state: OrchestrationState,
//   agent: MasterAgent,
//   context: ToolExecutionContext
// ) {
//   const { ctx, assistantMessageId } = context;

//   if (!toolName) {
//     await updateProgress(ctx, assistantMessageId, "🔍 Deep dive requested but no tool specified");
//     return;
//   }

//   await updateProgress(ctx, assistantMessageId, `🔍 Deep diving with ${toolName}...`);

//   // Execute the tool multiple times with refined queries
//   for (let i = 0; i < 3; i++) {
//     if (state.usedBudget >= state.maxBudget) break;

//     await executeToolWithAgent(toolName, state, agent, context);
//     await new Promise((resolve) => setTimeout(resolve, 1000));
//   }
// }

// async function performPivot(
//   state: OrchestrationState,
//   agent: MasterAgent,
//   context: ToolExecutionContext
// ) {
//   const { ctx, assistantMessageId } = context;

//   await updateProgress(ctx, assistantMessageId, "🔄 Pivoting research strategy...");

//   state.executionHistory.push({
//     type: "pivot",
//     iteration: state.iterationCount,
//     reason: "Strategic pivot based on current results",
//     timestamp: new Date().toISOString(),
//   });
// }

// // Individual tool execution functions
// async function executeKnowledgeBaseSearch(query: string, index: any) {
//   try {
//     const embeddings = await getEmbedding(query);
//     const search = await index.namespace("__default__").query({
//       vector: embeddings,
//       topK: 5,
//       includeMetadata: true,
//       includeValues: false,
//     });

//     return {
//       query,
//       results: search.matches.map((match: any) => ({
//         text: match.metadata?.text,
//         score: match.score,
//         source: match.metadata?.source || "internal",
//       })),
//     };
//   } catch (error) {
//     return {
//       query,
//       error: error instanceof Error ? error.message : "Unknown error",
//       results: [],
//     };
//   }
// }

// async function executeWebSearch(query: string, client: OpenAI, model: string) {
//   try {
//     const response = await client.chat.completions.create({
//       model: model,
//       messages: [
//         {
//           role: "system",
//           content: "Generate realistic web search results with current information.",
//         },
//         {
//           role: "user",
//           content: `Web search for: ${query}`,
//         },
//       ],
//       temperature: 0.7,
//     });

//     return {
//       query,
//       results: response.choices[0].message.content || "No results",
//       source: "web_search",
//     };
//   } catch (error) {
//     return {
//       query,
//       error: error instanceof Error ? error.message : "Unknown error",
//       source: "web_search",
//     };
//   }
// }

// async function executeAcademicSearch(query: string, client: OpenAI, model: string) {
//   try {
//     const response = await client.chat.completions.create({
//       model: model,
//       messages: [
//         {
//           role: "system",
//           content: "Generate academic search results with proper citations.",
//         },
//         {
//           role: "user",
//           content: `Academic search for: ${query}`,
//         },
//       ],
//       temperature: 0.7,
//     });

//     return {
//       query,
//       results: response.choices[0].message.content || "No results",
//       source: "academic_search",
//     };
//   } catch (error) {
//     return {
//       query,
//       error: error instanceof Error ? error.message : "Unknown error",
//       source: "academic_search",
//     };
//   }
// }

// async function executeCodeAnalysis(query: string, client: OpenAI, model: string) {
//   try {
//     const response = await client.chat.completions.create({
//       model: model,
//       messages: [
//         {
//           role: "system",
//           content: "Provide code analysis and examples.",
//         },
//         {
//           role: "user",
//           content: `Code analysis for: ${query}`,
//         },
//       ],
//       temperature: 0.7,
//     });

//     return {
//       query,
//       results: response.choices[0].message.content || "No results",
//       source: "code_analysis",
//     };
//   } catch (error) {
//     return {
//       query,
//       error: error instanceof Error ? error.message : "Unknown error",
//       source: "code_analysis",
//     };
//   }
// }

// async function executeVisualAnalysis(query: string, client: OpenAI, model: string) {
//   const response = await client.chat.completions.create({
//     model: model,
//     messages: [
//       {
//         role: "system",
//         content: "Analyze and suggest visual content and diagrams.",
//       },
//       {
//         role: "user",
//         content: `Visual analysis for: ${query}`,
//       },
//     ],
//     temperature: 0.7,
//   });

//   return {
//     query,
//     results: response.choices[0].message.content,
//     source: "visual_analysis",
//   };
// }

// async function executeFactChecker(results: any, client: OpenAI, model: string) {
//   const response = await client.chat.completions.create({
//     model: model,
//     messages: [
//       {
//         role: "system",
//         content: "Cross-reference and fact-check the provided information.",
//       },
//       {
//         role: "user",
//         content: `Fact-check these results: ${JSON.stringify(results)}`,
//       },
//     ],
//     temperature: 0.3,
//   });

//   return {
//     results: response.choices[0].message.content,
//     source: "fact_checker",
//   };
// }

// async function executeTrendAnalyzer(query: string, client: OpenAI, model: string) {
//   const response = await client.chat.completions.create({
//     model: model,
//     messages: [
//       {
//         role: "system",
//         content: "Analyze trends and patterns related to the topic.",
//       },
//       {
//         role: "user",
//         content: `Trend analysis for: ${query}`,
//       },
//     ],
//     temperature: 0.7,
//   });

//   return {
//     query,
//     results: response.choices[0].message.content,
//     source: "trend_analyzer",
//   };
// }

// async function executeSynthesisEngine(results: any, client: OpenAI, model: string) {
//   const response = await client.chat.completions.create({
//     model: model,
//     messages: [
//       {
//         role: "system",
//         content:
//           "You are a Synthesis Engine. Synthesize all research results into a coherent, comprehensive summary. Integrate key findings, highlight important insights, resolve contradictions, and present a unified understanding. Be clear, concise, and educational. If there are gaps or uncertainties, mention them explicitly.",
//       },
//       {
//         role: "user",
//         content: `Synthesize these research results: ${JSON.stringify(results)}`,
//       },
//     ],
//     temperature: 0.7,
//   });

//   return {
//     results: response.choices[0].message.content,
//     source: "synthesis_engine",
//   };
// }
