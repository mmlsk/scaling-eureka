import { describe, it, expect, beforeEach } from 'vitest';
import { useAIAssistantUIStore } from './ai-assistant-ui';

describe('aiAssistantUIStore', () => {
  beforeEach(() => {
    useAIAssistantUIStore.getState().reset();
  });

  it('should have default isOpen as false', () => {
    expect(useAIAssistantUIStore.getState().isOpen).toBe(false);
  });

  it('should have default activeTab as chat', () => {
    expect(useAIAssistantUIStore.getState().activeTab).toBe('chat');
  });

  it('should set isOpen', () => {
    useAIAssistantUIStore.getState().setOpen(true);
    expect(useAIAssistantUIStore.getState().isOpen).toBe(true);
  });

  it('should set activeTab', () => {
    useAIAssistantUIStore.getState().setActiveTab('insights');
    expect(useAIAssistantUIStore.getState().activeTab).toBe('insights');
  });

  it('should have default sidebarWidth as 400', () => {
    expect(useAIAssistantUIStore.getState().sidebarWidth).toBe(400);
  });

  it('should set sidebarWidth', () => {
    useAIAssistantUIStore.getState().setSidebarWidth(500);
    expect(useAIAssistantUIStore.getState().sidebarWidth).toBe(500);
  });
});
