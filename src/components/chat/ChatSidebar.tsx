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
  X,
  GitBranch,
  Pin,
  PinOff,
} from "lucide-react";
import { Id } from "../../../convex/_generated/dataModel";
import { toast } from "sonner";
import { SignOutButton } from "../../SignOutButton";

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
}

export const ChatSidebar = ({
  chats,
  selectedChatId,
  onSelectChat,
  onCreateChat,
  onToggleSidebar,
  sidebarOpen,
  getChatData,
  isPrefetched,
  isPrefetchLoading,
}: ChatSidebarProps) => {
  const [searchQuery, setSearchQuery] = useState("");

  const deleteChat = useMutation(api.chats.deleteChat);
  const shareChat = useMutation(api.chats.shareChat);
  const pinChat = useMutation(api.chats.pinned);
  const unpinChat = useMutation(api.chats.unpinned);

  // Filter and sort chats
  const filteredChats = chats.filter((chat) =>
    chat.title.toLowerCase().includes(searchQuery.toLowerCase())
  );
  const pinnedChats = filteredChats.filter((chat) => chat.pinned);
  const unpinnedChats = filteredChats.filter((chat) => !chat.pinned);

  const handleDeleteChat = async (
    chatId: Id<"chats">,
    e: React.MouseEvent
  ) => {
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

  const handleShareChat = async (
    chatId: Id<"chats">,
    e: React.MouseEvent
  ) => {
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

  const handlePinChat = async (
    chatId: Id<"chats">,
    e: React.MouseEvent
  ) => {
    e.stopPropagation();
    try {
      await pinChat({ chatId });
      toast.success("Chat pinned");
    } catch {
      toast.error("Failed to pin chat");
    }
  };

  const handleUnpinChat = async (
    chatId: Id<"chats">,
    e: React.MouseEvent
  ) => {
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
      return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
    } else if (diffInHours < 24 * 7) {
      return date.toLocaleDateString([], { weekday: "short" });
    } else {
      return date.toLocaleDateString([], { month: "short", day: "numeric" });
    }
  };

  const ChatIcon = ({ chatId }: { chatId: Id<"chats"> }) => {
    const prefetchedData = getChatData(chatId);
    const hasBranches = prefetchedData
      ? prefetchedData.hasBranches
      : useQuery(api.branches.chatHasBranches, { chatId });
    return hasBranches ? (
      <GitBranch className="h-5 w-5 text-indigo-400 flex-shrink-0" />
    ) : (
      <MessageSquare className="h-5 w-5 text-sky-400 flex-shrink-0" />
    );
  };

  const renderChatCard = (chat: Chat, isPinned: boolean) => (
    <div
      key={chat._id}
      onClick={() => onSelectChat(chat._id)}
      className={`group relative flex items-center gap-3 px-4 py-3 rounded-2xl shadow-md transition-all cursor-pointer
        ${
          selectedChatId === chat._id
            ? "bg-gradient-to-r from-blue-100/80 to-blue-50 border-2 border-blue-400"
            : isPinned
            ? "bg-gradient-to-r from-yellow-50/80 to-white border border-yellow-200"
            : "bg-white/80 border border-gray-200 hover:bg-blue-50/60"
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
            className="font-semibold text-base truncate text-gray-900 max-w-[160px]"
            title={chat.title}
          >
            {chat.title}
          </h3>
          {isPinned && (
            <span title="Pinned">
              <Pin className="h-4 w-4 text-yellow-500 drop-shadow" />
            </span>
          )}
          {isPrefetched(chat._id) && (
            <div
              className="w-2 h-2 bg-green-500 rounded-full"
              title="Prefetched"
            />
          )}
        </div>
        <div className="flex items-center justify-between mt-1">
          <p
            className="text-xs text-gray-500 truncate max-w-[120px]"
            title={chat.model}
          >
            {chat.model.split("/").pop()?.split(":")[0]}
          </p>
          <span className="text-xs text-gray-400">{formatDate(chat.updatedAt)}</span>
        </div>
      </div>
      <div className="flex items-center gap-1 ml-2">
        {isPinned ? (
          <Button
            variant="ghost"
            size="icon"
            onClick={(e) => handleUnpinChat(chat._id, e)}
            className="h-7 w-7"
            aria-label="Unpin"
            title="Unpin"
          >
            <PinOff className="h-4 w-4 text-yellow-500" />
          </Button>
        ) : (
          <Button
            variant="ghost"
            size="icon"
            onClick={(e) => handlePinChat(chat._id, e)}
            className="h-7 w-7"
            aria-label="Pin"
            title="Pin"
          >
            <Pin className="h-4 w-4 text-gray-400" />
          </Button>
        )}
        <Button
          variant="ghost"
          size="icon"
          onClick={(e) => handleShareChat(chat._id, e)}
          className="h-7 w-7"
          aria-label="Share"
          title="Share"
        >
          <Share2 className="h-4 w-4 text-sky-500" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          onClick={(e) => handleDeleteChat(chat._id, e)}
          className="h-7 w-7"
          aria-label="Delete"
          title="Delete"
        >
          <Trash2 className="h-4 w-4 text-rose-500" />
        </Button>
      </div>
    </div>
  );

  return (
    <div
      className="w-96 min-w-[320px] max-w-[100vw] h-full bg-gradient-to-b from-blue-100/60 via-white/80 to-white/90 border-r border-gray-200 flex flex-col"
      style={{
        boxShadow:
          "0 4px 32px 0 rgba(80,120,255,0.08), 0 1.5px 4px 0 rgba(0,0,0,0.03)",
        backdropFilter: "blur(8px)",
        WebkitBackdropFilter: "blur(8px)",
      }}
    >
      {/* Header */}
      <div className="p-5 border-b border-gray-200 bg-white/80">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-extrabold text-blue-700 tracking-tight">
              AI Chat
            </h2>
            {isPrefetchLoading && (
              <div
                className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"
                title="Prefetching..."
              />
            )}
          </div>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" onClick={onToggleSidebar}>
              <X className="h-5 w-5" />
            </Button>
            <SignOutButton />
          </div>
        </div>
        <Button
          onClick={() => void onCreateChat()}
          className="w-full mb-3 bg-gradient-to-r from-blue-500 to-sky-400 hover:from-blue-600 hover:to-sky-500 text-white font-semibold shadow"
        >
          <Plus className="h-5 w-5 mr-2" />
          New Chat
        </Button>
        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Search chats..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 rounded-lg border-gray-300 bg-white/80 focus:ring-2 focus:ring-blue-200"
          />
        </div>
      </div>

      {/* Chat List */}
      <ScrollArea className="flex-1">
        <div className="p-4">
          {filteredChats.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              {searchQuery ? "No chats found" : "No chats yet"}
            </div>
          ) : (
            <>
              {pinnedChats.length > 0 && (
                <div>
                  <div className="flex items-center mb-2 gap-1">
                    <Pin className="h-4 w-4 text-yellow-500" />
                    <span className="text-xs font-bold text-yellow-700 uppercase tracking-wide">
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
                      <MessageSquare className="h-4 w-4 text-sky-400" />
                      <span className="text-xs font-bold text-blue-700 uppercase tracking-wide">
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
      <div className="p-4 border-t border-gray-200 bg-white/80">
        <div className="text-xs text-gray-500 text-center space-y-1">
          <p>
            <span className="font-semibold text-blue-600">Powered by OpenRouter</span>
          </p>
          <p>Llama 3.3 & DeepSeek models</p>
          {chats.length > 0 && (
            <p className="text-green-600">
              ⚡ {chats.slice(0, 10).filter((chat) => isPrefetched(chat._id)).length}/10 chats prefetched
            </p>
          )}
        </div>
      </div>
    </div>
  );
};
