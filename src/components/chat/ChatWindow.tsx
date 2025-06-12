import React, {
  useState,
  useRef,
  useEffect,
  useCallback,
  useMemo,
} from "react";
import { useQuery, useMutation, useAction } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { Button } from "../ui/button";
import { ScrollArea } from "../ui/scroll-area";
import { Avatar, AvatarFallback } from "../ui/avatar";
import { Menu, Bot, User, Copy, GitBranch } from "lucide-react";
import { Id } from "../../../convex/_generated/dataModel";
import { toast } from "sonner";
import { SignOutButton } from "../../SignOutButton";
import { ModelSelector } from "./ModelSelector";
import { BranchSelector } from "./BranchSelector";
import { StreamControls } from "./StreamControls";
import { SyncIndicator } from "./SyncIndicator";
import { MessageInput } from "./MessageInput";
import { MarkdownRenderer } from "../ui/MarkdownRenderer";
import { useChatData } from "../../hooks/useChatPrefetch";

interface PrefetchedChatData {
  chat: any;
  messages: any[];
  activeBranch: any;
  streamingSession: any;
  hasBranches: boolean;
}

interface ChatWindowProps {
  chatId: Id<"chats"> | null;
  onToggleSidebar: () => void;
  sidebarOpen: boolean;
  prefetchedChatData?: PrefetchedChatData;
}

export const ChatWindow = ({
  chatId,
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
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Use prefetched data when available, fallback to regular queries
  const { chat, activeBranch, messages, streamingSession, isPrefetched } =
    useChatData(chatId, prefetchedChatData);

  const addMessage = useMutation(api.messages.addMessage);
  const updateChat = useMutation(api.chats.updateChat);
  const streamChatCompletion = useAction(api.ai.streamChatCompletion);
  const setTypingStatus = useMutation(api.sync.setTypingStatus);

  // Use ref to store current messages to avoid dependency issues
  const messagesRef = useRef(messages);
  messagesRef.current = messages;

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, streamingSession]);

  // Handle typing indicator - moved to MessageInput component

  const handleSendMessage = useCallback(
    async (messageText: string) => {
      if (!messageText.trim() || !chatId || isLoading) return;

      const currentMessage = messageText.trim();
      setIsLoading(true);

      try {
        // Get current messages from ref to avoid dependency
        const currentMessages = messagesRef.current || [];

        // Add user message
        const messageId = await addMessage({
          chatId,
          role: "user",
          content: currentMessage,
          parentId: selectedMessageId || undefined,
          branchId: activeBranch?._id,
        });

        // Update chat title if it's the first message
        if (currentMessages.length === 0) {
          const title =
            currentMessage.length > 50
              ? currentMessage.substring(0, 50) + "..."
              : currentMessage;
          await updateChat({
            chatId,
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
          chatId,
          messages: chatMessages,
          model: selectedModel,
          parentMessageId: messageId,
          branchId: activeBranch?._id,
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
      isLoading,
      addMessage,
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
    setSelectedMessageId(messageId);
    // Directly trigger branch creation dialog
    setBranchDialogOpen(true);
  };

  const [branchDialogOpen, setBranchDialogOpen] = useState(false);

  if (!chatId) {
    return (
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <header className="bg-white border-b border-gray-200 p-4 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            {!sidebarOpen && (
              <Button variant="ghost" size="icon" onClick={onToggleSidebar}>
                <Menu className="h-5 w-5" />
              </Button>
            )}
            <h1 className="text-xl font-semibold">AI Chat</h1>
          </div>
          <SignOutButton />
        </header>

        {/* Empty State */}
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center max-w-md">
            <Bot className="h-16 w-16 mx-auto mb-4 text-gray-400" />
            <h2 className="text-2xl font-semibold mb-2">Welcome to AI Chat</h2>
            <p className="text-gray-600 mb-6">
              Select a chat from the sidebar or create a new one to start
              chatting with AI. Features include real-time sync, chat branching,
              and resumable streams.
            </p>
            <div className="mb-4">
              <p className="text-sm text-gray-500 mb-2">Available Models:</p>
              <ModelSelector
                selectedModel={selectedModel}
                onModelChange={setSelectedModel}
              />
            </div>
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-sm">
              <p className="font-medium text-blue-900 mb-2">
                OpenRouter Required
              </p>
              <p className="text-blue-700">
                This app uses OpenRouter to access Llama 3.3 and DeepSeek
                models. Please set your OPENROUTER_API_KEY in the environment
                variables.
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 p-4 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          {!sidebarOpen && (
            <Button variant="ghost" size="icon" onClick={onToggleSidebar}>
              <Menu className="h-5 w-5" />
            </Button>
          )}
          <div>
            <h1 className="text-lg font-semibold">{chat?.title || "Chat"}</h1>
            <div className="flex items-center space-x-2">
              <p className="text-sm text-gray-500">{chat?.model}</p>
              <SyncIndicator chatId={chatId} />
            </div>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <SignOutButton />
        </div>
      </header>

      {/* Stream Controls */}
      <StreamControls chatId={chatId} />

      {/* Messages */}
      <ScrollArea className="flex-1 p-4">
        <div className="max-w-4xl mx-auto space-y-6">
          {messages.map((msg) => (
            <div
              key={msg._id}
              className={`flex items-start space-x-3 ${
                msg.role === "user" ? "flex-row-reverse space-x-reverse" : ""
              }`}
            >
              <Avatar className="w-8 h-8">
                <AvatarFallback>
                  {msg.role === "user" ? (
                    <User className="h-4 w-4" />
                  ) : (
                    <Bot className="h-4 w-4" />
                  )}
                </AvatarFallback>
              </Avatar>

              <div
                className={`group max-w-3xl rounded-lg p-4 ${
                  msg.role === "user"
                    ? "bg-blue-500 text-white"
                    : "bg-gray-100 text-gray-900"
                }`}
              >
                <div className="message-content">
                  {msg.role === "user" ? (
                    // User messages as plain text since they're typically not markdown
                    <div className="whitespace-pre-wrap">{msg.content}</div>
                  ) : (
                    // AI messages rendered as markdown
                    <MarkdownRenderer content={msg.content} />
                  )}
                </div>

                <div className="flex items-center justify-between mt-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <span className="text-xs opacity-70">
                    {new Date(msg.createdAt).toLocaleTimeString()}
                  </span>
                  <div className="flex items-center space-x-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => void copyToClipboard(msg.content)}
                      className="h-6 w-6"
                    >
                      <Copy className="h-3 w-3" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleCreateBranch(msg._id)}
                      className="h-6 w-6"
                    >
                      <GitBranch className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          ))}

          {/* Streaming indicator with live content */}

          <div ref={messagesEndRef} />
        </div>
      </ScrollArea>

      {/* Controls at bottom */}
      <div className="border-t border-gray-200 px-4 py-2">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <BranchSelector
              chatId={chatId}
              currentMessageId={selectedMessageId}
              branchDialogOpen={branchDialogOpen}
              setBranchDialogOpen={setBranchDialogOpen}
            />
            <ModelSelector
              selectedModel={selectedModel}
              onModelChange={setSelectedModel}
            />
          </div>
        </div>
      </div>

      {/* Input */}
      <MessageInput
        onSendMessage={handleSendMessage}
        disabled={false}
        isLoading={isLoading}
        chatId={chatId}
      />
    </div>
  );
};
