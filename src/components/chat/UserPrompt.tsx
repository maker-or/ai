// components/UserPrompt.tsx
import React, { useState, useEffect } from "react";
import { useMutation, useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";

// Simple modal styles
const modalStyles: React.CSSProperties = {
  position: "fixed",
  top: 0,
  left: 0,
  width: "100vw",
  height: "100vh",
  background: "rgba(0,0,0,0.3)",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  zIndex: 1000,
};

const modalContentStyles: React.CSSProperties = {
  background: "#fff",
  borderRadius: 8,
  padding: 24,
  minWidth: 320,
  boxShadow: "0 2px 16px rgba(0,0,0,0.15)",
  display: "flex",
  flexDirection: "column",
  gap: 16,
  zIndex: 50,
};

const iconButtonStyles: React.CSSProperties = {
  background: "#f3f4f6",
  border: "none",
  borderRadius: "50%",
  width: 40,
  height: 40,
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  cursor: "pointer",
  boxShadow: "0 1px 4px rgba(0,0,0,0.08)",
};

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
        style={iconButtonStyles}
        aria-label="Edit system prompt"
        onClick={() => setOpen(true)}
        title="Edit system prompt"
      >
        {/* Pencil icon (SVG) */}
        <svg width={20} height={20} fill="none" viewBox="0 0 20 20">
          <path
            d="M14.85 2.85a1.2 1.2 0 0 1 1.7 1.7l-9.1 9.1-2.13.43a.5.5 0 0 1-.59-.59l.43-2.13 9.1-9.1ZM3 17h14a1 1 0 1 1 0 2H3a1 1 0 1 1 0-2Z"
            fill="#555"
          />
        </svg>
      </button>
      {open && (
        <div
          className="z-10 bg-red-200"
          style={modalStyles}
          onClick={() => setOpen(false)}
        >
          <div
            style={modalContentStyles}
            onClick={(e) => e.stopPropagation()}
            role="dialog"
            aria-modal="true"
            aria-labelledby="user-prompt-modal-title"
          >
            <h3 id="user-prompt-modal-title" style={{ margin: 0 }}>
              Set System Prompt
            </h3>
            <textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              rows={4}
              style={{
                width: "100%",
                fontSize: 16,
                padding: 8,
                borderRadius: 4,
                border: "1px solid #e5e7eb",
                resize: "vertical",
              }}
              placeholder="e.g. 'Be concise and friendly.'"
              disabled={saving}
            />
            <div
              style={{ display: "flex", justifyContent: "flex-end", gap: 8 }}
            >
              <button
                onClick={() => setOpen(false)}
                style={{
                  background: "#f3f4f6",
                  border: "none",
                  borderRadius: 4,
                  padding: "8px 16px",
                  cursor: "pointer",
                }}
                disabled={saving}
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  void handleSave();
                }}
                style={{
                  background: "#2563eb",
                  color: "#fff",
                  border: "none",
                  borderRadius: 4,
                  padding: "8px 16px",
                  cursor: "pointer",
                  opacity: getPrompt === undefined || saving ? 0.6 : 1,
                }}
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
