export const slidesJsonSchema = {
  type: "object" as const,
  properties: {
    slides: {
      type: "array" as const,
      items: {
        type: "object" as const,
        properties: {
          name: {
            type: "string" as const,
            description: "Unique slide identifier, e.g., 'slide 1', 'slide 2'",
          },
          title: {
            type: "string" as const,
            description:
              "Main title of the slide that introduces the key concept",
          },
          subTitles: {
            type: "string" as const,
            description:
              "A brief subtitle or summary of the slide content (use empty string if not needed)",
          },
          picture: {
            type: "string" as const,
            description:
              "A relevant image URL from Google search to support visual learning (use empty string if not needed)",
          },
          content: {
            type: "string" as const,
            description:
              "Main explanation in markdown or plain text (max 180 words, clear and concise)",
          },
          links: {
            type: "array" as const,
            items: {
              type: "string" as const,
            },
            description:
              "List of URLs for relevant platforms like LeetCode, HackerRank, etc. (use empty array if not needed)",
          },
          youtubeSearchText: {
            type: "string" as const,
            description:
              "Search query string students can use to search YouTube for additional video explanations (use empty string if not needed)",
          },
          codeLanguage: {
            type: "string" as const,
            description:
              "Programming language used in the code block, e.g., 'python', 'js' (use empty string if no code)",
          },
          codeContent: {
            type: "string" as const,
            description:
              "The actual code snippet (keep it short and directly related to the topic) (use empty string if no code)",
          },
          tables: {
            type: "string" as const,
            description:
              "Table formatted in markdown, for comparisons or data summaries (use empty string if not needed)",
          },
          bulletPoints: {
            type: "array" as const,
            items: {
              type: "string" as const,
            },
            description:
              "Key points or summary lines for quick revision or flashcards (use empty array if not needed)",
          },
          audioScript: {
            type: "string" as const,
            description:
              "Conversational-style script for podcast narration or audiobook (use empty string if not needed)",
          },
          testQuestions: {
            type: "string" as const,
            description:
              "JSON stringified array of test questions with question, options (4 items), and answer fields (use empty string if no test questions)",
          },
          flashcardsContent: {
            type: "string" as const,
            description:
              "JSON stringified array of flashcards with front and back fields (use empty string if no flashcards)",
          },
          type: {
            type: "string" as const,
            enum: ["markdown", "code", "video", "quiz", "table", "flashcard"],
            description:
              "The layout type of this slide. Use 'markdown' for normal slides, 'video' for YouTube-based, 'code' for coding slides, 'table' for comparative layouts, 'quiz' for interactive tests, or 'flashcard' for flashcard review",
          },
        },
        required: [
          "name",
          "title",
          "subTitles",
          "picture",
          "content",
          "links",
          "youtubeSearchText",
          "codeLanguage",
          "codeContent",
          "tables",
          "bulletPoints",
          "audioScript",
          "testQuestions",
          "flashcardsContent",
          "type",
        ],
        additionalProperties: false,
      },
    },
  },
  required: ["slides"],
  additionalProperties: false,
};
