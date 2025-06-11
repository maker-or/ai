import React, { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { ChatSidebar } from "./ChatSidebar";
import { ChatWindow } from "./ChatWindow";
import { Id } from "../../../convex/_generated/dataModel";

export const ChatInterface = () => {
  const [selectedChatId, setSelectedChatId] = useState<Id<"chats"> | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const chats = useQuery(api.chats.listChats) || [];
  const createChat = useMutation(api.chats.createChat);

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

  return (
    <div className="flex h-screen bg-gray-50">
      {sidebarOpen && (
        <ChatSidebar
          chats={chats}
          selectedChatId={selectedChatId}
          onSelectChat={handleSelectChat}
          onCreateChat={handleCreateChat}
          onToggleSidebar={toggleSidebar}
        />
      )}
      <ChatWindow
        chatId={selectedChatId}
        onToggleSidebar={toggleSidebar}
        sidebarOpen={sidebarOpen}
      />
    </div>
  );
};
