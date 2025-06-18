// components/UserPrompt.tsx
import React, { useState, useEffect } from "react";
import { useMutation, useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";

export default function UserPrompt() {
  const getPrompt = useQuery(api.users.getPrompt, {});
  const updatePrompt = useMutation(api.users.updatePrompt);
  const [prompt, setPrompt] = useState("");
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (typeof getPrompt === "string") setPrompt(getPrompt);
  }, [getPrompt]);

  const handleSave = async () => {
    setSaving(true);
    try {
      await updatePrompt({ prompt });
      setOpen(false);
    } catch (err: any) {
      alert("Failed to update prompt: " + err.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <main>
      <button
        className="bg-theme-bg-secondary border-none rounded-full w-10 h-10 flex items-center justify-center cursor-pointer shadow hover:shadow-md transition-shadow"
        aria-label="Edit system prompt"
        onClick={() => setOpen(true)}
        title="Edit system prompts"
      >
        {/* Pencil icon (SVG) */}
        <svg width={20} height={20} fill="none" viewBox="0 0 20 20">
          <path
            d="M14.85 2.85a1.2 1.2 0 0 1 1.7 1.7l-9.1 9.1-2.13.43a.5.5 0 0 1-.59-.59l.43-2.13 9.1-9.1ZM3 17h14a1 1 0 1 1 0 2H3a1 1 0 1 1 0-2Z"
            fill="currentColor"
            className="text-theme-text-muted"
          />
        </svg>
      </button>
      {open && (
        <div
          className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50"
          onClick={() => setOpen(false)}
        >
          <div
            className="bg-theme-bg-primary rounded-lg p-6 min-w-80 shadow-2xl flex flex-col gap-4 z-50"
            onClick={(e) => e.stopPropagation()}
            role="dialog"
            aria-modal="true"
            aria-labelledby="user-prompt-modal-title"
          >
            <h3 id="user-prompt-modal-title" className="m-0 text-theme-text-primary font-medium">
              Set System Prompt
            </h3>
            <textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              rows={4}
              className="w-full text-base p-2 rounded border border-theme-border-primary bg-theme-bg-secondary text-theme-text-primary resize-y focus:border-theme-border-focus focus:outline-none"
              placeholder="e.g. 'Be concise and friendly.'"
              disabled={saving}
            />
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setOpen(false)}
                className="bg-theme-bg-secondary border-none rounded px-4 py-2 cursor-pointer text-theme-text-primary hover:bg-theme-border-primary transition-colors"
                disabled={saving}
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  void handleSave();
                }}
                className="bg-theme-primary text-theme-text-inverse border-none rounded px-4 py-2 cursor-pointer hover:bg-theme-primary-hover disabled:opacity-60 disabled:cursor-not-allowed transition-colors"
                disabled={getPrompt === undefined || saving}
              >
                {saving ? "Saving..." : "Save"}
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
