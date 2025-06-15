import React, { useState, useCallback, memo, useEffect, useRef } from "react";
import { useMutation } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { Textarea } from "../ui/textarea";
import { SendButton } from "./SendButton";
import { ModelSelector } from "./ModelSelector";
import { Id } from "../../../convex/_generated/dataModel";

interface MessageInputProps {
  onSendMessage: (message: string) => void;
  disabled?: boolean;
  isLoading?: boolean;
  chatId: Id<"chats"> | null;
  selectedModel?: string;
  onModelChange?: (model: string) => void;
  showInline?: boolean;
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
  }: MessageInputProps) => {
    const [message, setMessage] = useState("");

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
        onSendMessage(trimmedMessage);
        setMessage(""); // Clear the input after sending
      }
    }, [onSendMessage, disabled, isLoading]);

    const handleKeyDown = useCallback(
      (e: React.KeyboardEvent) => {
        if (e.key === "Enter" && !e.shiftKey) {
          e.preventDefault();
          handleSend();
        }
      },
      [handleSend],
    );

    return (
      <div className="p-4">
        <div className="max-w-4xl  mx-auto">
          <div className="rounded-[24px] border-4 border-theme-border-primary bg-theme-bg-secondary">
            {/* Part 1: Input Field */}
            <div className="bg-theme-bg-sidebar rounded-t-[24px] border-b border-theme-border-primary  shadow-sm">
              <Textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Type your message..."
                className="bg-theme-bg-sidebar border-none rounded-t-[20px] focus:ring-none focus:outline-none min-h-[100px] max-h-40 resize-none p-5 w-full transition-all"
                disabled={disabled || isLoading}
              />
            </div>

            {/* Part 2: Model Selector and Send Button */}
            <div className="flex p-2  items-center justify-between">
              {/* Left side - Model Selector */}
              <div className="flex items-center">
                {onModelChange && (
                  <ModelSelector
                    selectedModel={selectedModel}
                    onModelChange={onModelChange}
                  />
                )}
              </div>

              {/* Right side - Send Button */}
              <div className="flex items-center space-x-2">
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
