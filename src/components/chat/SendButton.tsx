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
      <Button
        onClick={handleClick} // What to do when clicked
        disabled={disabled || isLoading} // When to disable the button
        size="icon"
        className="h-[60px] w-[60px]" // Tailwind CSS for sizing
      >
        {isLoading ? (
          <StopIcon size={24} className="animate-spin text-gray-400" />
        ) : (
          <ArrowUpIcon size={24} />
        )}
      </Button>
    );
  },
);

SendButton.displayName = "SendButton";
