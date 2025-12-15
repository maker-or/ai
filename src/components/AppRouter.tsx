import React, { useState } from 'react';
import { ChatInterface } from './chat/ChatInterface';
import { ThemesPage } from './ThemesPage';
<<<<<<< HEAD
import { AgentPlanDemo } from './AgentPlanDemo';

type Page = 'chat' | 'themes' | 'agent-plan';
=======

type Page = 'chat' | 'themes';
>>>>>>> origin/main

export const AppRouter: React.FC = () => {
  const [currentPage, setCurrentPage] = useState<Page>('chat');

  const navigateToThemes = () => {
    setCurrentPage('themes');
  };

  const navigateToChat = () => {
    setCurrentPage('chat');
  };

<<<<<<< HEAD
  const navigateToAgentPlan = () => {
    setCurrentPage('agent-plan');
  };

  switch (currentPage) {
    case 'themes':
      return <ThemesPage onBack={navigateToChat} />;
    case 'agent-plan':
      return <AgentPlanDemo onBack={navigateToChat} />;
    case 'chat':
    default:
      return <ChatInterface onNavigateToThemes={navigateToThemes} onNavigateToAgentPlan={navigateToAgentPlan} />;
=======
  switch (currentPage) {
    case 'themes':
      return <ThemesPage onBack={navigateToChat} />;
    case 'chat':
    default:
      return <ChatInterface onNavigateToThemes={navigateToThemes} />;
>>>>>>> origin/main
  }
};
