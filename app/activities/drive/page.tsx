// app/activities/drive/page.tsx
'use client'
import { useState, useEffect, ChangeEvent } from "react";
import { createClient } from "../../../lib/supabase/client";

interface StorageFile {
  name: string;
  created_at?: string;
}

export default function DriveApp() {
  const [files, setFiles] = useState<StorageFile[]>([]);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState<"name" | "created_at">("name");
  const supabase = createClient();

  const fetchFiles = async () => {
    const { data, error } = await supabase.storage.from("photos").list("", {
      limit: 100,
      offset: 0,
      sortBy: { column: sortBy, order: "asc" }
    });
    if (error) {
      console.error("Error fetching files:", error);
    } else {
      setFiles(data || []);
    }
  };

  useEffect(() => {
    fetchFiles();
  }, [sortBy]);

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
    }
  };

  const uploadFile = async () => {
    if (!selectedFile) return;
    const filePath = `${Date.now()}_${selectedFile.name}`;
    const { data, error } = await supabase.storage.from("photos").upload(filePath, selectedFile);
    if (error) {
      console.error("Error uploading file:", error);
      alert(`Upload failed: ${error.message}`);
    } else {
      console.log("File uploaded:", data);
      setSelectedFile(null);
      fetchFiles();
    }
  };

  const deleteFile = async (fileName: string) => {
    const { error } = await supabase.storage.from("photos").remove([fileName]);
    if (error) {
      console.error("Error deleting file:", error);
    } else {
      fetchFiles();
    }
  };

  const filteredFiles = files.filter((file) =>
    file.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">Google Drive "Lite"</h1>
      <div className="mb-4">
        <input type="file" onChange={handleFileChange} className="mb-2" />
        <button onClick={uploadFile} className="bg-blue-500 text-white p-2 rounded ml-2">
          Upload File
        </button>
      </div>
      <div className="mb-4">
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search files"
          className="border p-2 mr-2"
        />
        <button onClick={() => setSortBy("name")} className="bg-green-500 text-white p-2 rounded mr-2">
          Sort by Name
        </button>
        <button onClick={() => setSortBy("created_at")} className="bg-green-500 text-white p-2 rounded">
          Sort by Upload Date
        </button>
      </div>
      <ul className="list-disc pl-6">
        {filteredFiles.map((file) => (
          <li key={file.name} className="flex items-center justify-between">
            <span>{file.name}</span>
            <button onClick={() => deleteFile(file.name)} className="text-red-500 ml-4">
              Delete
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
