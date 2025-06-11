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
  Settings,
  GitBranch
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
}

interface ChatSidebarProps {
  chats: Chat[];
  selectedChatId: Id<"chats"> | null;
  onSelectChat: (chatId: Id<"chats">) => void;
  onCreateChat: () => Promise<void>;
  onToggleSidebar: () => void;
}

export const ChatSidebar = ({
  chats,
  selectedChatId,
  onSelectChat,
  onCreateChat,
  onToggleSidebar,
}: ChatSidebarProps) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearching, setIsSearching] = useState(false);

  const deleteChat = useMutation(api.chats.deleteChat);
  const shareChat = useMutation(api.chats.shareChat);

  const filteredChats = chats.filter(chat =>
    chat.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleDeleteChat = async (chatId: Id<"chats">, e: React.MouseEvent) => {
    e.stopPropagation();
    
    if (!confirm("Are you sure you want to delete this chat?")) {
      return;
    }

    try {
      await deleteChat({ chatId });
      toast.success("Chat deleted");
      
      // If the deleted chat was selected, clear selection
      if (selectedChatId === chatId) {
        onSelectChat(null as any);
      }
    } catch (error) {
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
    } catch (error) {
      toast.error("Failed to share chat");
    }
  };

  const formatDate = (timestamp: number) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);

    if (diffInHours < 24) {
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } else if (diffInHours < 24 * 7) {
      return date.toLocaleDateString([], { weekday: 'short' });
    } else {
      return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
    }
  };

  const ChatIcon = ({ chatId }: { chatId: Id<"chats"> }) => {
    const hasBranches = useQuery(api.branches.chatHasBranches, { chatId });
    return hasBranches ? (
      <GitBranch className="h-4 w-4 mt-1 text-gray-400 flex-shrink-0" />
    ) : (
      <MessageSquare className="h-4 w-4 mt-1 text-gray-400 flex-shrink-0" />
    );
  };

  return (
    <div className="w-80 bg-white border-r border-gray-200 flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold">AI Chat</h2>
          <div className="flex items-center space-x-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={onToggleSidebar}
            >
              <X className="h-4 w-4" />
            </Button>
            <SignOutButton />
          </div>
        </div>
        
        <Button
          onClick={() => void onCreateChat()}
          className="w-full mb-3"
        >
          <Plus className="h-4 w-4 mr-2" />
          New Chat
        </Button>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Search chats..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      {/* Chat List */}
      <ScrollArea className="flex-1">
        <div className="p-2">
          {filteredChats.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              {searchQuery ? "No chats found" : "No chats yet"}
            </div>
          ) : (
            <div className="space-y-1">
              {filteredChats.map((chat) => (
                <div
                  key={chat._id}
                  onClick={() => onSelectChat(chat._id)}
                  className={`group relative p-3 rounded-lg cursor-pointer transition-colors ${
                    selectedChatId === chat._id
                      ? "bg-blue-50 border border-blue-200"
                      : "hover:bg-gray-50"
                  }`}
                >
                  <div className="flex items-start space-x-3">
                    <ChatIcon chatId={chat._id} />
                    <div className="flex-1 min-w-0">
                      <h3 className="font-medium text-sm truncate">
                        {chat.title}
                      </h3>
                      <div className="flex items-center justify-between mt-1">
                        <p className="text-xs text-gray-500 truncate">
                          {chat.model.split('/').pop()?.split(':')[0]}
                        </p>
                        <span className="text-xs text-gray-400">
                          {formatDate(chat.updatedAt)}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Action buttons */}
                  <div className="absolute right-2 top-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <div className="flex items-center space-x-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={(e) => void handleShareChat(chat._id, e)}
                        className="h-6 w-6"
                      >
                        <Share2 className="h-3 w-3" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={(e) => void handleDeleteChat(chat._id, e)}
                        className="h-6 w-6 text-red-500 hover:text-red-700"
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </ScrollArea>

      {/* Footer */}
      <div className="p-4 border-t border-gray-200">
        <div className="text-xs text-gray-500 text-center">
          <p>Powered by OpenRouter</p>
          <p className="mt-1">Llama 3.3 & DeepSeek models</p>
        </div>
      </div>
    </div>
  );
};
