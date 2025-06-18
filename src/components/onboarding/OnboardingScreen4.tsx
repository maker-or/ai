// src/components/onboarding/OnboardingScreen4.tsx
import React, { useState } from "react";
import { useMutation } from "convex/react";
import { api } from "../../../convex/_generated/api";

const OnboardingScreen4: React.FC = () => {
  const [apiKey, setApiKey] = useState("");
  const [status, setStatus] = useState<"idle" | "saving" | "success" | "error">("idle");
  
  const saveApiKey = useMutation(api.saveApiKey.saveApiKey);

  const handleSaveKey = async () => {
    if (!apiKey.trim()) return;
    
    setStatus("saving");
    try {
      await saveApiKey({ apiKey: apiKey.trim() });
      setStatus("success");
    } catch (err) {
      setStatus("error");
      console.error("Failed to save API key:", err);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleSaveKey();
  };

  return (
    <div className="min-h-screen bg-theme-bg-primary flex items-center justify-center p-6">
      <div className="max-w-md w-full">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl  text-theme-chat-assistant-text mb-2">
            Setup <span className="font-serif italic">Openrouter key</span>
          </h1>

        </div>

        {/* Main Content */}
        <div className="backdrop-blur-md rounded-2xl p-6">
          <form onSubmit={handleSubmit} className="space-y-6">


            {/* API Key Input */}
            <div>
 
              <input
                id="api-key"
                type="password"
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                placeholder="sk-or-v1-..."
                className="w-full p-4 rounded-xl border border-white/20 bg-white/10 backdrop-blur-md text-white placeholder-white/50 focus:border-white/40 focus:outline-none focus:ring-2 focus:ring-white/20 transition-all"
                disabled={status === "saving"}
              />
              {status === "error" && (
                <p className="text-red-300 text-sm mt-2">
                  Failed to save API key. Please try again.
                </p>
              )}
              {status === "success" && (
                <p className="text-green-300 text-sm mt-2">
                  ✓ API key saved successfully!
                </p>
              )}
            </div>

            {/* Save Button */}
            {apiKey.trim() && (
              <button
                type="submit"
                disabled={status === "saving"}
                className="w-full py-3 px-4 bg-white text-gray-900 hover:bg-gray-100 rounded-xl font-medium transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {status === "saving" ? "Saving..." : "Save API Key"}
              </button>
            )}
          </form>
        </div>

        {/* Security Note */}
        {/* <div className=" text-center">
          <p className="text-white/50 text-xs">
            🔒 Your API key is encrypted and stored securely
          </p>
        </div> */}
      </div>
    </div>
  );
};

export default OnboardingScreen4;
