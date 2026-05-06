import { create } from 'zustand';

export type AIAssistantTab = 'chat' | 'insights';

export interface AIAssistantUIState {
  isOpen: boolean;
  activeTab: AIAssistantTab;
  sidebarWidth: number;
  setOpen: (open: boolean) => void;
  setActiveTab: (tab: AIAssistantTab) => void;
  setSidebarWidth: (width: number) => void;
  reset: () => void;
}

export const useAIAssistantUIStore = create<AIAssistantUIState>()((set) => ({
  isOpen: false,
  activeTab: 'chat',
  sidebarWidth: 400,
  setOpen: (open) => set({ isOpen: open }),
  setActiveTab: (tab) => set({ activeTab: tab }),
  setSidebarWidth: (width) => set({ sidebarWidth: width }),
  reset: () => set({ isOpen: false, activeTab: 'chat', sidebarWidth: 400 }),
}));
