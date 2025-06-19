// ModelSelector.tsx

import { useState, useEffect } from "react";
import { useAction } from "convex/react";
import { api } from "../../../convex/_generated/api";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";
import { Button } from "../ui/button";
import { ChevronDown, CheckCircle2, Loader2 } from "lucide-react";
import { getModelLogo } from "./modelLogoMap";

interface ModelSelectorProps {
  selectedModel: string;
  onModelChange: (model: string) => void;
}

interface Model {
  id: string;
  name: string;
}

const DEFAULT_MODELS: Model[] = [
  {
    id: "nvidia/llama-3.3-nemotron-super-49b-v1:free",
    name: "Llama 3.3 Nemotron",
  },
  {
    id: "deepseek/deepseek-chat-v3-0324:free",
    name: "DeepSeek Chat",
  },
  {
    id: "openai/gpt-4.1",
    name: "GPT-4.1",
  },
  {
    id: "anthropic/claude-sonnet-4",
    name: "Claude Sonnet 4",
  },
];

export const ModelSelector = ({
  selectedModel,
  onModelChange,
}: ModelSelectorProps) => {
  const [models, setModels] = useState<Model[]>(DEFAULT_MODELS);
  const [isLoading, setIsLoading] = useState(false);

  const getAvailableModels = useAction(api.ai.getAvailableModels);

  useEffect(() => {
    const fetchModels = async () => {
      setIsLoading(true);
      try {
        const availableModels = await getAvailableModels();
        if (availableModels && availableModels.length > 0) {
          const formattedModels = availableModels.map((model: any) => ({
            id: model.id,
            name: model.name || model.id,
          }));
          setModels(formattedModels);
        }
      } catch (error) {
        // Keep default models on error
      } finally {
        setIsLoading(false);
      }
    };
    void fetchModels();
  }, [getAvailableModels]);

  // Ensure selected model is valid, default to first model if not
  const validSelectedModel = models.find((m) => m.id === selectedModel)
    ? selectedModel
    : models[0]?.id;
  const selectedModelInfo =
    models.find((m) => m.id === validSelectedModel) || models[0];

  // Update parent if selected model changed
  useEffect(() => {
    if (validSelectedModel !== selectedModel) {
      onModelChange(validSelectedModel);
    }
  }, [validSelectedModel, selectedModel, onModelChange]);

  // Get logo component for selected model
  const SelectedModelLogo = getModelLogo(validSelectedModel);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          className="group relative min-w-[200px] h-11 px-5 py-2 bg-theme-bg-secondary border border-theme-border-primary hover:border-theme-border-focus text-theme-text-primary transition-all duration-200 rounded-xl shadow-sm hover:shadow-lg focus:ring-2 focus:ring-theme-accent/40"
          aria-label="Select AI Model"
        >
          <div className="flex items-center justify-between w-full">
            <div className="flex items-center gap-3 min-w-0">
              {SelectedModelLogo && (
                <SelectedModelLogo
                  className="text-base flex-shrink-0"
                  size={20}
                />
              )}
              <span className="font-semibold text-base truncate">
                {selectedModelInfo?.name}
              </span>
            </div>
            <ChevronDown className="h-5 w-5 text-theme-text-muted group-hover:text-theme-text-primary transition-colors duration-150 flex-shrink-0" />
          </div>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="end"
        className="w-[320px] max-w-[95vw] bg-theme-bg-secondary border-4 border-theme-border-primary shadow-2xl rounded-2xl p-2"
      >
        <div className="px-4 py-3 border-b border-theme-border-primary mb-2">
          <h3 className="text-base font-bold text-theme-text-primary">
            AI Models
          </h3>
          <p className="text-xs text-theme-text-muted mt-1">
            Choose your preferred AI model
          </p>
        </div>
        {isLoading ? (
          <div className="space-y-2 px-4 py-6">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="flex items-center gap-3 animate-pulse">
                <div className="w-3 h-3 rounded-full bg-theme-border-primary" />
                <div className="flex-1">
                  <div className="h-4 bg-theme-border-primary/40 rounded w-2/3 mb-1" />
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="space-y-1 max-h-80 overflow-y-auto">
            {models.map((model) => {
              const isActive = validSelectedModel === model.id;
              const ModelLogo = getModelLogo(model.id);

              return (
                <DropdownMenuItem
                  key={model.id}
                  onClick={() => onModelChange(model.id)}
                  className={`group relative flex items-center gap-3 p-4 cursor-pointer rounded-xl transition-all duration-200 border-2 ${
                    isActive
                      ? "bg-theme-accent/10 border-theme-accent/40 shadow-md"
                      : "border-transparent hover:bg-theme-bg-secondary hover:border-theme-border-focus"
                  } focus:outline-none focus:ring-2 focus:ring-theme-accent/30`}
                  tabIndex={0}
                  aria-selected={isActive}
                >
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    {ModelLogo && (
                      <ModelLogo
                        className={`flex-shrink-0 ${
                          isActive
                            ? "text-theme-accent"
                            : "text-theme-text-muted group-hover:text-theme-accent"
                        } transition-colors duration-200`}
                        size={20}
                      />
                    )}
                    <span
                      className={`font-semibold text-base truncate ${
                        isActive
                          ? "text-theme-accent"
                          : "text-theme-text-primary"
                      }`}
                    >
                      {model.name}
                    </span>
                  </div>
                  {isActive && (
                    <CheckCircle2 className="h-5 w-5 text-theme-accent flex-shrink-0" />
                  )}
                </DropdownMenuItem>
              );
            })}
          </div>
        )}
        {isLoading && (
          <div className="flex justify-center py-4">
            <Loader2 className="h-5 w-5 text-theme-accent animate-spin" />
          </div>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
