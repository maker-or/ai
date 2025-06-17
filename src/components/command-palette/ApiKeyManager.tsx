import React, { useState, useEffect } from 'react';
import { useMutation, useQuery } from 'convex/react';
import { api } from '../../../convex/_generated/api';
import { toast } from 'sonner';
import { Eye, EyeOff, Copy, Trash2, Plus, Key } from 'lucide-react';

interface ApiKeyManagerProps {
  onClose: () => void;
}

export const ApiKeyManager: React.FC<ApiKeyManagerProps> = ({ onClose }) => {
  const [newKey, setNewKey] = useState('');
  const [showKey, setShowKey] = useState(false);
  const [isAdding, setIsAdding] = useState(false);
  const [saving, setSaving] = useState(false);

  const currentKey = useQuery(api.saveApiKey.getkey, {});
  const saveApiKey = useMutation(api.saveApiKey.saveApiKey);

  const handleSaveKey = async () => {
    if (!newKey.trim()) return;
    
    setSaving(true);
    try {
      await saveApiKey({ apiKey: newKey });
      toast.success('API key saved successfully!');
      setNewKey('');
      setIsAdding(false);
      onClose();
    } catch (error) {
      toast.error('Failed to save API key');
      console.error(error);
    } finally {
      setSaving(false);
    }
  };

  const maskApiKey = (key: string) => {
    if (key.length <= 8) return key;
    return `${key.slice(0, 3)}${'*'.repeat(key.length - 6)}${key.slice(-3)}`;
  };

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      toast.success('API key copied to clipboard');
    } catch (error) {
      toast.error('Failed to copy to clipboard');
    }
  };

  return (
    <div className="p-4 space-y-4">
      <div className="flex items-center gap-2 mb-4">
        <Key className="h-5 w-5 text-theme-warning" />
        <h3 className="text-lg font-semibold text-theme-text-primary">API Key Management</h3>
      </div>

      {/* Current API Key */}
      {currentKey && (
        <div className="bg-theme-bg-secondary rounded-lg p-4 border border-theme-border-primary">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-theme-text-primary">Current API Key</span>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setShowKey(!showKey)}
                className="p-1 hover:bg-theme-bg-primary rounded transition-colors"
                title={showKey ? 'Hide key' : 'Show key'}
              >
                {showKey ? (
                  <EyeOff className="h-4 w-4 text-theme-text-muted" />
                ) : (
                  <Eye className="h-4 w-4 text-theme-text-muted" />
                )}
              </button>
              <button
                onClick={() => copyToClipboard(currentKey)}
                className="p-1 hover:bg-theme-bg-primary rounded transition-colors"
                title="Copy key"
              >
                <Copy className="h-4 w-4 text-theme-text-muted" />
              </button>
            </div>
          </div>
          <div className="font-mono text-sm text-theme-text-secondary bg-theme-bg-primary rounded p-2">
            {showKey ? currentKey : maskApiKey(currentKey)}
          </div>
        </div>
      )}

      {/* Add New Key */}
      {!isAdding ? (
        <button
          onClick={() => setIsAdding(true)}
          className="w-full flex items-center justify-center gap-2 p-3 border-2 border-dashed border-theme-border-primary rounded-lg hover:border-theme-accent hover:bg-theme-accent/5 transition-colors text-theme-text-muted hover:text-theme-accent"
        >
          <Plus className="h-4 w-4" />
          {currentKey ? 'Update API Key' : 'Add API Key'}
        </button>
      ) : (
        <div className="bg-theme-bg-secondary rounded-lg p-4 border border-theme-border-primary space-y-3">
          <label className="block text-sm font-medium text-theme-text-primary">
            {currentKey ? 'New API Key' : 'Enter API Key'}
          </label>
          <input
            type="password"
            value={newKey}
            onChange={(e) => setNewKey(e.target.value)}
            placeholder="sk-..."
            className="w-full p-3 border border-theme-border-primary rounded-lg bg-theme-bg-primary text-theme-text-primary focus:border-theme-accent focus:outline-none font-mono"
            autoFocus
          />
          <div className="flex gap-2">
            <button
              onClick={handleSaveKey}
              disabled={!newKey.trim() || saving}
              className="flex-1 px-4 py-2 bg-theme-primary hover:bg-theme-primary-hover text-theme-text-inverse rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {saving ? 'Saving...' : 'Save Key'}
            </button>
            <button
              onClick={() => {
                setIsAdding(false);
                setNewKey('');
              }}
              className="px-4 py-2 bg-theme-bg-primary hover:bg-theme-border-primary text-theme-text-primary rounded-lg transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Instructions */}
      <div className="text-sm text-theme-text-muted space-y-1">
        <p>• Your API key is encrypted and stored securely</p>
        <p>• Get your API key from <span className="text-theme-accent">platform.openai.com</span></p>
        <p>• The key format should start with 'sk-'</p>
      </div>
    </div>
  );
};
