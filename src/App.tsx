import { Authenticated, Unauthenticated, useQuery } from "convex/react";
import { api } from "../convex/_generated/api";
import { SignInForm } from "./SignInForm";
import { SignOutButton } from "./SignOutButton";
import { Toaster } from "sonner";
import { ChatInterface } from "./components/chat/ChatInterface";

export default function App() {
  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Authenticated>
        <ChatInterface />
      </Authenticated>
      <Unauthenticated>
        <header className="sticky top-0 z-10 bg-white/80 backdrop-blur-sm h-16 flex justify-between items-center border-b shadow-sm px-4">
          <h2 className="text-xl font-semibold text-primary">Chef AI Chat</h2>
        </header>
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
        <h1 className="text-5xl font-bold text-primary mb-4">Cook with Chef</h1>
      </div>
      <SignInForm />
    </div>
  );
}
