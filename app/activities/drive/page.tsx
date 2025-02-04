// app/activities/drive/page.tsx
'use client'
import { useState, useEffect, ChangeEvent } from "react";
import { createClient } from "../../../lib/supabase/client";

// Define the structure of a file stored in Supabase Storage.
// Note: Supabase returns file objects with at least a 'name' property,
// and often an 'updated_at' property (used here to represent upload date).
interface StorageFile {
  id: number;
  name: string;
  updated_at?: string;
}

export default function DriveApp() {
  const [files, setFiles] = useState<StorageFile[]>([]);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState<"name" | "updated_at">("name");
  const supabase = createClient();

  // Fetch files from Supabase Storage (bucket: "photos")
  const fetchFiles = async () => {
    // The Supabase Storage API supports sorting via the sortBy option.
    // We assume the bucket 'photos' exists.
    const { data, error } = await supabase.storage.from("photos").list("", {
      limit: 100,
      offset: 0,
      sortBy: { column: sortBy, order: "asc" }
    });
    if (error) {
      console.error("Error fetching files:", error);
    } else if (data) {
      setFiles(data.map(file => ({
        ...file,
        id: parseInt(file.id, 10)
      })));
    }
  };

  useEffect(() => {
    fetchFiles();
    // Re-fetch files when sortBy changes.
  }, [sortBy]);

  // Handle file selection from the file input.
  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
    }
  };

  // Upload the selected file.
  const uploadFile = async () => {
    if (!selectedFile) return;
    // Create a unique file name to avoid collisions.
    const filePath = `${Date.now()}_${selectedFile.name}`;
    const { data, error } = await supabase.storage.from("photos").upload(filePath, selectedFile);
    if (error) {
      console.error("Error uploading file:", error);
    } else {
      console.log("File uploaded:", data);
      setSelectedFile(null);
      // Refresh the file list after upload.
      fetchFiles();
    }
  };

  // Delete a file given its name.
  const deleteFile = async (fileName: string) => {
    const { data, error } = await supabase.storage.from("photos").remove([fileName]);
    if (error) {
      console.error("Error deleting file:", error);
    } else {
      console.log("File deleted:", data);
      // Refresh the file list after deletion.
      fetchFiles();
    }
  };

  // Filter files based on the search input.
  const filteredFiles = files.filter((file) =>
    file.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">Google Drive "Lite"</h1>

      {/* File Upload Section */}
      <div className="mb-4">
        <input type="file" onChange={handleFileChange} className="mb-2" />
        <button
          onClick={uploadFile}
          className="bg-blue-500 text-white p-2 rounded ml-2"
        >
          Upload File
        </button>
      </div>

      {/* Search & Sort Controls */}
      <div className="mb-4">
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search files"
          className="border p-2 mr-2"
        />
        <button
          onClick={() => setSortBy("name")}
          className="bg-green-500 text-white p-2 rounded mr-2"
        >
          Sort by Name
        </button>
        <button
          onClick={() => setSortBy("updated_at")}
          className="bg-green-500 text-white p-2 rounded"
        >
          Sort by Upload Date
        </button>
      </div>

      {/* Files List */}
      <ul className="list-disc pl-6">
        {filteredFiles.map((file) => (
          <li key={file.name} className="flex items-center justify-between">
            <span>{file.name}</span>
            <button
              onClick={() => deleteFile(file.name)}
              className="text-red-500 ml-4"
            >
              Delete
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
