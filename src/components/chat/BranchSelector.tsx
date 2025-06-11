import React, { useState, useEffect } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "../ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";
import { GitBranch, Plus, ChevronDown } from "lucide-react";
import { Id } from "../../../convex/_generated/dataModel";
import { toast } from "sonner";

interface BranchSelectorProps {
  chatId: Id<"chats">;
  currentMessageId?: Id<"messages"> | undefined;
  branchDialogOpen?: boolean;
  setBranchDialogOpen?: (open: boolean) => void;
}

export const BranchSelector = ({ 
  chatId, 
  currentMessageId, 
  branchDialogOpen = false, 
  setBranchDialogOpen 
}: BranchSelectorProps) => {
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(branchDialogOpen);
  const [branchName, setBranchName] = useState("");

  // Sync external dialog state
  useEffect(() => {
    if (branchDialogOpen !== isCreateDialogOpen) {
      setIsCreateDialogOpen(branchDialogOpen);
    }
  }, [branchDialogOpen, isCreateDialogOpen]);

  const branches = useQuery(api.branches.getBranches, { chatId }) || [];
  const activeBranch = useQuery(api.branches.getActiveBranch, { chatId });
  
  const createBranch = useMutation(api.branches.createBranch);
  const switchToBranch = useMutation(api.branches.switchToBranch);

  const handleCreateBranch = async () => {
    if (!currentMessageId) {
      toast.error("No message selected for branching");
      return;
    }

    try {
      await createBranch({
        chatId,
        fromMessageId: currentMessageId,
        branchName: branchName || undefined,
      });
      setBranchName("");
      setIsCreateDialogOpen(false);
      setBranchDialogOpen?.(false);
      toast.success("Branch created successfully");
    } catch {
      toast.error("Failed to create branch");
    }
  };

  const handleSwitchBranch = async (branchId: Id<"branches"> | undefined) => {
    try {
      await switchToBranch({ branchId, chatId });
      toast.success(branchId ? "Switched to branch" : "Switched to main thread");
    } catch {
      toast.error("Failed to switch branch");
    }
  };

  return (
    <div className="flex items-center space-x-2">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" size="sm">
            <GitBranch className="h-4 w-4 mr-2" />
            {activeBranch?.name || "Main"}
            <ChevronDown className="h-4 w-4 ml-2" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuItem onClick={() => void handleSwitchBranch(undefined)}>
            Main Thread
          </DropdownMenuItem>
          {branches.map((branch) => (
            <DropdownMenuItem
              key={branch._id}
              onClick={() => void handleSwitchBranch(branch._id)}
            >
              {branch.name}
            </DropdownMenuItem>
          ))}
          <DropdownMenuItem 
            onClick={() => {
              setIsCreateDialogOpen(true);
              setBranchDialogOpen?.(true);
            }}
            disabled={!currentMessageId}
            className="text-blue-600"
          >
            <Plus className="h-4 w-4 mr-2" />
            Create Branch
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <Dialog 
        open={isCreateDialogOpen} 
        onOpenChange={(open) => {
          setIsCreateDialogOpen(open);
          setBranchDialogOpen?.(open);
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create New Branch</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <Input
              placeholder="Branch name (optional)"
              value={branchName}
              onChange={(e) => setBranchName(e.target.value)}
            />
            <div className="flex justify-end space-x-2">
              <Button
                variant="outline"
                onClick={() => {
                  setIsCreateDialogOpen(false);
                  setBranchDialogOpen?.(false);
                }}
              >
                Cancel
              </Button>
              <Button onClick={() => void handleCreateBranch()}>
                Create Branch
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};
