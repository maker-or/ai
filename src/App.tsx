import { Authenticated, Unauthenticated, useQuery } from "convex/react";
import { api } from "../convex/_generated/api";
import { SignInForm } from "./SignInForm";
import { OnboardingGate } from "./components/onboarding/OnboardingGate";
import { Suspense, lazy } from "react";
import { LoadingSpinner } from "./components/ui/LoadingSpinner";

import { Toaster } from "sonner";

// Lazy load heavy components for better initial loading
const AppRouter = lazy(() =>
  import("./components/AppRouter").then((module) => ({
    default: module.AppRouter,
  })),
);

export default function App() {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Authenticated>
        <OnboardingGate>
          <Suspense
            fallback={
              <LoadingSpinner
                size="lg"
                fullScreen
                message="Loading application..."
              />
            }
          >
            <AppRouter />
          </Suspense>
        </OnboardingGate>
      </Authenticated>
      <Unauthenticated>
        <main className="flex-1 flex items-center justify-center p-8">
          <div className="w-full max-w-md mx-auto">
            <SignInForm />
          </div>
        </main>
      </Unauthenticated>
      <Toaster />
    </div>
  );
}

// function Content() {
//   const loggedInUser = useQuery(api.auth.loggedInUser);

//     return (
//       <div className="flex flex-col gap-section">
//         <div className="text-center">
//           <h1 className="text-5xl text-theme-chat-assistant-text mb-4">
//             Ready to <span className="font-serif italic">Nerd</span> out?
//           </h1>
//         </div>
//         <SignInForm />
//       </div>
//     );

// }
