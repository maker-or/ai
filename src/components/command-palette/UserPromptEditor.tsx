import React, { useState, useEffect } from 'react';
import { useMutation, useQuery } from 'convex/react';
import { api } from '../../../convex/_generated/api';
import { toast } from 'sonner';
import { FileText, Save, X } from 'lucide-react';

interface UserPromptEditorProps {
  onClose: () => void;
}

export const UserPromptEditor: React.FC<UserPromptEditorProps> = ({ onClose }) => {
  const [prompt, setPrompt] = useState('');
  const [saving, setSaving] = useState(false);

  const currentPrompt = useQuery(api.users.getPrompt, {});
  const updatePrompt = useMutation(api.users.updatePrompt);

  useEffect(() => {
    if (typeof currentPrompt === 'string') {
      setPrompt(currentPrompt);
    }
  }, [currentPrompt]);

  const handleSave = async () => {
    setSaving(true);
    try {
      await updatePrompt({ prompt });
      toast.success('System prompt updated successfully!');
      onClose();
    } catch (error) {
      toast.error('Failed to update system prompt');
      console.error(error);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="p-4 space-y-4">
      <div className="flex items-center gap-2 mb-4">
        <FileText className="h-5 w-5 text-theme-primary" />
        <h3 className="text-lg font-semibold text-theme-text-primary">System Prompt</h3>
      </div>

      <div className="space-y-3">
        <label className="block text-sm font-medium text-theme-text-primary">
          Configure how the AI should behave and respond
        </label>
        
        <textarea
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder="e.g., 'Be concise and friendly. Always provide practical examples when explaining concepts.'"
          rows={6}
          className="w-full p-3 border border-theme-border-primary rounded-lg bg-theme-bg-secondary text-theme-text-primary focus:border-theme-accent focus:outline-none resize-y"
          disabled={saving}
        />

        <div className="flex gap-2">
          <button
            onClick={handleSave}
            disabled={currentPrompt === undefined || saving}
            className="flex items-center gap-2 px-4 py-2 bg-theme-primary hover:bg-theme-primary-hover text-theme-text-inverse rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <Save className="h-4 w-4" />
            {saving ? 'Saving...' : 'Save Prompt'}
          </button>
          <button
            onClick={onClose}
            disabled={saving}
            className="flex items-center gap-2 px-4 py-2 bg-theme-bg-primary hover:bg-theme-border-primary text-theme-text-primary rounded-lg transition-colors"
          >
            <X className="h-4 w-4" />
            Cancel
          </button>
        </div>
      </div>

      {/* Examples */}
      <div className="text-sm text-theme-text-muted space-y-2">
        <p className="font-medium">Example prompts:</p>
        <div className="space-y-1 pl-3">
          <p>• "Be concise and direct in your responses"</p>
          <p>• "Always provide code examples when explaining programming concepts"</p>
          <p>• "Respond in a friendly, conversational tone"</p>
          <p>• "Focus on practical, actionable advice"</p>
        </div>
      </div>
    </div>
  );
};
