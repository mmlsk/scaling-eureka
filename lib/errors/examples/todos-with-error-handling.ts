// Example integration of error handling system with existing todos query

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { createClient } from '@/lib/supabase/client';
import type { LocalTodo } from '@/types/state';
import {
  validateTodoText,
  validatePriority,
  isTodoData,
  isString,
  isBoolean,
} from '@/lib/validation';
import {
  useErrorHandler,
  _useAPICall,
  _useDatabaseOperation,
  APIError,
  DatabaseError,
  ValidationError,
  retryAPICall,
  retryDatabaseOperation,
} from '@/lib/errors';

export const TODOS_KEY = ['todos'] as const;

/**
 * Enhanced todos query with comprehensive error handling
 */
export function useTodos() {
  const supabase = createClient();
  const { handleError, isOnline } = useErrorHandler();

  return useQuery({
    queryKey: TODOS_KEY,
    queryFn: async () => {
      // Check online status
      if (!isOnline) {
        throw new APIError(
          'Cannot fetch todos while offline',
          '/todos',
          'GET',
          0,
          { isOnline: false }
        );
      }

      try {
        const { data, error } = await retryAPICall(async () => {
          return await supabase
            .from('todos')
            .select('*')
            .eq('archived', false)
            .order('created_at', { ascending: true });
        });

        if (error) {
          throw new APIError(
            `Failed to fetch todos: ${error.message}`,
            '/todos',
            'GET',
            error.code ? parseInt(error.code) : 500,
            { originalError: error }
          );
        }

        // Validate and type-check the data
        const validatedData = (data ?? []).filter((item): item is {
          id: string;
          text: string;
          done: boolean;
          priority: LocalTodo['p'];
          created_at: string;
          archived: boolean;
        } => {
          try {
            return isTodoData(item) &&
                   ['H', 'M', 'L'].includes(item.priority as LocalTodo['p']);
          } catch {
            return false;
          }
        });

        return validatedData;
      } catch (error) {
        // Handle error with comprehensive error handling
        throw handleError(error, { operation: 'fetchTodos' });
      }
    },
    retry: (failureCount, error) => {
      // Don't retry on validation errors
      if (error instanceof ValidationError) {
        return false;
      }
      // Retry up to 3 times for other errors
      return failureCount < 3;
    },
  });
}

/**
 * Enhanced archived todos query with error handling
 */
export function useArchivedTodos() {
  const supabase = createClient();
  const { handleError } = useErrorHandler();

  return useQuery({
    queryKey: ['todos', 'archived'],
    queryFn: async () => {
      try {
        const { data, error } = await retryAPICall(async () => {
          return await supabase
            .from('todos')
            .select('*')
            .eq('archived', true)
            .order('created_at', { ascending: false });
        });

        if (error) {
          throw new APIError(
            `Failed to fetch archived todos: ${error.message}`,
            '/todos/archived',
            'GET',
            error.code ? parseInt(error.code) : 500,
            { originalError: error }
          );
        }

        // Validate and type-check the data
        return (data ?? []).filter((item): item is {
          id: string;
          text: string;
          done: boolean;
          priority: LocalTodo['p'];
          created_at: string;
          archived: boolean;
        } => isTodoData(item));
      } catch (error) {
        throw handleError(error, { operation: 'fetchArchivedTodos' });
      }
    },
  });
}

/**
 * Enhanced add todo mutation with error handling
 */
export function useAddTodo() {
  const qc = useQueryClient();
  const supabase = createClient();
  const { handleError, showSuccess } = useErrorHandler();

  return useMutation({
    mutationFn: async (todo: { text: string; priority?: LocalTodo['p'] }) => {
      try {
        // Validate input
        const validatedText = validateTodoText(todo.text);
        const validatedPriority = todo.priority ? validatePriority(todo.priority) : 'M';

        const { data, error } = await retryDatabaseOperation(async () => {
          return await supabase
            .from('todos')
            .insert({
              text: validatedText,
              priority: validatedPriority,
              done: false,
              archived: false
            })
            .select()
            .single();
        });

        if (error) {
          throw new DatabaseError(
            `Failed to add todo: ${error.message}`,
            'insert',
            'todos',
            { originalError: error, validatedText, validatedPriority }
          );
        }

        // Validate response
        if (!isTodoData(data)) {
          throw new ValidationError(
            'Invalid todo data returned from server',
            'response',
            data
          );
        }

        // Show success message
        showSuccess('Todo added successfully');

        return data;
      } catch (error) {
        throw handleError(error, { operation: 'addTodo', input: todo });
      }
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: TODOS_KEY });
    },
    onError: (error) => {
      // Error is already handled by handleError
      console.error('Add todo failed:', error);
    },
  });
}

/**
 * Enhanced toggle todo mutation with error handling
 */
export function useToggleTodo() {
  const qc = useQueryClient();
  const supabase = createClient();
  const { handleError } = useErrorHandler();

  return useMutation({
    mutationFn: async ({ id, done }: { id: string; done: boolean }) => {
      try {
        // Validate input
        if (!isString(id) || id.length === 0) {
          throw new ValidationError('Invalid todo ID', 'id', id);
        }
        if (!isBoolean(done)) {
          throw new ValidationError('Invalid done status', 'done', done);
        }

        const { error } = await retryDatabaseOperation(async () => {
          return await supabase
            .from('todos')
            .update({ done: !done })
            .eq('id', id);
        });

        if (error) {
          throw new DatabaseError(
            `Failed to toggle todo: ${error.message}`,
            'update',
            'todos',
            { originalError: error, id, done }
          );
        }
      } catch (error) {
        throw handleError(error, { operation: 'toggleTodo', id, done });
      }
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: TODOS_KEY });
    },
  });
}

/**
 * Enhanced archive done mutation with error handling
 */
export function useArchiveDone() {
  const qc = useQueryClient();
  const supabase = createClient();
  const { handleError, showSuccess } = useErrorHandler();

  return useMutation({
    mutationFn: async () => {
      try {
        const { error } = await retryDatabaseOperation(async () => {
          return await supabase
            .from('todos')
            .update({ archived: true })
            .eq('done', true)
            .eq('archived', false);
        });

        if (error) {
          throw new DatabaseError(
            `Failed to archive todos: ${error.message}`,
            'update',
            'todos',
            { originalError: error }
          );
        }

        // Show success message
        showSuccess('Completed todos archived');
      } catch (error) {
        throw handleError(error, { operation: 'archiveDone' });
      }
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: TODOS_KEY });
      qc.invalidateQueries({ queryKey: ['todos', 'archived'] });
    },
  });
}

/**
 * Example of using error handling hooks in components
 */
export function useTodosWithErrorHandling() {
  const {
    data: todos,
    error: todosError,
    isLoading,
    isError,
    runAsync,
  } = useErrorHandler();

  const addTodo = useAddTodo();
  const toggleTodo = useToggleTodo();
  const archiveDone = useArchiveDone();

  const handleAddTodo = async (text: string, priority?: LocalTodo['p']) => {
    return runAsync(async () => {
      await addTodo.mutateAsync({ text, priority });
    }, { operation: 'addTodo', text, priority });
  };

  const handleToggleTodo = async (id: string, done: boolean) => {
    return runAsync(async () => {
      await toggleTodo.mutateAsync({ id, done });
    }, { operation: 'toggleTodo', id, done });
  };

  const handleArchiveDone = async () => {
    return runAsync(async () => {
      await archiveDone.mutateAsync();
    }, { operation: 'archiveDone' });
  };

  return {
    todos,
    todosError,
    isLoading,
    isError,
    handleAddTodo,
    handleToggleTodo,
    handleArchiveDone,
  };
}