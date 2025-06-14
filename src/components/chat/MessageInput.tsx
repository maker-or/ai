import React, { useState, useCallback, memo, useEffect, useRef } from "react";
import { useMutation } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { Textarea } from "../ui/textarea";
import { SendButton } from "./SendButton";
import { Id } from "../../../convex/_generated/dataModel";

interface MessageInputProps {
  onSendMessage: (message: string) => void;
  disabled?: boolean;
  isLoading?: boolean;
  chatId: Id<"chats"> | null;
}

export const MessageInput = memo(
  ({ onSendMessage, disabled = false, isLoading = false, chatId }: MessageInputProps) => {
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

    const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
      if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault();
        handleSend();
      }
    }, [handleSend]);

    return (
      <div className="border-t border-border p-4">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-end space-x-3">
            <div className="flex-1">
              <Textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Type your message..."
                className="min-h-[60px] max-h-32 resize-none"
                disabled={disabled || isLoading}
              />
            </div>
            <SendButton
              onClick={handleSend}
              disabled={false}
              isLoading={isLoading}
            />
          </div>

          <div className="flex items-center justify-between mt-2 text-xs text-muted">
            <span>Press Enter to send, Shift+Enter for new line</span>
            <span>{message.length}/4000</span>
          </div>
        </div>
      </div>
    );
  },
);

MessageInput.displayName = "MessageInput";
