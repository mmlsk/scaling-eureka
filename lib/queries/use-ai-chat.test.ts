import { describe, it, expect, vi } from 'vitest';

// Mock the AI SDK
vi.mock('@ai-sdk/react', () => ({
  useChat: () => ({
    messages: [],
    sendMessage: vi.fn(),
    status: 'ready',
    error: undefined,
    setMessages: vi.fn(),
    reload: vi.fn(),
    stop: vi.fn(),
    resumeStream: vi.fn(),
    addToolResult: vi.fn(),
    addToolOutput: vi.fn(),
    addToolApprovalResponse: vi.fn(),
  }),
}));

import { useAIchat } from './use-ai-chat';

describe('useAIchat', () => {
  it('should export useAIchat hook', () => {
    expect(typeof useAIchat).toBe('function');
  });

  it('should return messages array', () => {
    const { messages } = useAIchat();
    expect(Array.isArray(messages)).toBe(true);
  });

  it('should return sendMessage function', () => {
    const { sendMessage } = useAIchat();
    expect(typeof sendMessage).toBe('function');
  });

  it('should return status', () => {
    const { status } = useAIchat();
    expect(['streaming', 'ready', 'submitted', 'error']).toContain(status);
  });

  it('should return setMessages function', () => {
    const { setMessages } = useAIchat();
    expect(typeof setMessages).toBe('function');
  });
});
