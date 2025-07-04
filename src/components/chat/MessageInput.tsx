// MessageInput.tsx

import React, { useState, useCallback, memo, useEffect, useRef } from "react";
import { useMutation } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { Textarea } from "../ui/textarea";
import { SendButton } from "./SendButton";
import { ModelSelector } from "./ModelSelector";
import { Id } from "../../../convex/_generated/dataModel";
import { Globe } from "lucide-react";

interface MessageInputProps {
  onSendMessage: (message: string, web?: boolean) => void;
  disabled?: boolean;
  isLoading?: boolean;
  chatId: Id<"chats"> | null;
  selectedModel?: string;
  onModelChange?: (model: string) => void;
  showInline?: boolean;
  isWebSearching?: boolean; // Add this prop to show when web search is active
}

export const MessageInput = memo(
  ({
    onSendMessage,
    disabled = false,
    isLoading = false,
    chatId,
    selectedModel = "nvidia/llama-3.3-nemotron-super-49b-v1:free",
    onModelChange,
    showInline = false,
    isWebSearching = false,
  }: MessageInputProps) => {
    const [message, setMessage] = useState("");
    const [webActive, setWebActive] = useState(false);

    const setTypingStatus = useMutation(api.sync.setTypingStatus);

    // Use ref to store current message to avoid dependency issues
    const messageRef = useRef(message);
    messageRef.current = message;

    // Handle typing indicator
    useEffect(() => {
      let typingTimer: NodeJS.Timeout;

      if (message.trim() && chatId) {
        void setTypingStatus({ chatId, isTyping: true });

        typingTimer = setTimeout(() => {
          void setTypingStatus({ chatId, isTyping: false });
        }, 1000);
      } else if (chatId) {
        void setTypingStatus({ chatId, isTyping: false });
      }

      return () => {
        if (typingTimer) clearTimeout(typingTimer);
      };
    }, [message, chatId, setTypingStatus]);

    const handleSend = useCallback(() => {
      const trimmedMessage = messageRef.current.trim();
      if (trimmedMessage && !disabled && !isLoading) {
        console.log(`🚀 Sending message with web search: ${webActive}`);
        onSendMessage(trimmedMessage, webActive);
        setMessage(""); // Clear the input after sending
        // Don't reset webActive - keep it for the user to see and decide
      }
    }, [onSendMessage, disabled, isLoading, webActive]);

    const handleKeyDown = useCallback(
      (e: React.KeyboardEvent) => {
        if (e.key === "Enter" && !e.shiftKey) {
          e.preventDefault();
          handleSend();
        }
      },
      [handleSend],
    );

    const handleToggleWeb = () => {
      setWebActive((prev) => !prev);
    };

    return (
      <div className="p-4 ">
        <div className="max-w-3xl p-3 mx-auto">
          <div className="rounded-[24px] max-w-2xl border-4 border-theme-border-primary bg-theme-bg-secondary">
            {/* Part 1: Input Field */}
            <div className="bg-theme-bg-sidebar rounded-t-[24px] border-b border-theme-border-primary shadow-sm">
              <Textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Type your message..."
                className="bg-theme-bg-sidebar border-none text-theme-chat-assistant-text rounded-t-[20px] focus:ring-none focus:outline-none min-h-[100px] max-h-40 resize-none p-5 w-full transition-all"
                disabled={disabled || isLoading}
              />
            </div>

            {/* Part 2: Model Selector and Send Button */}
            <div className="flex p-2 items-center  justify-between">
              {/* Left side - Model Selector and globe */}
              <div className="flex gap-2 justify-center items-center">
                <div className="flex items-center">
                  {onModelChange && (
                    <ModelSelector
                      selectedModel={selectedModel}
                      onModelChange={onModelChange}
                    />
                  )}
                </div>

                {/* Globe Icon */}
                <div 
                  className="relative cursor-pointer" 
                  onClick={handleToggleWeb}
                  title={webActive ? "Web search enabled - Click to disable" : "Enable web search for current context"}
                >
                  <Globe
                    className={`transition-all duration-200 ${
                      webActive
                        ? "text-theme-accent scale-110" // Active color with slight scale
                        : "text-gray-400 hover:text-gray-600" // Inactive color with hover
                    } ${isLoading && webActive ? "animate-spin" : ""}`} // Spinning when searching
 
                  />

                </div>
              </div>

              {/* Right side - Send Button */}
              <div className="flex items-center space-x-2 text-theme-chat-assistant-text">
                <SendButton
                  onClick={handleSend}
                  disabled={disabled || isLoading || !message.trim()}
                  isLoading={isLoading}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  },
);

MessageInput.displayName = "MessageInput";
