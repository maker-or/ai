import { useState, useCallback, useEffect } from 'react';

export const useCommandPalette = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);

  const openPalette = useCallback(() => {
    console.log('Opening command palette');
    setIsOpen(true);
    setSearchQuery('');
    setSelectedIndex(0);
  }, []);

  const closePalette = useCallback(() => {
    console.log('Closing command palette');
    setIsOpen(false);
    setSearchQuery('');
    setSelectedIndex(0);
  }, []);

  // Global keyboard shortcut using native event listeners
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Check for Cmd+K (Mac) or Ctrl+K (Windows/Linux)
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        console.log('Command palette hotkey triggered!', 'Current state:', isOpen);
        e.preventDefault();
        e.stopPropagation();
        
        if (isOpen) {
          closePalette();
        } else {
          openPalette();
        }
        return;
      }
      
      // Escape to close
      if (e.key === 'Escape' && isOpen) {
        console.log('Escape pressed, closing palette');
        e.preventDefault();
        e.stopPropagation();
        closePalette();
        return;
      }
    };

    // Add event listener to document to capture all keydown events
    document.addEventListener('keydown', handleKeyDown, true);
    return () => document.removeEventListener('keydown', handleKeyDown, true);
  }, [isOpen, openPalette, closePalette]);

  return {
    isOpen,
    searchQuery,
    selectedIndex,
    setSearchQuery,
    setSelectedIndex,
    openPalette,
    closePalette,
  };
};
