// components/ChatSidebar.tsx

import React, { useState } from "react";
import { useMutation, useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { ScrollArea } from "../ui/scroll-area";
import {
  Plus,
  MessageSquare,
  Search,
  Trash2,
  Share2,
  Columns2,
  GitBranch,
  Pin,
  PinOff,
} from "lucide-react";
import { Id } from "../../../convex/_generated/dataModel";
import { toast } from "sonner";
import { SignOutButton } from "../../SignOutButton";
import UserPrompt from "../chat/UserPrompt";
import KeyInput from "../chat/KeyInput";

interface Chat {
  _id: Id<"chats">;
  title: string;
  model: string;
  createdAt: number;
  updatedAt: number;
  pinned: boolean;
}

interface ChatSidebarProps {
  chats: Chat[];
  selectedChatId: Id<"chats"> | null;
  onSelectChat: (chatId: Id<"chats">) => void;
  onCreateChat: () => Promise<void>;
  onToggleSidebar: () => void;
  sidebarOpen: boolean;
  getChatData: (chatId: Id<"chats">) => any;
  isPrefetched: (chatId: Id<"chats">) => boolean;
  isPrefetchLoading: boolean;
  onNavigateToThemes?: () => void;
}

export const ChatSidebar = ({
  chats,
  selectedChatId,
  onSelectChat,
  onCreateChat,
  onToggleSidebar,

  getChatData,
  isPrefetched,
  isPrefetchLoading,
  onNavigateToThemes,
}: ChatSidebarProps) => {
  const [searchQuery, setSearchQuery] = useState("");

  const deleteChat = useMutation(api.chats.deleteChat);
  const shareChat = useMutation(api.chats.shareChat);
  const pinChat = useMutation(api.chats.pinned);
  const unpinChat = useMutation(api.chats.unpinned);

  // Filter and sort chats
  const filteredChats = chats.filter((chat) =>
    chat.title.toLowerCase().includes(searchQuery.toLowerCase()),
  );
  const pinnedChats = filteredChats.filter((chat) => chat.pinned);
  const unpinnedChats = filteredChats.filter((chat) => !chat.pinned);

  const handleDeleteChat = async (chatId: Id<"chats">, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!confirm("Are you sure you want to delete this chat?")) return;
    try {
      await deleteChat({ chatId });
      toast.success("Chat deleted");
      if (selectedChatId === chatId) onSelectChat(null as any);
    } catch {
      toast.error("Failed to delete chat");
    }
  };

  const handleShareChat = async (chatId: Id<"chats">, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      const shareId = await shareChat({ chatId });
      const shareUrl = `${window.location.origin}/shared/${shareId}`;
      await navigator.clipboard.writeText(shareUrl);
      toast.success("Share link copied to clipboard");
    } catch {
      toast.error("Failed to share chat");
    }
  };

  const handlePinChat = async (chatId: Id<"chats">, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await pinChat({ chatId });
      toast.success("Chat pinned");
    } catch {
      toast.error("Failed to pin chat");
    }
  };

  const handleUnpinChat = async (chatId: Id<"chats">, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await unpinChat({ chatId });
      toast.success("Chat unpinned");
    } catch {
      toast.error("Failed to unpin chat");
    }
  };

  const formatDate = (timestamp: number) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);
    if (diffInHours < 24) {
      return date.toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      });
    } else if (diffInHours < 24 * 7) {
      return date.toLocaleDateString([], { weekday: "short" });
    } else {
      return date.toLocaleDateString([], { month: "short", day: "numeric" });
    }
  };

  // Always call useQuery unconditionally
  const ChatIcon = ({ chatId }: { chatId: Id<"chats"> }) => {
    const prefetchedData = getChatData(chatId);
    const hasBranchesQuery = useQuery(api.branches.chatHasBranches, { chatId });
    const hasBranches = prefetchedData
      ? prefetchedData.hasBranches
      : hasBranchesQuery;
    return hasBranches ? (
      <GitBranch className="h-5 w-5 text-theme-accent flex-shrink-0" />
    ) : (
      <MessageSquare className="h-5 w-5 text-theme-primary flex-shrink-0" />
    );
  };

  const renderChatCard = (chat: Chat, isPinned: boolean) => (
    <div
      key={chat._id}
      onClick={() => onSelectChat(chat._id)}
      className={`group relative flex items-center gap-3 px-4 py-3 rounded-2xl shadow-md transition-all cursor-pointer
        ${
          selectedChatId === chat._id
            ? "bg-theme-accent/10 border-2 border-theme-accent"
            : isPinned
              ? "bg-theme-warning/5 border border-theme-warning/30"
              : "bg-theme-bg-primary border border-theme-border-primary hover:bg-theme-bg-secondary"
        }
      `}
      style={{
        marginBottom: 14,
        minWidth: 0,
        maxWidth: "100%",
        backdropFilter: "blur(6px)",
        WebkitBackdropFilter: "blur(6px)",
      }}
      tabIndex={0}
      aria-label={`Open chat: ${chat.title}`}
    >
      <div className="flex-shrink-0">
        <ChatIcon chatId={chat._id} />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <h3
            className="font-semibold text-base truncate text-theme-text-primary max-w-[160px]"
            title={chat.title}
          >
            {chat.title}
          </h3>
          {isPinned && (
            <span title="Pinned">
              <Pin className="h-4 w-4 text-theme-warning drop-shadow" />
            </span>
          )}
          {isPrefetched(chat._id) && (
            <div
              className="w-2 h-2 bg-theme-success rounded-full"
              title="Prefetched"
            />
          )}
        </div>
        <div className="flex items-center justify-between mt-1">
          <p
            className="text-xs text-theme-text-muted truncate max-w-[120px]"
            title={chat.model}
          >
            {chat.model.split("/").pop()?.split(":")[0]}
          </p>
          <span className="text-xs text-theme-text-muted">
            {formatDate(chat.updatedAt)}
          </span>
        </div>
      </div>
      <div className="flex items-center gap-1 ml-2">
        {isPinned ? (
          <Button
            variant="ghost"
            size="icon"
            onClick={(e) => {
              void handleUnpinChat(chat._id, e);
            }}
            className="h-7 w-7"
            aria-label="Unpin"
            title="Unpin"
          >
            <PinOff className="h-4 w-4 text-theme-warning" />
          </Button>
        ) : (
          <Button
            variant="ghost"
            size="icon"
            onClick={(e) => {
              void handlePinChat(chat._id, e);
            }}
            className="h-7 w-7"
            aria-label="Pin"
            title="Pin"
          >
            <Pin className="h-4 w-4 text-theme-text-muted" />
          </Button>
        )}
        <Button
          variant="ghost"
          size="icon"
          onClick={(e) => {
            void handleShareChat(chat._id, e);
          }}
          className="h-7 w-7"
          aria-label="Share"
          title="Share"
        >
          <Share2 className="h-4 w-4 text-theme-accent" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          onClick={(e) => {
            void handleDeleteChat(chat._id, e);
          }}
          className="h-7 w-7"
          aria-label="Delete"
          title="Delete"
        >
          <Trash2 className="h-4 w-4 text-theme-error" />
        </Button>
      </div>
    </div>
  );

  return (
    <div
      className="w-[24svw]  m-2  rounded-xl max-w-[100vw] h-[95svh] bg-theme-bg-sidebar border-2 border-theme-border-primary  flex flex-col"
      style={{
        boxShadow:
          "0 4px 32px 0 rgba(80,120,255,0.08), 0 1.5px 4px 0 rgba(0,0,0,0.03)",
        backdropFilter: "blur(8px)",
        WebkitBackdropFilter: "blur(8px)",
      }}
    >
      {/* Header */}
      <div className="p-5 border-b border-theme-border-primary ">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center  justify-between gap-2">
            <Button variant="ghost" size="icon" onClick={onToggleSidebar}>
              <Columns2 className="h-5 w-5" />
            </Button>
            <SignOutButton />
          </div>
        </div>
        <Button
          onClick={() => {
            void onCreateChat();
          }}
          className="w-full mb-3 bg-theme-primary hover:bg-theme-primary-hover text-theme-text-inverse font-semibold shadow"
        >
          <Plus className="h-5 w-5 mr-2" />
          New Chat
        </Button>
        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-theme-text-muted" />
          <Input
            placeholder="Search chats..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 rounded-lg border-theme-border-primary bg-theme-bg-primary focus:ring-2 focus:ring-theme-border-focus"
          />
        </div>
      </div>

      {/* Chat List */}
      <ScrollArea className="flex-1">
        <div className="p-4">
          {filteredChats.length === 0 ? (
            <div className="text-center py-8 text-theme-text-muted">
              {searchQuery ? "No chats found" : "No chats yet"}
            </div>
          ) : (
            <>
              {pinnedChats.length > 0 && (
                <div>
                  <div className="flex items-center mb-2 gap-1">
                    <Pin className="h-4 w-4 text-theme-warning" />
                    <span className="text-xs font-bold text-theme-warning uppercase tracking-wide">
                      Pinned
                    </span>
                  </div>
                  <div className="space-y-2 mb-4">
                    {pinnedChats.map((chat) => renderChatCard(chat, true))}
                  </div>
                </div>
              )}
              {unpinnedChats.length > 0 && (
                <div>
                  {pinnedChats.length > 0 && (
                    <div className="flex items-center mb-2 mt-4 gap-1">
                      <MessageSquare className="h-4 w-4 text-theme-accent" />
                      <span className="text-xs font-bold text-theme-accent uppercase tracking-wide">
                        All Chats
                      </span>
                    </div>
                  )}
                  <div className="space-y-2">
                    {unpinnedChats.map((chat) => renderChatCard(chat, false))}
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </ScrollArea>

      {/* Footer */}
      <div className="p-4 border-t border-theme-border-primary ">
        <div className="flex gap-3 mb-3">
          <UserPrompt />
          <KeyInput />
        </div>

        {/* Themes Button */}
        {onNavigateToThemes && (
          <Button
            onClick={onNavigateToThemes}
            variant="outline"
            className="w-full mb-3 bg-theme-accent/5 hover:bg-theme-accent/10 border-theme-accent/30 text-theme-accent font-medium"
          >
            <svg
              className="h-4 w-4 mr-2"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zM21 5a2 2 0 00-2-2h-4a2 2 0 00-2 2v12a4 4 0 004 4h4a2 2 0 002-2V5z"
              />
            </svg>
            Themes
          </Button>
        )}

        <div className="text-xs text-theme-text-muted text-center space-y-1">
          {chats.length > 0 && (
            <p className="text-theme-success">
              ⚡{" "}
              {
                chats.slice(0, 10).filter((chat) => isPrefetched(chat._id))
                  .length
              }
              /10 chats prefetched
            </p>
          )}
        </div>
      </div>
    </div>
  );
};
