'use client';
import { useState, useEffect, ChangeEvent } from 'react';
import { createClient } from '@/lib/supabase/client';
import { uploadDriveFile } from '../../lib/uploadDriveFile';

interface DriveFile {
  id: string;
  name: string;
  storage_path: string;
  created_at?: string;
}

export default function DriveManager() {
  const [files, setFiles] = useState<DriveFile[]>([]);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<'name' | 'created_at'>('created_at');
  const supabase = createClient();

  const fetchFiles = async () => {
    const { data, error } = await supabase
      .from('drive_files')
      .select('*')
      .order(sortBy, { ascending: false });

    if (error) {
      console.error('Error fetching files:', error);
      return;
    }
    setFiles(data || []);
  };

  useEffect(() => {
    fetchFiles();
  }, [sortBy]);

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) {
      alert('Please select a file.');
      return;
    }

    const uploadResult = await uploadDriveFile(selectedFile);
    if (uploadResult) {
      alert('File uploaded successfully!');
      setSelectedFile(null);
      fetchFiles(); // Refresh UI after upload
    } else {
      alert('Upload failed.');
    }
  };

  const deleteFile = async (fileId: string, filePath: string) => {
    try {
      await supabase.from('drive_files').delete().eq('id', fileId);
      await supabase.storage.from('drive').remove([filePath]);

      fetchFiles();
    } catch (error) {
      console.error('Error deleting file:', error);
    }
  };

  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">Google Drive Lite</h1>
      <div className="mb-4">
        <input type="file" onChange={handleFileChange} className="mb-2 block" />
        <button onClick={handleUpload} className="bg-blue-500 text-white p-2 rounded">
          Upload File
        </button>
      </div>

      <input
        type="text"
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        placeholder="Search files"
        className="border p-2 w-full mb-4"
      />

      <button onClick={() => setSortBy('name')} className="bg-green-500 text-white p-2 rounded mr-2">
        Sort by Name
      </button>
      <button onClick={() => setSortBy('created_at')} className="bg-green-500 text-white p-2 rounded">
        Sort by Upload Date
      </button>

      <ul>
        {files
          .filter((file) => file.name.toLowerCase().includes(searchQuery.toLowerCase()))
          .map((file) => (
            <li key={file.id} className="border p-4">
              <p className="text-sm text-gray-500">{file.name}</p>
              <a href={`https://xwwylayqeemnfwdwccsp.supabase.co/public/drive/${file.storage_path}`} 
                 target="_blank"
                 className="text-blue-500 underline">
                Download
              </a>
              <button
                onClick={() => deleteFile(file.id, file.storage_path)}
                className="text-red-500 ml-2">
                Delete
              </button>
            </li>
          ))}
      </ul>
    </div>
  );
}
