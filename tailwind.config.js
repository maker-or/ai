const { fontFamily } = require("tailwindcss/defaultTheme");

module.exports = {
  content: ["./index.html", "./src/**/*.{vue,js,ts,jsx,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        sans: ["Inter var", ...fontFamily.sans],
        serif: ["Instrument Serif", "serif"],
      },
      borderRadius: {
        DEFAULT: "8px",
        secondary: "4px",
        container: "12px",
      },
      boxShadow: {
        DEFAULT: "0 1px 4px rgba(0, 0, 0, 0.1)",
        hover: "0 2px 8px rgba(0, 0, 0, 0.12)",
      },
      colors: {
        // Theme-aware colors using CSS variables
        theme: {
          bg: {
            primary: "var(--theme-bg-primary)",
            secondary: "var(--theme-bg-secondary)",
            sidebar: "var(--theme-bg-sidebar)",
            chat: "var(--theme-bg-chat)",
          },
          text: {
            primary: "var(--theme-text-primary)",
            secondary: "var(--theme-text-secondary)",
            muted: "var(--theme-text-muted)",
            inverse: "var(--theme-text-inverse)",
            heading: "var(--theme-text-heading)",
            block: "var(--theme-text-block)",
          },
          border: {
            primary: "var(--theme-border-primary)",
            secondary: "var(--theme-border-secondary)",
            focus: "var(--theme-border-focus)",
          },
          primary: {
            DEFAULT: "var(--theme-primary)",
            hover: "var(--theme-primary-hover)",
            active: "var(--theme-primary-active)",
          },
          chat: {
            "user-bubble": "var(--theme-chat-user-bubble)",
            "assistant-bubble": "var(--theme-chat-assistant-bubble)",
            "user-text": "var(--theme-chat-user-text)",
            "assistant-text": "var(--theme-chat-assistant-text)",
          },
          accent: {
            DEFAULT: "var(--theme-accent)",
            hover: "var(--theme-accent-hover)",
          },
          success: "var(--theme-success)",
          warning: "var(--theme-warning)",
          error: "var(--theme-error)",
        },

        // Modern design system aliases for convenience
        background: "var(--theme-bg-primary)",
        foreground: "var(--theme-text-primary)",
        muted: "var(--theme-text-muted)",
        surface: "var(--theme-bg-secondary)",
        border: "var(--theme-border-primary)",
        input: "var(--theme-border-primary)",
        ring: "var(--theme-border-focus)",

        // Semantic color aliases
        destructive: "var(--theme-error)",
      },
      spacing: {
        "form-field": "16px",
        section: "32px",
      },
    },
  },
};
