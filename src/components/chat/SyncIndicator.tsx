import React, { useEffect, useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { Wifi, WifiOff, Users } from "lucide-react";
import { Id } from "../../../convex/_generated/dataModel";

interface SyncIndicatorProps {
  chatId: Id<"chats">;
}

export const SyncIndicator = ({ chatId }: SyncIndicatorProps) => {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  
  const syncState = useQuery(api.sync.getSyncState, { chatId });
  const updateSyncState = useMutation(api.sync.updateSyncState);

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  useEffect(() => {
    // Update sync state periodically
    const interval = setInterval(async () => {
      if (isOnline) {
        try {
          await updateSyncState({
            chatId,
            activeUsers: ["current_user"], // In a real app, track actual users
            typingUsers: [],
          });
        } catch (error) {
          console.error("Failed to update sync state:", error);
        }
      }
    }, 5000);

    return () => clearInterval(interval);
  }, [chatId, isOnline, updateSyncState]);

  const typingUsers = syncState?.typingUsers || [];
  const activeUsers = syncState?.activeUsers || [];

  return (
    <div className="flex items-center space-x-2 text-xs text-gray-500">
      {isOnline ? (
        <Wifi className="h-4 w-4 text-green-500" />
      ) : (
        <WifiOff className="h-4 w-4 text-red-500" />
      )}
      
      {activeUsers.length > 1 && (
        <div className="flex items-center space-x-1">
          <Users className="h-3 w-3" />
          <span>{activeUsers.length} online</span>
        </div>
      )}
      
      {typingUsers.length > 0 && (
        <div className="flex items-center space-x-1">
          <div className="flex space-x-1">
            <div className="w-1 h-1 bg-blue-500 rounded-full animate-bounce"></div>
            <div className="w-1 h-1 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
            <div className="w-1 h-1 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
          </div>
          <span>{typingUsers.join(", ")} typing...</span>
        </div>
      )}
    </div>
  );
};
