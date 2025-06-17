import { Theme } from "./types";

export const ocenpurpleTheme: Theme = {
  id: "ocen-purple",
  name: "ocenpurple",
  category: "colorful",
  description: "Mystical purple theme with ocen vibes",
  colors: {
    background: {
      primary: "#5C6587",
      secondary: "#3C435D",
      sidebar: "#2D3349",
      chat: "#5C6587",
    },
    text: {
      primary: "#AEB5C7",
      secondary: "#9EA5BA",
      muted: "#a78bfa",
      inverse: "#1a0b2e",
      heading: "#E46BAB",
      block: "#2C2632",
    },
    border: {
      primary: "#575D76",
      secondary: "#2d1b69",
      focus: "#a855f7",
    },
    primary: {
      DEFAULT: "#3C435D",
      hover: "#7483B9",
      active: "#6d28d9",
    },
    chat: {
      userBubble: "#3C435D",
      assistantBubble: "#5C6587",
      userText: "#AEB5C7",
      assistantText: "#AEB5C7",
    },
    accent: {
      DEFAULT: "#a855f7",
      hover: "#9333ea",
    },
    success: "#10b981",
    warning: "#f59e0b",
    error: "#ef4444",
  },
  preview: {
    primary: "#5C6587",
    secondary: "#3C435D",
    gradient: "linear-gradient(135deg, #5C6587 0%, #3C435D 100%)",
  },
};

export const nightTheme: Theme = {
  id: "night",
  name: "night",
  category: "colorful",
  description: "Mystical purple theme with night vibes",
  colors: {
    background: {
      primary: "#221D27",
      secondary: "#120D10",
      sidebar: "#161014",
      chat: "#221D27",
    },
    text: {
      primary: "#F2EBFA",
      secondary: "#9EA5BA",
      muted: "534760",
      inverse: "#1a0b2e",
      heading: "#E46BAB",
      block: "2C2632",
    },
    border: {
      primary: "#2E2834",
      secondary: "#2d1b69",
      focus: "#a855f7",
    },
    primary: {
      DEFAULT: "#E46BAB",
      hover: "#7483B9",
      active: "#C5BBD1",
    },
    chat: {
      userBubble: "#2C2632",
      assistantBubble: "#221D27",
      userText: "#F2EBFA",
      assistantText: "#F2EBFA",
    },
    accent: {
      DEFAULT: "814E7C",
      hover: "#9333ea",
    },
    success: "#10b981",
    warning: "#f59e0b",
    error: "#ef4444",
  },
  preview: {
    primary: "#221D27",
    secondary: "#464462",
    gradient: "linear-gradient(135deg, #221D27 0%, #464462 100%)",
  },
};
