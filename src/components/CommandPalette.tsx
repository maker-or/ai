import React, { useMemo, useEffect, useRef, useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { useCommandPalette } from "../hooks/useCommandPalette";
import { ApiKeyManager } from "./command-palette/ApiKeyManager";
import { UserPromptEditor } from "./command-palette/UserPromptEditor";
import {
  Search,
  MessageSquare,
  Pin,
  PinOff,
  Palette,
  Key,
  FileText,
  LogOut,
  Plus,
  Clock,
  Calendar,
  CalendarDays,
  Archive,
  ArrowLeft,
  Trash2,
  Share2,
  MoreHorizontal,
<<<<<<< HEAD
  Bot,
=======
>>>>>>> origin/main
} from "lucide-react";
import { format, isToday, isYesterday, isThisWeek, startOfDay } from "date-fns";
import { Id } from "../../convex/_generated/dataModel";
import { toast } from "sonner";

interface CommandPaletteProps {
  onSelectChat: (chatId: Id<"chats">) => void;
  onCreateChat: () => Promise<void>;
  onNavigateToThemes?: () => void;
<<<<<<< HEAD
  onNavigateToAgentPlan?: () => void;
=======
>>>>>>> origin/main
  onSignOut?: () => void;
}

interface CommandItem {
  id: string;
  title: string;
  subtitle?: string;
  icon: React.ReactNode;
  action: () => void;
  section: string;
  searchText: string;
  chatId?: Id<"chats">;
  isPinned?: boolean;
  actions?: Array<{
    icon: React.ReactNode;
    label: string;
    action: (e: React.MouseEvent) => void;
    variant?: "default" | "danger" | "warning";
  }>;
}

type ViewMode = "main" | "api-key" | "user-prompt";

export const CommandPalette: React.FC<CommandPaletteProps> = ({
  onSelectChat,
  onCreateChat,
  onNavigateToThemes,
<<<<<<< HEAD
  onNavigateToAgentPlan,
=======
>>>>>>> origin/main
  onSignOut,
}) => {
  const {
    isOpen,
    searchQuery,
    selectedIndex,
    setSearchQuery,
    setSelectedIndex,
    closePalette,
    openPalette,
  } = useCommandPalette();

  const [viewMode, setViewMode] = useState<ViewMode>("main");
  const searchInputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  // Data queries
  const chats = useQuery(api.chats.listChats, {}) || [];
  const currentPrompt = useQuery(api.users.getPrompt, {});
  const currentApiKey = useQuery(api.saveApiKey.getkey, {});

  // Mutations
  const updatePrompt = useMutation(api.users.updatePrompt);
  const saveApiKey = useMutation(api.saveApiKey.saveApiKey);
  const deleteChat = useMutation(api.chats.deleteChat);
  const shareChat = useMutation(api.chats.shareChat);
  const pinChat = useMutation(api.chats.pinned);
  const unpinChat = useMutation(api.chats.unpinned);

  // Chat action handlers
  const handleDeleteChat = async (chatId: Id<"chats">, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!confirm("Are you sure you want to delete this chat?")) return;
    try {
      await deleteChat({ chatId });
      toast.success("Chat deleted");
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

  // Helper function to create chat actions
  const createChatActions = (chat: any) => [
    {
      icon: chat.pinned ? (
        <PinOff className="h-3 w-3" />
      ) : (
        <Pin className="h-3 w-3" />
      ),
      label: chat.pinned ? "Unpin" : "Pin",
      action: (e: React.MouseEvent) =>
        chat.pinned ? handleUnpinChat(chat._id, e) : handlePinChat(chat._id, e),
      variant: "default" as const,
    },
    {
      icon: <Share2 className="h-3 w-3" />,
      label: "Share",
      action: (e: React.MouseEvent) => handleShareChat(chat._id, e),
      variant: "default" as const,
    },
    {
      icon: <Trash2 className="h-3 w-3" />,
      label: "Delete",
      action: (e: React.MouseEvent) => handleDeleteChat(chat._id, e),
      variant: "danger" as const,
    },
  ];

  // Group chats by time periods
  const groupedChats = useMemo(() => {
    const pinnedChats = chats.filter((chat: any) => chat.pinned);
    const unpinnedChats = chats.filter((chat: any) => !chat.pinned);

    const today = unpinnedChats.filter((chat: any) =>
      isToday(new Date(chat.updatedAt)),
    );
    const yesterday = unpinnedChats.filter(
      (chat: any) =>
        isYesterday(new Date(chat.updatedAt)) &&
        !isToday(new Date(chat.updatedAt)),
    );
    const thisWeek = unpinnedChats.filter(
      (chat: any) =>
        isThisWeek(new Date(chat.updatedAt)) &&
        !isToday(new Date(chat.updatedAt)) &&
        !isYesterday(new Date(chat.updatedAt)),
    );
    const older = unpinnedChats.filter(
      (chat: any) => !isThisWeek(new Date(chat.updatedAt)),
    );

    return { pinnedChats, today, yesterday, thisWeek, older };
  }, [chats]);

  // Build command items
  const allItems = useMemo(() => {
    const items: CommandItem[] = [];

    // Add pinned chats
    if (groupedChats.pinnedChats.length > 0) {
      groupedChats.pinnedChats.forEach((chat: any) => {
        items.push({
          id: `chat-${chat._id}`,
          title: chat.title,
          subtitle: `${chat.model.split("/").pop()?.split(":")[0]} • ${format(new Date(chat.updatedAt), "MMM d, h:mm a")}`,
          icon: <Pin className="h-4 w-4 text-theme-warning" />,
          action: () => {
            onSelectChat(chat._id);
            closePalette();
          },
          section: "Pinned Chats",
          searchText: `${chat.title} ${chat.model}`,
          chatId: chat._id,
          isPinned: chat.pinned,
          actions: createChatActions(chat),
        });
      });
    }

    // Add today's chats
    if (groupedChats.today.length > 0) {
      groupedChats.today.forEach((chat: any) => {
        items.push({
          id: `chat-${chat._id}`,
          title: chat.title,
          subtitle: `${chat.model.split("/").pop()?.split(":")[0]} • ${format(new Date(chat.updatedAt), "h:mm a")}`,
          icon: <Clock className="h-4 w-4 text-theme-accent" />,
          action: () => {
            onSelectChat(chat._id);
            closePalette();
          },
          section: "Today",
          searchText: `${chat.title} ${chat.model}`,
          chatId: chat._id,
          isPinned: chat.pinned,
          actions: createChatActions(chat),
        });
      });
    }

    // Add yesterday's chats
    if (groupedChats.yesterday.length > 0) {
      groupedChats.yesterday.forEach((chat: any) => {
        items.push({
          id: `chat-${chat._id}`,
          title: chat.title,
          subtitle: `${chat.model.split("/").pop()?.split(":")[0]} • Yesterday ${format(new Date(chat.updatedAt), "h:mm a")}`,
          icon: <Calendar className="h-4 w-4 text-theme-text-muted" />,
          action: () => {
            onSelectChat(chat._id);
            closePalette();
          },
          section: "Yesterday",
          searchText: `${chat.title} ${chat.model}`,
          chatId: chat._id,
          isPinned: chat.pinned,
          actions: createChatActions(chat),
        });
      });
    }

    // Add this week's chats
    if (groupedChats.thisWeek.length > 0) {
      groupedChats.thisWeek.forEach((chat: any) => {
        items.push({
          id: `chat-${chat._id}`,
          title: chat.title,
          subtitle: `${chat.model.split("/").pop()?.split(":")[0]} • ${format(new Date(chat.updatedAt), "MMM d")}`,
          icon: <CalendarDays className="h-4 w-4 text-theme-text-muted" />,
          action: () => {
            onSelectChat(chat._id);
            closePalette();
          },
          section: "This Week",
          searchText: `${chat.title} ${chat.model}`,
          chatId: chat._id,
          isPinned: chat.pinned,
          actions: createChatActions(chat),
        });
      });
    }

    // Add older chats
    if (groupedChats.older.length > 0) {
      groupedChats.older.forEach((chat: any) => {
        items.push({
          id: `chat-${chat._id}`,
          title: chat.title,
          subtitle: `${chat.model.split("/").pop()?.split(":")[0]} • ${format(new Date(chat.updatedAt), "MMM d, yyyy")}`,
          icon: <Archive className="h-4 w-4 text-theme-text-muted" />,
          action: () => {
            onSelectChat(chat._id);
            closePalette();
          },
          section: "Older",
          searchText: `${chat.title} ${chat.model}`,
          chatId: chat._id,
          isPinned: chat.pinned,
          actions: createChatActions(chat),
        });
      });
    }

    // System actions
    items.push(
      {
        id: "create-chat",
        title: "New Chat",
        subtitle: "Start a new conversation",
        icon: <Plus className="h-4 w-4 text-theme-success" />,
        action: async () => {
          await onCreateChat();
          closePalette();
        },
        section: "Actions",
        searchText: "new chat create conversation",
      },
      {
        id: "themes",
        title: "Themes",
        subtitle: "Customize your interface",
        icon: <Palette className="h-4 w-4 text-theme-accent" />,
        action: () => {
          if (onNavigateToThemes) {
            onNavigateToThemes();
            closePalette();
          }
        },
        section: "Actions",
        searchText: "themes customize appearance",
      },
      {
<<<<<<< HEAD
        id: "agent-plan",
        title: "Agent Plan",
        subtitle: "View and manage agent workflow",
        icon: <Bot className="h-4 w-4 text-blue-400" />,
        action: () => {
          if (onNavigateToAgentPlan) {
            onNavigateToAgentPlan();
            closePalette();
          }
        },
        section: "Actions",
        searchText: "agent plan workflow tasks",
      },
      {
=======
>>>>>>> origin/main
        id: "api-key",
        title: "API Key",
        subtitle: currentApiKey ? "Update your API key" : "Set your API key",
        icon: <Key className="h-4 w-4 text-theme-warning" />,
        action: () => {
          setViewMode("api-key");
        },
        section: "Settings",
        searchText: "api key openai settings",
      },
      {
        id: "user-prompt",
        title: "System Prompt",
        subtitle: currentPrompt ? "Edit system prompt" : "Set system prompt",
        icon: <FileText className="h-4 w-4 text-theme-primary" />,
        action: () => {
          setViewMode("user-prompt");
        },
        section: "Settings",
        searchText: "system prompt instructions",
      },
    );

    if (onSignOut) {
      items.push({
        id: "sign-out",
        title: "Sign Out",
        subtitle: "Log out of your account",
        icon: <LogOut className="h-4 w-4 text-theme-error" />,
        action: () => {
          onSignOut();
          closePalette();
        },
        section: "Account",
        searchText: "sign out logout",
      });
    }

    return items;
  }, [
    groupedChats,
    currentPrompt,
    currentApiKey,
    onSelectChat,
    onCreateChat,
    onNavigateToThemes,
<<<<<<< HEAD
    onNavigateToAgentPlan,
=======
>>>>>>> origin/main
    onSignOut,
    closePalette,
  ]);

  // Filter items based on search query
  const filteredItems = useMemo(() => {
    if (!searchQuery.trim()) return allItems;

    const query = searchQuery.toLowerCase();
    return allItems.filter(
      (item) =>
        item.title.toLowerCase().includes(query) ||
        item.subtitle?.toLowerCase().includes(query) ||
        item.searchText.toLowerCase().includes(query) ||
        item.section.toLowerCase().includes(query),
    );
  }, [allItems, searchQuery]);

  // Group filtered items by section
  const groupedItems = useMemo(() => {
    const groups: { [key: string]: CommandItem[] } = {};
    filteredItems.forEach((item) => {
      if (!groups[item.section]) {
        groups[item.section] = [];
      }
      groups[item.section].push(item);
    });
    return groups;
  }, [filteredItems]);

  // Handle keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen || viewMode !== "main") return;

      switch (e.key) {
        case "ArrowDown":
          e.preventDefault();
          setSelectedIndex((prev) =>
            Math.min(prev + 1, filteredItems.length - 1),
          );
          break;
        case "ArrowUp":
          e.preventDefault();
          setSelectedIndex((prev) => Math.max(prev - 1, 0));
          break;
        case "Enter":
          e.preventDefault();
          if (filteredItems[selectedIndex]) {
            filteredItems[selectedIndex].action();
          }
          break;
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, filteredItems, selectedIndex, setSelectedIndex, viewMode]);

  // Focus search input when opened
  useEffect(() => {
    if (isOpen && searchInputRef.current && viewMode === "main") {
      searchInputRef.current.focus();
    }
  }, [isOpen, viewMode]);

  // Reset view mode when palette closes
  useEffect(() => {
    if (!isOpen) {
      setViewMode("main");
    }
  }, [isOpen]);

  // Reset selected index when search changes
  useEffect(() => {
    setSelectedIndex(0);
  }, [searchQuery, setSelectedIndex]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 bg-black/50 flex items-start justify-center pt-[10vh] z-50"
      onClick={closePalette} // Close when clicking backdrop
    >
      <div
        className="bg-theme-bg-primary border border-theme-border-primary text-theme-chat-assistant-text rounded-2xl shadow-2xl w-full max-w-2xl max-h-[70vh] flex flex-col"
        onClick={(e) => e.stopPropagation()} // Prevent closing when clicking inside modal
        style={{
          backdropFilter: "blur(12px)",
          WebkitBackdropFilter: "blur(12px)",
        }}
      >
        {/* Header */}
        {viewMode === "main" ? (
          <div className="p-4 border-b border-theme-border-primary">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-theme-text-muted" />
              <input
                ref={searchInputRef}
                type="text"
                placeholder="Search chats, settings, and actions..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-transparent border-none outline-none text-theme-text-primary placeholder-theme-text-muted text-lg"
              />
            </div>
          </div>
        ) : (
          <div className="p-4 border-b border-theme-border-primary">
            <button
              onClick={() => setViewMode("main")}
              className="flex items-center gap-2 text-theme-text-muted hover:text-theme-text-primary transition-colors"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to main menu
            </button>
          </div>
        )}

        {/* Content */}
        <div className="flex-1 overflow-y-auto">
          {viewMode === "main" && (
            <>
              {Object.keys(groupedItems).length === 0 ? (
                <div className="p-8 text-center text-theme-text-muted">
                  <MessageSquare className="h-8 w-8 mx-auto mb-2 opacity-50" />
                  <p>No results found</p>
                </div>
              ) : (
                <div className="p-2">
                  {Object.entries(groupedItems).map(([section, items]) => (
                    <div key={section} className="mb-4">
                      <div className="px-3 py-2 text-xs font-semibold text-theme-text-muted uppercase tracking-wide">
                        {section}
                      </div>
                      {items.map((item, index) => {
                        const globalIndex = filteredItems.indexOf(item);
                        const isSelected = globalIndex === selectedIndex;

                        return (
                          <div
                            key={item.id}
                            className={`group flex items-center gap-3 px-3 py-3 rounded-xl cursor-pointer transition-colors ${
                              isSelected
                                ? "bg-theme-accent/10 border border-theme-accent/30"
                                : "hover:bg-theme-bg-secondary"
                            }`}
                          >
                            <div className="flex-shrink-0">{item.icon}</div>
                            <div
                              className="flex-1 min-w-0"
                              onClick={item.action}
                            >
                              <div className="flex items-center gap-2">
                                <div className="font-medium text-theme-text-primary truncate">
                                  {item.title}
                                </div>
                                {item.isPinned && (
                                  <Pin className="h-3 w-3 text-theme-warning flex-shrink-0" />
                                )}
                              </div>
                              {item.subtitle && (
                                <div className="text-sm text-theme-text-muted truncate">
                                  {item.subtitle}
                                </div>
                              )}
                            </div>

                            {/* Action buttons for chat items */}
                            {item.actions && item.actions.length > 0 && (
                              <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                {item.actions.map((action, actionIndex) => (
                                  <button
                                    key={actionIndex}
                                    onClick={action.action}
                                    className={`p-1.5 rounded-lg transition-colors ${
                                      action.variant === "danger"
                                        ? "hover:bg-theme-error/10 text-theme-text-muted hover:text-theme-error"
                                        : action.variant === "warning"
                                          ? "hover:bg-theme-warning/10 text-theme-text-muted hover:text-theme-warning"
                                          : "hover:bg-theme-accent/10 text-theme-text-muted hover:text-theme-accent"
                                    }`}
                                    title={action.label}
                                  >
                                    {action.icon}
                                  </button>
                                ))}
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  ))}
                </div>
              )}
            </>
          )}

          {viewMode === "api-key" && (
            <ApiKeyManager onClose={() => setViewMode("main")} />
          )}

          {viewMode === "user-prompt" && (
            <UserPromptEditor onClose={() => setViewMode("main")} />
          )}
        </div>

        {/* Footer */}
        {viewMode === "main" && (
          <div className="p-4 border-t border-theme-border-primary">
            <div className="flex items-center justify-between">
              <div className="text-xs text-theme-text-muted">
                Use ↑↓ to navigate, ⏎ to select, ESC to close
              </div>
              <button
                onClick={() => {
                  onCreateChat()
                    .then(() => {
                      closePalette();
                    })
                    .catch((error) => {
                      console.error("Failed to create chat:", error);
                      // Optionally, show a toast or error message here
                    });
                }}
                className="flex items-center gap-2 px-3 py-2 bg-theme-primary hover:bg-theme-primary-hover text-theme-text-inverse rounded-lg text-sm font-medium transition-colors"
              >
                <Plus className="h-4 w-4" />
                New Chat
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
