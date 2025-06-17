import { Authenticated, Unauthenticated, useQuery } from "convex/react";
import { api } from "../convex/_generated/api";
import { SignInForm } from "./SignInForm";
import { OnboardingGate } from "./components/onboarding/OnboardingGate";

import { Toaster } from "sonner";
import { AppRouter } from "./components/AppRouter";

export default function App() {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      {/* <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
      </head> */}
      <Authenticated>
        <OnboardingGate>
          <AppRouter />
        </OnboardingGate>
      </Authenticated>
      <Unauthenticated>
        <main className="flex-1 flex items-center justify-center p-8">
          <div className="w-full max-w-md mx-auto">
            <Content />
          </div>
        </main>
      </Unauthenticated>
      <Toaster />
    </div>
  );
}

function Content() {
  const loggedInUser = useQuery(api.auth.loggedInUser);

  if (loggedInUser === undefined) {
    return (
      <div className="flex justify-center items-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-section">
      <div className="text-center">
        <h1 className="text-5xl  text-primary mb-4">
          Ready to <span className="font-serif italic">Nerd</span> out?
        </h1>
      </div>
      <SignInForm />
    </div>
  );
}
