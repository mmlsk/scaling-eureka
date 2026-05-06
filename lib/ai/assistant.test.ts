import { describe, it, expect } from 'vitest';
import { buildContextPrompt } from './assistant';

describe('AI Assistant', () => {
  it('should build context prompt with user data', () => {
    const context = [{ type: 'note', content: 'Hello world', similarity: 0.85 }];
    const prompt = buildContextPrompt(context, 'Test question');
    expect(prompt).toContain('Hello world');
    expect(prompt).toContain('Test question');
    expect(prompt).toContain('85%');
  });

  it('should handle empty context', () => {
    const prompt = buildContextPrompt([], 'Test');
    expect(prompt).toContain('No relevant context');
  });
});
