import { memo, useCallback } from "react";
import { Button } from "../ui/button";
import { ArrowUpIcon, StopIcon } from "@phosphor-icons/react";

interface SendButtonProps {
  onClick: () => void; // Function to run on click
  disabled?: boolean; // Optional prop to disable the button
  isLoading?: boolean; // Optional prop to show loading state
}

export const SendButton = memo(
  ({ onClick, disabled = false, isLoading = false }: SendButtonProps) => {
    const handleClick = useCallback(() => {
      if (!disabled && !isLoading) {
        onClick(); // Only run if not disabled or loading
      }
    }, [onClick, disabled, isLoading]);

    return (
      <div className="bg-theme-bg-primary rounded-full p-1">
              <div className="bg-theme-bg-secondary rounded-full">
              <Button
        onClick={handleClick} // What to do when clicked
        disabled={disabled || isLoading} // When to disable the button
        size="icon"
        className="h-[40px] w-[40px]" // Tailwind CSS for sizing
      >
        {isLoading ? (
          <StopIcon  size={24} className="animate-spin text-muted" />
        ) : (
          <ArrowUpIcon size={24} />
        )}
      </Button>
      </div>
      </div>


    );
  },
);

SendButton.displayName = "SendButton";
