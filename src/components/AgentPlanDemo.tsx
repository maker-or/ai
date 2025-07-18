import React from "react";
import { ArrowLeft } from "lucide-react";
import AgentPlan from "./ui/agent-plan";
import { Button } from "./ui/button";

interface AgentPlanDemoProps {
  onBack?: () => void;
}

export function AgentPlanDemo({ onBack }: AgentPlanDemoProps) {
  return (
    <div className="flex flex-col p-4 w-full h-full bg-[#0c0c0c] min-h-screen">
      <div className="mb-6">
        <div className="flex items-center gap-4 mb-4">
          {onBack && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onBack}
              className="text-[#f7eee3] hover:bg-[#f7eee3]/10"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Chat
            </Button>
          )}
        </div>
        <h1 className="text-3xl font-light text-[#f7eee3] mb-2">
          Agent Plan
        </h1>
        <p className="text-[#f7eee3]/60 text-sm">
          Interactive task management with agent workflow planning
        </p>
      </div>
      
      <div className="flex-1">
        <AgentPlan />
      </div>
    </div>
  );
} 