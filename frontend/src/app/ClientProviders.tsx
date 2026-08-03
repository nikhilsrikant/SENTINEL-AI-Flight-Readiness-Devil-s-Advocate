'use client';

import { ReactNode } from 'react';
import { AIChatbot } from '@/components/chat/AIChatbot';
import { VoiceAssistant } from '@/components/voice/VoiceAssistant';
import { CommandPalette } from '@/components/navigation/CommandPalette';
import { Breadcrumb } from '@/components/navigation/Breadcrumb';
import { TooltipGuide } from '@/components/shared/TooltipGuide';

export function ClientProviders({ children }: { children: ReactNode }) {
  return (
    <>
      {/* Breadcrumb Navigation */}
      <Breadcrumb />

      {/* Main Content Area */}
      <main className="flex-1">{children}</main>

      {/* Floating AI Chatbot */}
      <AIChatbot />

      {/* Command Palette (Cmd+K) */}
      <CommandPalette />

      {/* Onboarding Tooltip Guide */}
      <TooltipGuide />
    </>
  );
}
