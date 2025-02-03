// app/activities/todo/page.tsx
'use client'
import { useEffect, useState } from 'react';
import { createClient } from '../../../lib/supabase/client';

interface Todo {
  id: number;
  content: string;
}

export default function TodoApp() {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [newTodo, setNewTodo] = useState('');
  const supabase = createClient();
  // Fetch todos from Supabase
  const fetchTodos = async () => {

    const { data, error } = await supabase.from('todos').select('*');
    if (error) {
      console.error('Error fetching todos:', error);
    } else {
      setTodos(data as Todo[]);
    }
  };

  // Add a new todo
  const addTodo = async () => {
    if (!newTodo.trim()) return;
    const { error } = await supabase.from('todos').insert([{ content: newTodo }]);
    if (error) {
      console.error('Error adding todo:', error);
    } else {
      setNewTodo('');
      fetchTodos();
    }
  };

  // Delete a todo
  const deleteTodo = async (id: number) => {
    const { error } = await supabase.from('todos').delete().eq('id', id);
    if (error) {
      console.error('Error deleting todo:', error);
    } else {
      fetchTodos();
    }
  };

  useEffect(() => {
    fetchTodos();
  }, []);

  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">To-Do List</h1>
      <div className="mb-4">
        <input
          type="text"
          value={newTodo}
          onChange={(e) => setNewTodo(e.target.value)}
          placeholder="Enter new todo"
          className="border p-2 mr-2"
        />
        <button onClick={addTodo} className="bg-blue-500 text-white p-2 rounded">
          Add Todo
        </button>
      </div>
      <ul className="list-disc pl-6 space-y-2">
        {todos.map((todo) => (
          <li key={todo.id} className="flex items-center">
            <span className="flex-1">{todo.content}</span>
            <button onClick={() => deleteTodo(todo.id)} className="text-red-500 ml-4">
              Delete
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
