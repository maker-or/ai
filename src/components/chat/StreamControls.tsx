import React from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { Button } from "../ui/button";
import { Progress } from "../ui/progress";
import { Pause, Play, Square, RotateCcw } from "lucide-react";
import { Id } from "../../../convex/_generated/dataModel";
import { toast } from "sonner";

interface StreamControlsProps {
  chatId: Id<"chats">;
}

export const StreamControls = ({ chatId }: StreamControlsProps) => {
  const activeStreams = useQuery(api.resumable.getActiveStreams, { chatId }) || [];
  
  const pauseStream = useMutation(api.resumable.pauseStream);
  const resumeStream = useMutation(api.resumable.resumeStream);
  const completeStream = useMutation(api.resumable.completeStream);

  const currentStream = activeStreams[0]; // Get the most recent active stream

  if (!currentStream) return null;

  const handlePause = async () => {
    try {
      await pauseStream({ streamId: currentStream._id });
      toast.success("Stream paused");
    } catch (error) {
      toast.error("Failed to pause stream");
    }
  };

  const handleResume = async () => {
    try {
      await resumeStream({ streamId: currentStream._id });
      toast.success("Stream resumed");
    } catch (error) {
      toast.error("Failed to resume stream");
    }
  };

  const handleStop = async () => {
    try {
      await completeStream({ streamId: currentStream._id });
      toast.success("Stream stopped");
    } catch (error) {
      toast.error("Failed to stop stream");
    }
  };

  return (
    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm font-medium text-blue-900">
          AI Response Stream
        </span>
        <div className="flex items-center space-x-2">
          {currentStream.isPaused ? (
            <Button size="sm" variant="outline" onClick={handleResume}>
              <Play className="h-4 w-4 mr-1" />
              Resume
            </Button>
          ) : (
            <Button size="sm" variant="outline" onClick={handlePause}>
              <Pause className="h-4 w-4 mr-1" />
              Pause
            </Button>
          )}
          <Button size="sm" variant="outline" onClick={handleStop}>
            <Square className="h-4 w-4 mr-1" />
            Stop
          </Button>
        </div>
      </div>
      
      <div className="space-y-2">
        <Progress value={currentStream.progress} className="h-2" />
        <div className="flex justify-between text-xs text-blue-700">
          <span>{currentStream.progress.toFixed(1)}% complete</span>
          <span>{currentStream.totalTokens} tokens</span>
        </div>
        
        {currentStream.isPaused && (
          <div className="flex items-center text-xs text-orange-600">
            <Pause className="h-3 w-3 mr-1" />
            Stream paused - you can resume anytime
          </div>
        )}
      </div>
    </div>
  );
};
