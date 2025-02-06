'use client'
import { useState, useEffect } from "react";
import { createClient } from "../../../lib/supabase/client";
import ReactMarkdown from "react-markdown";

interface Note {
  id: number;
  user_id: string;
  title: string;
  content: string;
  created_at: string;
}

export default function MarkdownNotesApp() {
  const [notes, setNotes] = useState<Note[]>([]);
  const [newTitle, setNewTitle] = useState("");
  const [newContent, setNewContent] = useState("");
  const [editingNote, setEditingNote] = useState<Note | null>(null);
  const supabase = createClient();

  const fetchNotes = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data, error } = await supabase
      .from("notes")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching notes:", error);
    } else {
      setNotes(data as Note[]);
    }
  };

  useEffect(() => {
    fetchNotes();
  }, []);

  const addNote = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      alert("You must be logged in to add a note.");
      return;
    }

    if (!newTitle.trim() || !newContent.trim()) {
      alert("Please fill in both title and content.");
      return;
    }

    const { error } = await supabase.from("notes").insert([
      {
        user_id: user.id,
        title: newTitle,
        content: newContent,
      },
    ]);

    if (error) {
      console.error("Error adding note:", error.message);
      alert(`Error adding note: ${error.message}`);
    } else {
      setNewTitle("");
      setNewContent("");
      fetchNotes();
    }
  };

  const updateNote = async (note: Note) => {
    if (!note.title.trim() || !note.content.trim()) {
      alert("Please fill in both title and content.");
      return;
    }

    const { error } = await supabase
      .from("notes")
      .update({ title: note.title, content: note.content })
      .eq("id", note.id);

    if (error) {
      console.error("Error updating note:", error.message);
      alert(`Error updating note: ${error.message}`);
    } else {
      setEditingNote(null);
      fetchNotes();
    }
  };

  const deleteNote = async (id: number) => {
    const { error } = await supabase.from("notes").delete().eq("id", id);
    if (error) {
      console.error("Error deleting note:", error.message);
      alert(`Error deleting note: ${error.message}`);
    } else {
      fetchNotes();
    }
  };

  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">Markdown Notes App</h1>

      <div className="mb-6 border p-4">
        <h2 className="text-xl mb-2">Create New Note</h2>
        <input
          type="text"
          value={newTitle}
          onChange={(e) => setNewTitle(e.target.value)}
          placeholder="Note Title"
          className="border p-2 mb-2 w-full"
        />
        <textarea
          value={newContent}
          onChange={(e) => setNewContent(e.target.value)}
          placeholder="Note Content (Markdown supported)"
          className="border p-2 mb-2 w-full"
          rows={4}
        />
        <button onClick={addNote} className="bg-blue-500 text-white p-2 rounded">
          Add Note
        </button>
      </div>

      <div>
        <h2 className="text-xl mb-2">Your Notes</h2>
        {notes.length === 0 && <p>No notes available.</p>}
        {notes.map((note) => (
          <div key={note.id} className="mb-4 border p-4">
            {editingNote && editingNote.id === note.id ? (
              <div>
                <input
                  type="text"
                  value={editingNote.title}
                  onChange={(e) =>
                    setEditingNote({ ...editingNote, title: e.target.value })
                  }
                  className="border p-2 mb-2 w-full"
                />
                <textarea
                  value={editingNote.content}
                  onChange={(e) =>
                    setEditingNote({ ...editingNote, content: e.target.value })
                  }
                  className="border p-2 mb-2 w-full"
                  rows={4}
                />
                <button
                  onClick={() => updateNote(editingNote)}
                  className="bg-green-500 text-white p-2 rounded mr-2"
                >
                  Save
                </button>
                <button
                  onClick={() => setEditingNote(null)}
                  className="bg-gray-500 text-white p-2 rounded"
                >
                  Cancel
                </button>
              </div>
            ) : (
              <div>
                <h3 className="text-lg font-semibold">{note.title}</h3>
                <div className="mb-2">
                  <ReactMarkdown>{note.content}</ReactMarkdown>
                </div>
                <button
                  onClick={() => setEditingNote(note)}
                  className="bg-yellow-500 text-white p-2 rounded mr-2"
                >
                  Edit
                </button>
                <button
                  onClick={() => deleteNote(note.id)}
                  className="bg-red-500 text-white p-2 rounded"
                >
                  Delete
                </button>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
