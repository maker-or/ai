import { useState, useEffect } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../ui/dialog";
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
  chatId: Id<"chats"> | null;
  currentMessageId?: Id<"messages"> | undefined;
  branchDialogOpen?: boolean;
  setBranchDialogOpen?: (open: boolean) => void;
}
console.log("hello world");

export const BranchSelector = ({
  chatId: propChatId,
  currentMessageId: propMessageId,
  branchDialogOpen = false,
  setBranchDialogOpen,
}: BranchSelectorProps) => {
  const [isCreateDialogOpen, setIsCreateDialogOpen] =
    useState(branchDialogOpen);
  const [branchName, setBranchName] = useState("");
  const [chatId, setChatId] = useState<Id<"chats"> | null>(propChatId ?? null);

  useEffect(() => {
    if (!chatId) {
      const storedChatId = localStorage.getItem("chatId");
      if (storedChatId) setChatId(storedChatId as Id<"chats">);
    }
  }, [chatId]);

  // Sync external dialog state
  useEffect(() => {
    if (branchDialogOpen !== isCreateDialogOpen) {
      setIsCreateDialogOpen(branchDialogOpen);
    }
  }, [branchDialogOpen, isCreateDialogOpen]);

  const branches =
    useQuery(api.branches.getBranches, chatId ? { chatId } : "skip") || [];
  const activeBranch = useQuery(
    api.branches.getActiveBranch,
    chatId ? { chatId } : "skip",
  );

  // Get the last message in the chat if no messageId is provided
  const lastMessage = useQuery(
    api.messages.getLastMessageInChat,
    chatId && !propMessageId ? { chatId } : "skip",
  );

  const createBranch = useMutation(api.branches.createBranch);
  const switchToBranch = useMutation(api.branches.switchToBranch);

  const resolvedMessageId = propMessageId ?? lastMessage?._id;

  const handleCreateBranch = async () => {
    if (!resolvedMessageId || !chatId) {
      toast.error("No message selected for branching");
      return;
    }

    try {
      await createBranch({
        chatId,
        fromMessageId: resolvedMessageId,
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
    if (!chatId) return;

    try {
      await switchToBranch({ branchId, chatId });
      toast.success(
        branchId ? "Switched to branch" : "Switched to main thread",
      );
    } catch {
      toast.error("Failed to switch branch");
    }
  };

  return (
    <div className="flex items-center space-x-2">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            size="lg"
            className="text-theme-text-primary transition-all duration-200"
            disabled={!chatId}
          >
            <GitBranch className="h-4 w-4 mr-2 text-theme-accent" />
            <span className="font-medium">{activeBranch?.name || "Main"}</span>
            <ChevronDown className="h-4 w-4 ml-2 text-theme-text-muted" />
          </Button>
        </DropdownMenuTrigger>
        {chatId && (
          <DropdownMenuContent className="w-56 bg-theme-bg-primary border-theme-border-primary shadow-lg rounded-container p-2">
            <div className="space-y-1">
              <DropdownMenuItem
                onClick={() => void handleSwitchBranch(undefined)}
                className="flex items-center p-3 cursor-pointer rounded-lg hover:bg-theme-bg-secondary transition-colors duration-150 border-none focus:bg-theme-bg-secondary"
              >
                <div className="flex items-center justify-between w-full">
                  <div className="flex items-center space-x-2">
                    <span className="font-medium text-theme-text-primary">
                      Main Thread
                    </span>
                  </div>
                  {!activeBranch && (
                    <span className="text-xs text-theme-bg-secondary font-medium">
                      Active
                    </span>
                  )}
                </div>
              </DropdownMenuItem>

              {branches.map((branch) => (
                <DropdownMenuItem
                  key={branch._id}
                  onClick={() => void handleSwitchBranch(branch._id)}
                  className="flex items-center p-3 cursor-pointer rounded-lg hover:bg-theme-bg-secondary transition-colors duration-150 border-none focus:bg-theme-bg-secondary"
                >
                  <div className="flex items-center justify-between w-full">
                    <div className="flex items-center space-x-2">
                      <GitBranch className="h-3 w-3 text-theme-accent" />
                      <span className="font-medium text-theme-text-primary">
                        {branch.name}
                      </span>
                    </div>
                    {activeBranch?._id === branch._id && (
                      <span className="text-xs text-theme-accent font-medium">
                        Active
                      </span>
                    )}
                  </div>
                </DropdownMenuItem>
              ))}

              <div className="border-t border-theme-border-secondary my-2"></div>

              <DropdownMenuItem
                onClick={() => {
                  setIsCreateDialogOpen(true);
                  setBranchDialogOpen?.(true);
                }}
                disabled={!resolvedMessageId}
                className="flex items-center p-3 cursor-pointer rounded-lg hover:bg-theme-accent hover:text-theme-text-inverse transition-all duration-150 border-none focus:bg-theme-accent focus:text-theme-text-inverse disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Plus className="h-4 w-4 mr-2" />
                <span className="font-medium">Create Branch</span>
              </DropdownMenuItem>
            </div>
          </DropdownMenuContent>
        )}
      </DropdownMenu>

      <Dialog
        open={isCreateDialogOpen}
        onOpenChange={(open) => {
          setIsCreateDialogOpen(open);
          setBranchDialogOpen?.(open);
        }}
      >
        <DialogContent className="bg-theme-bg-primary border-theme-border-primary shadow-2xl rounded-container max-w-md">
          <DialogHeader className="space-y-3">
            <DialogTitle className="text-xl font-semibold text-theme-text-primary flex items-center space-x-2">
              <GitBranch className="h-5 w-5 text-theme-accent" />
              <span>Create New Branch</span>
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-6 pt-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-theme-text-primary">
                Branch name
              </label>
              <Input
                placeholder="e.g., Alternative approach, Deep dive..."
                value={branchName}
                onChange={(e) => setBranchName(e.target.value)}
                className="bg-theme-bg-secondary border-theme-border-primary text-theme-text-primary placeholder:text-theme-text-muted "
              />
            </div>
            <div className="flex justify-end space-x-3 pt-2">
              <Button
                variant="outline"
                onClick={() => {
                  setIsCreateDialogOpen(false);
                  setBranchDialogOpen?.(false);
                }}
                className="border-theme-border-primary text-theme-text-secondary hover:bg-theme-bg-secondary"
              >
                Cancel
              </Button>
              <Button
                onClick={() => void handleCreateBranch()}
                className="bg-theme-bg-secondary text-theme-chat-assistant-text shadow-sm"
              >
                <GitBranch className="h-4 w-4 mr-2" />
                Create Branch
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};
