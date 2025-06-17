import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";

// https://vite.dev/config/
export default defineConfig(({ mode }) => ({
  plugins: [
    react(),
    // The code below enables dev tools like taking screenshots of your site
    // while it is being developed on chef.convex.dev.
    // Feel free to remove this code if you're no longer developing your app with Chef.
    mode === "development"
      ? {
          name: "inject-chef-dev",
          transform(code: string, id: string) {
            if (id.includes("main.tsx")) {
              return {
                code: `${code}

/* Added by Vite plugin inject-chef-dev */
window.addEventListener('message', async (message) => {
  if (message.source !== window.parent) return;
  if (message.data.type !== 'chefPreviewRequest') return;

  const worker = await import('https://chef.convex.dev/scripts/worker.bundled.mjs');
  await worker.respondToMessage(message);
});
            `,
                map: null,
              };
            }
            return null;
          },
        }
      : null,
    // End of code for taking screenshots on chef.convex.dev.
  ].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
    extensions: ['.ts', '.tsx', '.js', '.jsx', '.json'],
  },
  build: {
    // Optimize chunks for better loading
    rollupOptions: {
      output: {
        manualChunks: {
          // Separate vendor chunks for better caching
          vendor: ['react', 'react-dom'],
          convex: ['convex/react', '@convex-dev/auth/react'],
          ui: ['@radix-ui/react-dialog', '@radix-ui/react-dropdown-menu', '@radix-ui/react-select'],
          markdown: ['react-markdown', 'rehype-highlight', 'rehype-katex'],
        },
      },
    },
    // Enable source maps for debugging but keep them small
    sourcemap: mode === 'development',
    // Optimize CSS
    cssCodeSplit: true,
    // Set chunk size warning limit
    chunkSizeWarningLimit: 1000,
  },
  // Performance optimizations
  optimizeDeps: {
    // Pre-bundle these dependencies
    include: [
      'react',
      'react-dom',
      'convex/react',
      '@convex-dev/auth/react',
      'sonner',
      'lucide-react',
    ],
    // Exclude problematic dependencies from pre-bundling
    exclude: ['@vite/client', '@vite/env'],
  },
  // Server optimizations for development
  server: {
    // Enable HTTP/2 for better multiplexing
    http2: false, // Keep false for better compatibility
    // Improve HMR performance
    hmr: {
      overlay: false, // Reduce visual noise during development
    },
  },
}));
