import React, { useState, useEffect } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { ChatWindow } from "./ChatWindow";
import { CommandPalette } from "../CommandPalette";
import { Id } from "../../../convex/_generated/dataModel";
import { useChatPrefetch } from "../../hooks/useChatPrefetch";
import { useAuthActions } from "@convex-dev/auth/react";
import Timeline from "./Timeline";

interface ChatInterfaceProps {
  onNavigateToThemes?: () => void;
  onNavigateToAgentPlan?: () => void;
}

export const ChatInterface: React.FC<ChatInterfaceProps> = ({
  onNavigateToThemes,
  onNavigateToAgentPlan,
}) => {
  const [selectedChatId, setSelectedChatId] = useState<Id<"chats"> | null>(
    null,
  );
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const chats = useQuery(api.chats.listChats) || [];
  const createChat = useMutation(api.chats.createChat);
  const { signOut } = useAuthActions();

  // Get messages for the selected chat
  const messages = useQuery(
    api.messages.getMessages,
    selectedChatId ? { chatId: selectedChatId } : "skip"
  ) || [];

  // Prefetch data for top 10 chats when sidebar is open
  const chatIds = chats.map((chat) => chat._id);
  const {
    getChatData,
    isPrefetched,
    isLoading: isPrefetchLoading,
  } = useChatPrefetch({
    enabled: sidebarOpen,
    chatIds,
    maxChats: 10,
  });

  const handleCreateChat = async (): Promise<void> => {
    try {
      const chatId = await createChat({
        title: "New Chat",
        model: "nvidia/llama-3.3-nemotron-super-49b-v1:free",
      });
      setSelectedChatId(chatId);
    } catch (error) {
      console.error("Failed to create chat:", error);
    }
  };

  const handleSelectChat = (chatId: Id<"chats">) => {
    setSelectedChatId(chatId);
  };

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  const handleQuestionClick = (messageId: Id<"messages">) => {
    const messageElement = document.getElementById(`message-${messageId}`);
    if (messageElement) {
      messageElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  };

  const LOCAL_STORAGE_KEY = "lastChatId";

  useEffect(() => {
    // Only set if not already set (e.g., on first load)
    if (!selectedChatId) {
      const stored = localStorage.getItem(LOCAL_STORAGE_KEY);
      if (stored) {
        setSelectedChatId(stored as Id<"chats">);
      }
    }
    // Only run on mount
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (selectedChatId) {
      localStorage.setItem(LOCAL_STORAGE_KEY, selectedChatId);
    }
  }, [selectedChatId]);

  return (
    <div className="flex h-screen bg-background">
      {messages.length > 0 && (
        <Timeline messages={messages} onQuestionClick={handleQuestionClick} />
      )}
  
      <ChatWindow
        chatId={selectedChatId}
        setChatId={setSelectedChatId}
        onToggleSidebar={toggleSidebar}
        sidebarOpen={sidebarOpen}
        prefetchedChatData={
          selectedChatId ? getChatData(selectedChatId) : undefined
        }
      />

      {/* Command Palette */}
      <CommandPalette
        onSelectChat={handleSelectChat}
        onCreateChat={handleCreateChat}
        onNavigateToThemes={onNavigateToThemes}
        onNavigateToAgentPlan={onNavigateToAgentPlan}
        onSignOut={() => void signOut()}
      />
    </div>
  );
};
