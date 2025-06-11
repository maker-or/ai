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
        <Button variant="outline" className="w-auto">
          <Bot className="h-4 w-4 mr-2" />
          <span className="max-w-32 truncate">{selectedModelInfo?.name}</span>
          <ChevronDown className="h-4 w-4 ml-2" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-80">
        {isLoading ? (
          <div className="p-4 text-center text-sm text-gray-500">
            Loading models...
          </div>
        ) : (
          models.map((model) => (
            <DropdownMenuItem
              key={model.id}
              onClick={() => onModelChange(model.id)}
              className="flex flex-col items-start p-3 cursor-pointer"
            >
              <div className="flex items-center justify-between w-full">
                <span className="font-medium">{model.name}</span>
                {validSelectedModel === model.id && (
                  <div className="h-2 w-2 bg-blue-500 rounded-full" />
                )}
              </div>
              {model.description && (
                <span className="text-xs text-gray-500 mt-1">
                  {model.description}
                </span>
              )}
              <span className="text-xs text-blue-500 mt-1">
                Powered by OpenRouter
              </span>
            </DropdownMenuItem>
          ))
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
