import React, { useState } from 'react';
import { ChatInterface } from './chat/ChatInterface';
import { ThemesPage } from './ThemesPage';

type Page = 'chat' | 'themes';

export const AppRouter: React.FC = () => {
  const [currentPage, setCurrentPage] = useState<Page>('chat');

  const navigateToThemes = () => {
    setCurrentPage('themes');
  };

  const navigateToChat = () => {
    setCurrentPage('chat');
  };

  switch (currentPage) {
    case 'themes':
      return <ThemesPage onBack={navigateToChat} />;
    case 'chat':
    default:
      return <ChatInterface onNavigateToThemes={navigateToThemes} />;
  }
};
