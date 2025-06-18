import { createRoot } from "react-dom/client";
import { ConvexAuthProvider } from "@convex-dev/auth/react";
import { ConvexReactClient } from "convex/react";
import { ThemeProvider } from "./contexts/ThemeContext";
import { measurePerformance } from "./lib/performance";
import "./index.css";
import App from "./App";

// Performance monitoring
measurePerformance.mark("app-start");

// Initialize Convex client with error handling
const convex = new ConvexReactClient(
  import.meta.env.VITE_CONVEX_URL ||
    (import.meta.env.NEXT_PUBLIC_CONVEX_URL as string),
);

// Remove initial loader once React mounts
document.documentElement.classList.add("react-loaded");

measurePerformance.mark("react-render-start");

createRoot(document.getElementById("root")!).render(
  <ConvexAuthProvider client={convex}>
    <ThemeProvider>
      <App />
    </ThemeProvider>
  </ConvexAuthProvider>,
);

// Measure initial render time
setTimeout(() => {
  measurePerformance.mark("react-render-end");
  const renderTime = measurePerformance.measure(
    "react-render",
    "react-render-start",
    "react-render-end",
  );
  console.log(`React render time: ${renderTime}ms`);

  // Start Core Web Vitals monitoring
  measurePerformance.measureCoreWebVitals();
}, 0);
