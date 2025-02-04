// tests/todo.test.tsx
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import TodoApp from '../app/activities/todo/page';
import { createClient } from '../lib/supabase/client';

// We'll mock Supabase methods for testing
jest.mock('../lib/supabase/client', () => {
    const supabase = createClient()
  const originalModule = jest.requireActual('../lib/supabaseClient');
  return {
    ...originalModule,
    supabase: {
      from: jest.fn().mockReturnValue({
        select: jest.fn().mockResolvedValue({
          data: [{ id: 1, content: 'Test Todo' }],
          error: null
        }),
        insert: jest.fn().mockResolvedValue({
          data: [{ id: 2, content: 'New Todo' }],
          error: null
        }),
        delete: jest.fn().mockResolvedValue({ error: null })
      })
    }
  };
});

describe('TodoApp', () => {
  test('renders the TodoApp and displays todos', async () => {
    render(<TodoApp />);
    expect(screen.getByText(/To-Do List/i)).toBeInTheDocument();
    // Wait for the fetched todo to appear
    await waitFor(() => expect(screen.getByText(/Test Todo/i)).toBeInTheDocument());
  });

  test('allows adding a new todo', async () => {
    render(<TodoApp />);
    const input = screen.getByPlaceholderText('Enter new todo');
    fireEvent.change(input, { target: { value: 'New Todo' } });
    const addButton = screen.getByText('Add Todo');
    fireEvent.click(addButton);
    // Wait for the new todo to appear
    await waitFor(() => expect(screen.getByText(/New Todo/i)).toBeInTheDocument());
  });

  test('allows deleting a todo', async () => {
    render(<TodoApp />);
    // Ensure the todo is present before deletion
    await waitFor(() => expect(screen.getByText(/Test Todo/i)).toBeInTheDocument());
    const deleteButton = screen.getByText('Delete');
    fireEvent.click(deleteButton);
    // After deletion, the todo should no longer be in the document
    await waitFor(() => expect(screen.queryByText(/Test Todo/i)).not.toBeInTheDocument());
  });
});
