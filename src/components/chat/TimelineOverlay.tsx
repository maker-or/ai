import React from "react";
import { Id } from "../../../convex/_generated/dataModel";

// Message type matching the actual convex schema
interface Message {
  _id: Id<"messages">;
  _creationTime: number;
  model?: string;
  parentId?: Id<"messages">;
  branchId?: Id<"branches">;
  createdAt: number;
  chatId: Id<"chats">;
  role: "user" | "assistant" | "system";
  content: string;
  isActive: boolean;
}

interface TimelineOverlayProps {
  messages: Message[];
  onQuestionClick: (messageId: Id<"messages">) => void;
  hoveredIndex?: number;
}

const TimelineOverlay: React.FC<TimelineOverlayProps> = ({
  messages,
  onQuestionClick,
  hoveredIndex,
}) => {
  return (
    <div className="p-3 w-80 bg-theme-bg-secondary rounded-lg border-4 border-theme-border-primary">
      <ul className="space-y-2 max-h-60 overflow-y-auto">
        {messages.map((msg, index) => (
          <li key={msg._id}>
            <button
              onClick={() => onQuestionClick(msg._id)}
              className={`text-left text-sm p-2 rounded w-full transition-colors ${
                index === hoveredIndex
                  ? "bg-theme-border-focus  text-theme-chat-assistant-text"
                  : " text-theme-chat-assistant-text hover:bg-theme-border-focus opacity-60"
              }`}
              title={msg.content}
            >
              <div className="truncate">
                <span className="text-xs text-gray-500 dark:text-gray-400">
                  Q{index + 1}:{" "}
                </span>
                {msg.content}
              </div>
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default TimelineOverlay;
