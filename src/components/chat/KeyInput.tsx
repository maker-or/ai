// components/ApiKeyModal.tsx
import { useState } from "react";
import { useMutation, useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";

// Simple modal styles
const modalStyles: React.CSSProperties = {
  position: "fixed",
  top: 0,
  left: 0,
  width: "100vw",
  height: "100vh",
  background: "rgba(0,0,0,0.4)",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  zIndex: 1000,
};

const modalContentStyles: React.CSSProperties = {
  background: "#fff",
  borderRadius: 8,
  padding: 32,
  minWidth: 320,
  boxShadow: "0 2px 16px rgba(0,0,0,0.2)",
  position: "relative",
};

const closeButtonStyles: React.CSSProperties = {
  position: "absolute",
  top: 12,
  right: 12,
  background: "none",
  border: "none",
  fontSize: 20,
  cursor: "pointer",
};

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

  // Icon: you can replace with any SVG or icon library
  return (
    <>
      <button
        aria-label="Set API Key"
        style={{
          background: "none",
          border: "none",
          cursor: "pointer",
          fontSize: 28,
          color: "#555",
        }}
        onClick={() => setOpen(true)}
      >
        {/* Key SVG icon */}
        <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
          <circle cx="15" cy="9" r="6" stroke="#555" strokeWidth="2" />
          <rect x="2" y="17" width="8" height="4" rx="2" fill="#555" />
          <rect
            x="6"
            y="13"
            width="4"
            height="8"
            rx="2"
            fill="#555"
            transform="rotate(-45 6 13)"
          />
        </svg>
      </button>
      {open && (
        <div style={modalStyles} onClick={() => setOpen(false)}>
          <div
            style={modalContentStyles}
            onClick={(e) => e.stopPropagation()} // Prevent modal close on content click
          >
            <button
              style={closeButtonStyles}
              aria-label="Close"
              onClick={() => setOpen(false)}
              type="button"
            >
              ×
            </button>
            <form onSubmit={handleSubmit}>
              <label
                htmlFor="api-key"
                style={{ display: "block", marginBottom: 8 }}
              >
                {existingKey ? "Update your API Key:" : "Enter your API Key:"}
              </label>
              <input
                id="api-key"
                type="password"
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                placeholder="sk-..."
                style={{ width: "100%", padding: 8, marginBottom: 12 }}
                required
              />
              <button
                type="submit"
                disabled={status === "saving" || !apiKey}
                style={{ padding: "8px 16px" }}
              >
                {status === "saving" ? "Saving..." : "Save Key"}
              </button>
              {status === "success" && (
                <div style={{ color: "green", marginTop: 8 }}>
                  Key saved successfully!
                </div>
              )}
              {status === "error" && (
                <div style={{ color: "red", marginTop: 8 }}>
                  Failed to save key. Try again.
                </div>
              )}
              {existingKey && (
                <div style={{ color: "gray", marginTop: 8 }}>
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
