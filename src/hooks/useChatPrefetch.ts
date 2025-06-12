import { useEffect, useState } from "react";
import { useQuery, usePaginatedQuery, Preloaded, usePreloadedQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { Id } from "../../convex/_generated/dataModel";

interface UseChatPrefetchOptions {
  enabled: boolean;
  chatIds: Id<"chats">[];
  maxChats?: number;
}

interface PrefetchedChatData {
  chat: any;
  messages: any[];
  activeBranch: any;
  streamingSession: any;
  hasBranches: boolean;
}

export const useChatPrefetch = ({ 
  enabled, 
  chatIds, 
  maxChats = 10 
}: UseChatPrefetchOptions) => {
  const [prefetchedData, setPrefetchedData] = useState<Map<Id<"chats">, PrefetchedChatData>>(new Map());
  
  // Get top N chat IDs to prefetch
  const chatIdsToPrefetech = chatIds.slice(0, maxChats);
  
  // Only prefetch if enabled and we have chat IDs
  const shouldPrefetch = enabled && chatIdsToPrefetech.length > 0;
  
  const prefetchedChats = useQuery(
    api.chats.prefetchChatData,
    shouldPrefetch ? { chatIds: chatIdsToPrefetech } : "skip"
  );

  useEffect(() => {
    if (prefetchedChats) {
      console.log(`✅ Prefetched data for ${prefetchedChats.length} chats`);
      const dataMap = new Map();
      prefetchedChats.forEach((chatData) => {
        if (chatData?.chat) {
          dataMap.set(chatData.chat._id, chatData);
          console.log(`📦 Prefetched chat: ${chatData.chat.title} (${chatData.messages.length} messages)`);
        }
      });
      setPrefetchedData(dataMap);
    }
  }, [prefetchedChats]);

  const getChatData = (chatId: Id<"chats">) => {
    return prefetchedData.get(chatId);
  };

  const isPrefetched = (chatId: Id<"chats">) => {
    return prefetchedData.has(chatId);
  };

  return {
    getChatData,
    isPrefetched,
    isLoading: shouldPrefetch && prefetchedChats === undefined,
    prefetchedChatIds: Array.from(prefetchedData.keys()),
  };
};

// Hook to use prefetched data or fallback to regular queries
export const useChatData = (chatId: Id<"chats"> | null, prefetchedData?: PrefetchedChatData) => {
  // Use prefetched data if available
  const prefetched = prefetchedData;
  
  // Fallback queries - only run if we don't have prefetched data
  const shouldUseFallback = !prefetched && chatId;
  
  const chat = useQuery(
    api.chats.getChat, 
    shouldUseFallback ? { chatId } : "skip"
  );
  
  const activeBranch = useQuery(
    api.branches.getActiveBranch,
    shouldUseFallback ? { chatId } : "skip"
  );
  
  const messages = useQuery(
    api.messages.getMessages,
    shouldUseFallback ? { chatId, branchId: activeBranch?._id } : "skip"
  ) || [];
  
  const streamingSession = useQuery(
    api.messages.getActiveStreamingSession,
    shouldUseFallback ? { chatId } : "skip"
  );

  // Return prefetched data or fallback data
  if (prefetched) {
    console.log(`⚡ Using prefetched data for chat: ${prefetched.chat.title}`);
    return {
      chat: prefetched.chat,
      activeBranch: prefetched.activeBranch,
      messages: prefetched.messages,
      streamingSession: prefetched.streamingSession,
      hasBranches: prefetched.hasBranches,
      isPrefetched: true,
    };
  }

  console.log(`🔄 Using fallback queries for chat: ${chatId}`);
  return {
    chat,
    activeBranch,
    messages,
    streamingSession,
    hasBranches: false, // We'd need to query this separately for non-prefetched
    isPrefetched: false,
  };
};
