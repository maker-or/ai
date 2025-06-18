import React from "react";
import TimelineOverlay from "./TimelineOverlay";
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

interface TimelineProps {
  messages: Message[];
  onQuestionClick: (messageId: Id<"messages">) => void;
}

const Timeline: React.FC<TimelineProps> = ({ messages, onQuestionClick }) => {
  const [isHovered, setIsHovered] = React.useState(false);
  const [hoveredIndex, setHoveredIndex] = React.useState<number | null>(null);
  const timelineRef = React.useRef<HTMLDivElement>(null);
  const userMessages = messages.filter((msg) => msg.role === "user");

  // Close overlay when clicking outside
  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (timelineRef.current && !timelineRef.current.contains(event.target as Node)) {
        setIsHovered(false);
        setHoveredIndex(null);
      }
    };

    if (isHovered) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isHovered]);

  if (userMessages.length === 0) {
    return null;
  }

  return (
    <div className="relative flex flex-col justify-center w-8 h-full py-4 px-1" ref={timelineRef}>
      <div className="flex flex-col space-y-2 w-full">
        {userMessages.map((msg, index) => {
          return (
            <div
              key={msg._id}
              className="w-6 h-1 bg-theme-text-primary hover:bg-border-focus rounded-lg cursor-pointer transition-colors"
              onMouseEnter={() => {
                setIsHovered(true);
                setHoveredIndex(index);
              }}
              onClick={() => onQuestionClick(msg._id)}
            />
          );
        })}
      </div>
      
      {/* Overlay container that extends to cover the gap */}
      {isHovered && hoveredIndex !== null && (
        <div
          className="absolute left-0 top-1/2 -translate-y-1/2 w-96 h-80 z-10"
          onMouseLeave={() => {
            setIsHovered(false);
            setHoveredIndex(null);
          }}
        >
          <div className="ml-8">
            <TimelineOverlay
              messages={userMessages}
              onQuestionClick={onQuestionClick}
              hoveredIndex={hoveredIndex}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default Timeline;
