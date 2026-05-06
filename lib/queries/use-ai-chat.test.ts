import { describe, it, expect, vi } from 'vitest';

// Mock the AI SDK
vi.mock('@ai-sdk/react', () => ({
  useChat: () => ({
    messages: [],
    input: '',
    handleInputChange: vi.fn(),
    handleSubmit: vi.fn(),
    isLoading: false,
    append: vi.fn(),
  }),
}));

import { useAIChat } from './use-ai-chat';

describe('useAIChat', () => {
  it('should export useAIChat hook', () => {
    expect(typeof useAIChat).toBe('function');
  });

  it('should return messages array', () => {
    const { messages } = useAIChat();
    expect(Array.isArray(messages)).toBe(true);
  });

  it('should return input string', () => {
    const { input } = useAIChat();
    expect(typeof input).toBe('string');
  });

  it('should return handleSubmit function', () => {
    const { handleSubmit } = useAIChat();
    expect(typeof handleSubmit).toBe('function');
  });

  it('should return append function', () => {
    const { append } = useAIChat();
    expect(typeof append).toBe('function');
  });
});
