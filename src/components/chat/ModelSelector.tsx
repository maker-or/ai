import React, { useState, useEffect } from "react";
import { useAction } from "convex/react";
import { api } from "../../../convex/_generated/api";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";
import { Button } from "../ui/button";
import { ChevronDown, Bot } from "lucide-react";

interface ModelSelectorProps {
  selectedModel: string;
  onModelChange: (model: string) => void;
}

interface Model {
  id: string;
  name: string;
  description?: string;
}

const DEFAULT_MODELS: Model[] = [
  {
    id: "nvidia/llama-3.3-nemotron-super-49b-v1:free",
    name: "Llama 3.3 Nemotron",
    description: "Advanced open-source model by NVIDIA",
  },
  {
    id: "deepseek/deepseek-chat-v3-0324:free",
    name: "DeepSeek Chat",
    description: "Fast reasoning model by DeepSeek",
  },
];

export const ModelSelector = ({ selectedModel, onModelChange }: ModelSelectorProps) => {
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
            description: model.description,
          }));
          setModels(formattedModels);
        }
      } catch (error) {
        console.error("Failed to fetch models:", error);
        // Keep default models on error
      } finally {
        setIsLoading(false);
      }
    };

    fetchModels();
  }, [getAvailableModels]);

  // Ensure selected model is valid, default to first model if not
  const validSelectedModel = models.find(m => m.id === selectedModel) ? selectedModel : models[0]?.id;
  const selectedModelInfo = models.find(m => m.id === validSelectedModel) || models[0];

  // Update parent if selected model changed
  useEffect(() => {
    if (validSelectedModel !== selectedModel) {
      onModelChange(validSelectedModel);
    }
  }, [validSelectedModel, selectedModel, onModelChange]);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button 
          variant="outline" 
          className="w-auto bg-theme-bg-secondary hover:bg-theme-bg-primary border-theme-border-primary text-theme-text-primary shadow-sm hover:shadow transition-all duration-200"
        >
          <Bot className="h-4 w-4 mr-2 text-theme-accent" />
          <span className="max-w-32 truncate font-medium">{selectedModelInfo?.name}</span>
          <ChevronDown className="h-4 w-4 ml-2 text-theme-text-muted" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent 
        align="end" 
        className="w-80 bg-theme-bg-primary border-theme-border-primary shadow-lg rounded-container p-2"
      >
        {isLoading ? (
          <div className="p-6 text-center">
            <div className="inline-flex items-center space-x-2 text-theme-text-muted">
              <div className="w-4 h-4 border-2 border-theme-accent border-t-transparent rounded-full animate-spin"></div>
              <span className="text-sm">Loading models...</span>
            </div>
          </div>
        ) : (
          <div className="space-y-1">
            {models.map((model) => (
              <DropdownMenuItem
                key={model.id}
                onClick={() => onModelChange(model.id)}
                className="flex flex-col items-start p-3 cursor-pointer rounded-lg hover:bg-theme-bg-secondary transition-colors duration-150 border-none focus:bg-theme-bg-secondary"
              >
                <div className="flex items-center justify-between w-full mb-1">
                  <span className="font-medium text-theme-text-primary text-sm">{model.name}</span>
                  {validSelectedModel === model.id && (
                    <div className="flex items-center space-x-1">
                      <div className="h-2 w-2 bg-theme-accent rounded-full"></div>
                      <span className="text-xs text-theme-accent font-medium">Active</span>
                    </div>
                  )}
                </div>
                {model.description && (
                  <span className="text-xs text-theme-text-muted leading-relaxed mb-1">
                    {model.description}
                  </span>
                )}
                <div className="flex items-center space-x-1">
                  <div className="h-1 w-1 bg-theme-accent rounded-full"></div>
                  <span className="text-xs text-theme-accent font-medium">
                    Powered by OpenRouter
                  </span>
                </div>
              </DropdownMenuItem>
            ))}
          </div>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
