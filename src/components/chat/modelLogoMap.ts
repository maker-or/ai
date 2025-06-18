import React from "react";
import { OpenAILogo, AnthropicLogo, MetaLogo, DeepSeekLogo } from "../ui/logos";

export interface ModelLogoMapping {
  [modelId: string]: React.ComponentType<{ className?: string; size?: number }>;
}

export const modelLogoMap: ModelLogoMapping = {
  // OpenAI models
  "openai/gpt-4.1": OpenAILogo,
  "openai/gpt-4": OpenAILogo,
  "openai/gpt-3.5-turbo": OpenAILogo,
  
  // Anthropic models  
  "anthropic/claude-sonnet-4": AnthropicLogo,
  "anthropic/claude-3-opus": AnthropicLogo,
  "anthropic/claude-3-sonnet": AnthropicLogo,
  "anthropic/claude-3-haiku": AnthropicLogo,
  
  // Meta/Llama models
  "nvidia/llama-3.3-nemotron-super-49b-v1:free": MetaLogo,
  "meta/llama-3": MetaLogo,
  "meta/llama-2": MetaLogo,
  
  // DeepSeek models
  "deepseek/deepseek-chat-v3-0324:free": DeepSeekLogo,
  "deepseek/deepseek-chat": DeepSeekLogo,
  "deepseek/deepseek-coder": DeepSeekLogo,
};

export const getModelLogo = (modelId: string) => {
  // Direct match first
  if (modelLogoMap[modelId]) {
    return modelLogoMap[modelId];
  }
  
  // Partial match based on provider prefix
  const lowerModelId = modelId.toLowerCase();
  
  if (lowerModelId.includes("openai") || lowerModelId.includes("gpt")) {
    return OpenAILogo;
  }
  
  if (lowerModelId.includes("anthropic") || lowerModelId.includes("claude")) {
    return AnthropicLogo;
  }
  
  if (lowerModelId.includes("llama") || lowerModelId.includes("meta")) {
    return MetaLogo;
  }
  
  if (lowerModelId.includes("deepseek")) {
    return DeepSeekLogo;
  }
  
  // No logo found
  return null;
};
