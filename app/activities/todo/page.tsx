// app/activities/todo/page.tsx
// with priority field
'use client'
import { useEffect, useState } from 'react';
import { createClient } from '../../../lib/supabase/client';

interface Todo {
  id: number;
  content: string;
  priority: string;  // New priority field
}

export default function TodoApp() {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [newTodo, setNewTodo] = useState('');
  const [newPriority, setNewPriority] = useState('MEDIUM');  // Default to 'MEDIUM'
  const supabase = createClient();

  // Fetch todos from Supabase
  const fetchTodos = async () => {
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      console.error("User not authenticated");
      return;
    }

    const { data, error } = await supabase
      .from('todos')
      .select('*')
      .eq('user_id', user.id)  // Filter by user_id
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching todos:', error);
    } else {
      setTodos(data);
    }
  };

  // Add a new todo
  const addTodo = async () => {
    if (!newTodo.trim()) return;
    const { error } = await supabase.from('todos').insert([{ content: newTodo, priority: newPriority }]);
    if (error) {
      console.error('Error adding todo:', error);
    } else {
      setNewTodo('');
      setNewPriority('MEDIUM');  // Reset priority to 'MEDIUM'
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

  // Update priority
  const updatePriority = async (id: number, newPriority: string) => {
    const { error } = await supabase.from('todos').update({ priority: newPriority }).eq('id', id);
    if (error) {
      console.error('Error updating priority:', error);
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
        <select
          value={newPriority}
          onChange={(e) => setNewPriority(e.target.value)}
          className="border p-2 mr-2"
        >
          <option value="LOW">Low</option>
          <option value="MEDIUM">Medium</option>
          <option value="HIGH">High</option>
        </select>
        <button onClick={addTodo} className="bg-blue-500 text-white p-2 rounded">
          Add Todo
        </button>
      </div>
      <ul className="list-disc pl-6 space-y-2">
        {todos.map((todo) => (
          <li key={todo.id} className="flex items-center">
            <span className="flex-1">{todo.content} (Priority: {todo.priority})</span>
            <button onClick={() => deleteTodo(todo.id)} className="text-red-500 ml-4">
              Delete
            </button>
            <button
              onClick={() => updatePriority(todo.id, 'LOW')}
              className="ml-4 p-2 bg-green-500 text-white rounded"
            >
              Set Low
            </button>
            <button
              onClick={() => updatePriority(todo.id, 'MEDIUM')}
              className="ml-4 p-2 bg-yellow-500 text-white rounded"
            >
              Set Medium
            </button>
            <button
              onClick={() => updatePriority(todo.id, 'HIGH')}
              className="ml-4 p-2 bg-red-500 text-white rounded"
            >
              Set High
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}


/* export default function TodoApp() {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [newTodo, setNewTodo] = useState('');
  const supabase = createClient();
  // Fetch todos from Supabase
  const fetchTodos = async () => {
    const { data: { user } } = await supabase.auth.getUser();
  
    if (!user) {
      console.error("User not authenticated");
      return;
    }
  
    const { data, error } = await supabase
      .from('todos')
      .select('*')
      .eq('user_id', user.id)  // Filter by user_id
      .order('created_at', { ascending: false });
  
    if (error) {
      console.error('Error fetching todos:', error);
    } else {
      setTodos(data);
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
*/