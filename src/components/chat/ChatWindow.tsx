// ChatWindow.tsx

import { useState, useRef, useEffect, useCallback } from "react";
import { useMutation, useAction } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { Button } from "../ui/button";
import { ScrollArea } from "../ui/scroll-area";
import { Menu } from "lucide-react";
import { Id } from "../../../convex/_generated/dataModel";
import { toast } from "sonner";
import { BranchSelector } from "./BranchSelector";
import { MessageInput } from "./MessageInput";
import MarkdownRenderer from "../ui/MarkdownRenderer";
import { useChatData } from "../../hooks/useChatPrefetch";
import { GitBranch, Copy } from "lucide-react";

interface PrefetchedChatData {
  chat: any;
  messages: any[];
  activeBranch: any;
  streamingSession: any;
  hasBranches: boolean;
}

interface ChatWindowProps {
  chatId: Id<"chats"> | null;
  setChatId: (id: Id<"chats">) => void;
  onToggleSidebar: () => void;
  sidebarOpen: boolean;
  prefetchedChatData?: PrefetchedChatData;
}

export const ChatWindow = ({
  chatId,
  setChatId,
  onToggleSidebar,
  sidebarOpen,
  prefetchedChatData,
}: ChatWindowProps) => {
  const [isLoading, setIsLoading] = useState(false);
  const [selectedModel, setSelectedModel] = useState(
    "nvidia/llama-3.3-nemotron-super-49b-v1:free",
  );
  const [selectedMessageId, setSelectedMessageId] = useState<
    Id<"messages"> | undefined
  >(undefined);

  const scrollAreaRef = useRef<HTMLDivElement>(null);

  // Use prefetched data when available, fallback to regular queries
  const { chat, activeBranch, messages, streamingSession, isPrefetched } =
    useChatData(chatId, prefetchedChatData);

  const addMessage = useMutation(api.messages.addMessage);
  const updateChat = useMutation(api.chats.updateChat);
  const createChat = useMutation(api.chats.createChat);
  const streamChatCompletion = useAction(api.ai.streamChatCompletion);

  // Use ref to store current messages to avoid dependency issues
  const messagesRef = useRef(messages);
  messagesRef.current = messages;

  // --- SMART SCROLL LOGIC ---
  // Track if we should scroll up by 100svh after a new message
  const [shouldScrollUp, setShouldScrollUp] = useState(false);

  // Helper: is user at bottom?
  const isUserAtBottom = () => {
    const container = scrollAreaRef.current;
    if (!container) return false;
    return (
      container.scrollHeight - container.scrollTop - container.clientHeight < 50
    );
  };

  // Track previous messages length to detect new message
  const prevMessagesLength = useRef(messages.length);

  useEffect(() => {
    if (messages.length > prevMessagesLength.current) {
      // New message added
      if (isUserAtBottom()) {
        setShouldScrollUp(true);
      }
    }
    prevMessagesLength.current = messages.length;
  }, [messages.length]);

  // Scroll up by 100svh ONCE if shouldScrollUp is true
  useEffect(() => {
    if (shouldScrollUp) {
      const container = scrollAreaRef.current;
      if (container) {
        container.scrollBy({
          top: -window.innerHeight, // 100svh
          behavior: "smooth",
        });
      }
      setShouldScrollUp(false);
    }
  }, [shouldScrollUp]);

  // --- END SMART SCROLL LOGIC ---

  const handleSendMessage = useCallback(
    async (messageText: string, web = false) => {
      if (!messageText.trim() || isLoading) return;

      const currentMessage = messageText.trim();
      setIsLoading(true);

      try {
        let currentChatId = chatId;

        // If no chat exists, create one first
        if (!currentChatId) {
          const title =
            currentMessage.length > 50
              ? currentMessage.substring(0, 50) + "..."
              : currentMessage;
          currentChatId = await createChat({
            title,
            model: selectedModel,
          });
          setChatId(currentChatId);
        }

        // Get current messages from ref to avoid dependency
        const currentMessages = messagesRef.current || [];

        // Add user message
        const messageId = await addMessage({
          chatId: currentChatId,
          role: "user",
          content: currentMessage,
          parentId: selectedMessageId || undefined,
          branchId: activeBranch?._id,
        });

        // Update chat title if it's the first message
        if (currentMessages.length === 0 && chatId) {
          const title =
            currentMessage.length > 50
              ? currentMessage.substring(0, 50) + "..."
              : currentMessage;
          await updateChat({
            chatId: currentChatId,
            title,
            model: selectedModel,
          });
        }

        // Prepare messages for AI
        const chatMessages = [
          ...currentMessages.map((msg) => ({
            role: msg.role,
            content: msg.content,
          })),
          { role: "user" as const, content: currentMessage },
        ];

        // Stream AI response
        await streamChatCompletion({
          chatId: currentChatId,
          messages: chatMessages,
          model: selectedModel,
          parentMessageId: messageId,
          branchId: activeBranch?._id,
          webSearch: web,
        });
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : "Failed to send message";
        toast.error(errorMessage);
        console.error("Error sending message:", err);
      } finally {
        setIsLoading(false);
      }
    },
    [
      chatId,
      setChatId,
      isLoading,
      addMessage,
      createChat,
      selectedMessageId,
      activeBranch?._id,
      updateChat,
      selectedModel,
      streamChatCompletion,
    ],
  );

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      toast.success("Copied to clipboard");
    } catch (error) {
      toast.error("Failed to copy");
    }
  };

  const handleCreateBranch = (messageId: Id<"messages">) => {
    console.log("ChatWindow handleCreateBranch called with:", messageId);
    setSelectedMessageId(messageId);
    setBranchDialogOpen(true);
  };

  const [branchDialogOpen, setBranchDialogOpen] = useState(false);

  if (!chatId) {
    return (
      <div className="flex-1 flex flex-col">
        {/* Header with sidebar toggle */}
        <header className="bg-theme-bg-primary p-1 flex items-center justify-between">
          <div className="flex items-center ">
            <BranchSelector
              chatId={null}
              currentMessageId={selectedMessageId}
              branchDialogOpen={branchDialogOpen}
              setBranchDialogOpen={setBranchDialogOpen}
            />
          </div>
        </header>
        <div className="flex-1 flex items-center justify-center bg-theme-bg-chat">
          <div className="text-center items-center justify-center max-w-full w-full px-4">
            <div className="max-w-2xl mx-auto">
              <MessageInput
                onSendMessage={(msg) => {
                  void handleSendMessage(msg);
                }}
                disabled={false}
                isLoading={isLoading}
                chatId={null}
                selectedModel={selectedModel}
                onModelChange={setSelectedModel}
                showInline={false}
              />
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col bg-theme-bg-chat">
      <header className="bg-theme-bg-primaryflex  p-1 items-center justify-between">
        <div className="flex items-center ">
          <BranchSelector
            chatId={chatId}
            currentMessageId={selectedMessageId}
            branchDialogOpen={branchDialogOpen}
            setBranchDialogOpen={setBranchDialogOpen}
          />
        </div>
      </header>
      {/* <StreamControls chatId={chatId} /> */}
      <ScrollArea className="flex-1  p-4" ref={scrollAreaRef}>
        <div className="max-w-4xl mx-auto space-y-6">
          {messages.map((msg) => (
            <div
              key={msg._id}
              id={`message-${msg._id}`}
              className="group"
            >
              <div
                className={`flex items-start space-x-3 ${
                  msg.role === "user" ? "flex-row-reverse space-x-reverse" : ""
                }`}
              >
                <div
                  className={`max-w-3xl rounded-lg p-4 ${
                    msg.role === "user"
                      ? "bg-theme-chat-user-bubble text-theme-chat-user-text"
                      : " text-theme-chat-assistant-text"
                  }`}
                >
                  <div className="message-content">
                    {msg.role === "user" ? (
                      <div className="whitespace-pre-wrap">
                        {msg.content as string}
                      </div>
                    ) : (
                      <MarkdownRenderer
                        chunks={
                          Array.isArray(msg.content) ? msg.content : [msg.content]
                        }
                        id={msg._id}
                      />
                    )}
                  </div>
                </div>
              </div>
              <div className={`flex items-center mt-2 opacity-0 group-hover:opacity-100 transition-opacity ${
                msg.role === "user" ? "justify-end" : "justify-start"
              }`}>
                <div className="flex items-center space-x-1">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => void copyToClipboard(msg.content)}
                    className="h-6 w-6 bg-theme-bg-secondary/30 hover:bg-theme-bg-secondary text-theme-text-secondary hover:text-theme-text-primary"
                  >
                    <Copy className="h-3 w-3" />
                  </Button>
                  {msg.role === "assistant" && (
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleCreateBranch(msg._id)}
                      className="h-6 w-6 bg-theme-bg-secondary/30 hover:bg-theme-bg-secondary text-theme-text-secondary hover:text-theme-text-primary"
                    >
                      <GitBranch className="h-3 w-3" />
                    </Button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </ScrollArea>
      <MessageInput
        onSendMessage={(msg) => {
          void handleSendMessage(msg);
        }}
        disabled={false}
        isLoading={isLoading}
        chatId={chatId}
        selectedModel={selectedModel}
        onModelChange={setSelectedModel}
        showInline={false}
      />
    </div>
  );
};
