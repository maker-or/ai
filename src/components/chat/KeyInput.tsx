// components/ApiKeyModal.tsx
import { useState } from "react";
import { useMutation, useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";

export default function KeyInput() {
  const [open, setOpen] = useState(false);
  const [apiKey, setApiKey] = useState("");
  const [status, setStatus] = useState<"idle" | "saving" | "success" | "error">(
    "idle",
  );

  const existingKey = useQuery(api.saveApiKey.getkey, {});
  const saveApiKey = useMutation(api.saveApiKey.saveApiKey);

  const saveKey = async () => {
    setStatus("saving");
    try {
      await saveApiKey({ apiKey });
      setStatus("success");
      setApiKey("");
    } catch (err) {
      setStatus("error");
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    void saveKey();
  };

  return (
    <>
      <button
        aria-label="Set API Key"
        className="bg-transparent border-none cursor-pointer text-theme-text-muted hover:text-theme-text-secondary transition-colors"
        onClick={() => setOpen(true)}
      >
        {/* Key SVG icon */}
        <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
          <circle cx="15" cy="9" r="6" stroke="currentColor" strokeWidth="2" />
          <rect x="2" y="17" width="8" height="4" rx="2" fill="currentColor" />
          <rect
            x="6"
            y="13"
            width="4"
            height="8"
            rx="2"
            fill="currentColor"
            transform="rotate(-45 6 13)"
          />
        </svg>
      </button>
      {open && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50"
          onClick={() => setOpen(false)}
        >
          <div
            className="bg-theme-bg-primary rounded-lg p-8 min-w-80 shadow-2xl relative"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              className="absolute top-3 right-3 bg-transparent border-none text-xl cursor-pointer text-theme-text-muted hover:text-theme-text-primary transition-colors"
              aria-label="Close"
              onClick={() => setOpen(false)}
              type="button"
            >
              ×
            </button>
            <form onSubmit={handleSubmit} className="space-y-4">
              <label
                htmlFor="api-key"
                className="block text-theme-text-primary font-medium"
              >
                {existingKey ? "Update your API Key:" : "Enter your API Key:"}
              </label>
              <input
                id="api-key"
                type="password"
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                placeholder="sk-..."
                className="w-full p-3 rounded border border-theme-border-primary bg-theme-bg-secondary text-theme-text-primary focus:border-theme-border-focus focus:outline-none"
                required
              />
              <button
                type="submit"
                disabled={status === "saving" || !apiKey}
                className="px-4 py-2 bg-theme-primary text-theme-text-inverse rounded hover:bg-theme-primary-hover disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {status === "saving" ? "Saving..." : "Save Key"}
              </button>
              {status === "success" && (
                <div className="text-theme-success mt-2">
                  Key saved successfully!
                </div>
              )}
              {status === "error" && (
                <div className="text-theme-error mt-2">
                  Failed to save key. Try again.
                </div>
              )}
              {existingKey && (
                <div className="text-theme-text-muted mt-2 text-sm">
                  (A key is already set. Saving will overwrite it.)
                </div>
              )}
            </form>
          </div>
        </div>
      )}
    </>
  );
}
