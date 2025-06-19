import { Theme } from "./types";

export const nightTheme: Theme = {
  id: "night",
  name: "T3",
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
      focus: "#3E1828",
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
    code: {
      background: "#161014", // Using sidebar color for deeper contrast
    },
    accent: {
      DEFAULT: "#5E7D8B",
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

export const Aquilux: Theme = {
  id: " Aquilux",
  name: " Aquilux",
  category: "colorful",
  description:
    "Dive into the depth of Aquilux, where the soothing calm of a serene lake meets the vibrant freshness",
  colors: {
    background: {
      primary: "#242D31",
      secondary: "#689096",
      sidebar: "#141D22",
      chat: "#242D31",
    },
    text: {
      primary: "#E2F6FF",
      secondary: "#9EA5BA",
      muted: "30464A",
      inverse: "#1a0b2e",
      heading: "#689096",
      block: "#445963",
    },
    border: {
      primary: "#45575E",
      secondary: "#293C45",
      focus: "#183759",
    },
    primary: {
      DEFAULT: "#E46BAB",
      hover: "#7483B9",
      active: "#293C45",
    },
    chat: {
      userBubble: "#5E7D8B",
      assistantBubble: "#242D31",
      userText: "#E2F6FF",
      assistantText: "#E2F6FF",
    },
    code: {
      background: "#141D22", // Using sidebar color for deeper contrast
    },
    accent: {
      DEFAULT: "814E7C",
      hover: "#3A7E9D",
    },
    success: "#814E7C",
    warning: "#f59e0b",
    error: "#ef4444",
  },
  preview: {
    primary: "#242D31",
    secondary: "#689096",
    gradient: "linear-gradient(135deg, #242D31 0%, #689096 100%)",
  },
};

export const Wavy: Theme = {
  id: "Wavy",
  name: "Wavy",
  category: "colorful",
  description:
    "Dive into the depth of Wavy, where the soothing calm of a serene lake meets the vibrant freshness",
  colors: {
    background: {
      primary: "#5C6587",
      secondary: "#3C435D",
      sidebar: "#2D334B",
      chat: "#5C6587",
    },
    text: {
      primary: "#E2F6FF",
      secondary: "#B0B7CD",
      muted: "#BAC4E3",
      inverse: "#1a0b2e",
      heading: "#2D334B",
      block: "#67759C",
    },
    border: {
      primary: "#7785A8",
      secondary: "#4C5473",
      focus: "#385C8D",
    },
    primary: {
      DEFAULT: "#A87BC7",
      hover: "#876BA8",
      active: "#4C5473",
    },
    chat: {
      userBubble: "#7B8AB0",
      assistantBubble: "#5C6587",
      userText: "#E2F6FF",
      assistantText: "#E2F6FF",
    },
    code: {
      background: "#2D334B", // Using sidebar color for deeper contrast
    },
    accent: {
      DEFAULT: "#6B9AD1",
      hover: "#4D81B8",
    },
    success: "#6BAD6B",
    warning: "#2D334B",
    error: "#ef4444",
  },
  preview: {
    primary: "#5C6587",
    secondary: "#3C435D",
    gradient: "linear-gradient(135deg, #5C6587 0%, #3C435D 100%)",
  },
};

export const Something: Theme = {
  id: "Something",
  name: "Something",
  category: "colorful",
  description:
    "A clean and simple theme with a focus on readability and a touch of modern sophistication.",
  colors: {
    background: {
      primary: "#A8ADBB",
      secondary: "#6C707C",
      sidebar: "#8A909F",
      chat: "#A8ADBB",
    },
    text: {
      primary: "#2C2F3B",
      secondary: "#4C515F",
      muted: "#7B808F",
      inverse: "#FFFFFF",
      heading: "#3D414D",
      block: "#5C606D",
    },
    border: {
      primary: "#8A909F",
      secondary: "#B8BDCC",
      focus: "#6D717E",
    },
    primary: {
      DEFAULT: "#5D85A7",
      hover: "#496E8C",
      active: "#6C707C",
    },
    chat: {
      userBubble: "#8B909D",
      assistantBubble: "#A8ADBB",
      userText: "#2C2F3B",
      assistantText: "#2C2F3B",
    },
    code: {
      background: "#8A909F", // Using sidebar color for deeper contrast
    },
    accent: {
      DEFAULT: "#C77B5D",
      hover: "#A8644A",
    },
    success: "#6BAD6B",
    warning: "#f59e0b",
    error: "#ef4444",
  },
  preview: {
    primary: "#A8ADBB",
    secondary: "#6C707C",
    gradient: "linear-gradient(135deg, #A8ADBB 0%, #6C707C 100%)",
  },
};

export const Rose: Theme = {
  id: "Rose",
  name: "Rose",
  category: "colorful",
  description:
    "A soft and inviting theme with a warm, subtle rose palette, evoking comfort and elegance.",
  colors: {
    background: {
      primary: "#5C3F40", // Darker rose as primary
      secondary: "#BBA8A8", // Lighter rose as secondary
      sidebar: "#4B3233", // Darker sidebar for contrast
      chat: "#5C3F40",
    },
    text: {
      primary: "#F7EBEB", // Light text for dark background
      secondary: "#E0D1D1", // Slightly darker light text
      muted: "#A89494", // Muted rose
      inverse: "#5C3F40", // Dark text for light inverse areas
      heading: "#F7EBEB", // Light headings
      block: "#C7BDBD", // Light block text
    },
    border: {
      primary: "#7A6363", // Medium rose border
      secondary: "#4C3334", // Darker rose border
      focus: "#BBA8A8", // Lighter rose for focus
    },
    primary: {
      DEFAULT: "#D19B9B", // Original primary color for actions
      hover: "#B57D7D",
      active: "#BBA8A8", // Secondary background color for active
    },
    chat: {
      userBubble: "#8F7D7D", // Medium rose for user bubbles
      assistantBubble: "#5C3F40", // Primary background for assistant bubbles
      userText: "#F7EBEB", // Light text in user bubbles
      assistantText: "#F7EBEB", // Light text in assistant bubbles
    },
    code: {
      background: "#4B3233", // Using sidebar color for deeper contrast
    },
    accent: {
      DEFAULT: "#C28B7A",
      hover: "#A36F5E",
    },
    success: "#6BAD6B",
    warning: "#f59e0b",
    error: "#ef4444",
  },
  preview: {
    primary: "#5C3F40",
    secondary: "#BBA8A8",
    gradient: "linear-gradient(135deg, #5C3F40 0%, #BBA8A8 100%)",
  },
};

export const Normal: Theme = {
  id: "Normal",
  name: "Normal",
  category: "colorful",
  description:
    "A straightforward and classic theme featuring a stark contrast of black and white for ultimate clarity.",
  colors: {
    background: {
      primary: "#0C0C0C", // Black background
      secondary: "#F7EEE2", // White background
      sidebar: "#1A1A1A", // Slightly lighter black for sidebar
      chat: "#0C0C0C",
    },
    text: {
      primary: "#F7EEE2", // White text on primary black background
      secondary: "#333333", // Dark gray for secondary elements
      muted: "#999999", // Lighter gray for muted text
      inverse: "#0C0C0C", // Black for inverse text (on white secondary background)
      heading: "#F7EEE2", // White headings
      block: "#CCCCCC", // Light gray for text blocks
    },
    border: {
      primary: "#404040", // Dark gray border
      secondary: "#A0A0A0", // Medium gray border
      focus: "#808080", // Gray for focus states
    },
    primary: {
      DEFAULT: "#F7EEE2", // White for primary actions/buttons
      hover: "#E0D7CC", // Slightly off-white for hover
      active: "#BFB5A8", // Even more off-white for active
    },
    chat: {
      userBubble: "#333333", // Dark gray for user bubbles
      assistantBubble: "#0C0C0C", // Black for assistant bubbles
      userText: "#F7EEE2", // White text in user bubbles
      assistantText: "#F7EEE2", // White text in assistant bubbles
    },
    code: {
      background: "#1A1A1A", // Using sidebar color for code blocks
    },
    accent: {
      DEFAULT: "#FF9F00", // A pop of orange for accent
      hover: "#CC7F00",
    },
    success: "#4CAF50",
    warning: "#FFC107",
    error: "#F44336",
  },
  preview: {
    primary: "#0C0C0C",
    secondary: "#F7EEE2",
    gradient: "linear-gradient(135deg, #0C0C0C 0%, #F7EEE2 100%)",
  },
};
