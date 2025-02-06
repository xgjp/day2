'use client'
import { useState, useEffect, ChangeEvent } from "react";
import { supabase } from '@/lib/supabase/supabaseClient'; // Use the singleton instance
import { uploadFoodPhoto } from "@/app/lib/uploadFoodPhoto"; // Import upload function
import ReviewManager from "./ReviewManager";

interface Photo {
    id: string;
    name: string;
    storage_path: string;
    created_at?: string;
  }
  
  export default function PhotoManager({ setSelectedPhotoId }: { setSelectedPhotoId: (id: string) => void }) {
    const [photos, setPhotos] = useState<Photo[]>([]);
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
  
    const fetchPhotos = async () => {
      const { data, error } = await supabase
        .from("food_photos")
        .select("*")
        .order("created_at", { ascending: false });
  
      if (error) {
        console.error("Error fetching photos:", error);
        return;
      }
      setPhotos(data || []);
    };
  
    useEffect(() => {
      fetchPhotos();
    }, []);

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
    }
  };

  // ✅ Call `uploadFoodPhoto.ts` instead of writing upload logic here
  const handleUpload = async () => {
    if (!selectedFile) {
      alert("Please select a file.");
      return;
    }
  
    try {
      const publicUrl = await uploadFoodPhoto(selectedFile); // ✅ Calling the function
      if (publicUrl) {
        alert("Photo uploaded successfully!");
        setSelectedFile(null);
        fetchPhotos(); // Refresh UI after upload
      } else {
        alert("Upload failed. No public URL returned.");
      }
    } catch (error) {
      console.error("Upload error:", error);
      alert("An error occurred during upload.");
    }
  };
  

  const deletePhoto = async (photoId: string, filePath: string) => {
    try {
      // Step 1: Delete reviews associated with this photo
      await supabase.from("food_reviews").delete().eq("photo_id", photoId);

      // Step 2: Delete photo entry from `food_photos`
      await supabase.from("food_photos").delete().eq("id", photoId);

      // Step 3: Delete from Supabase Storage
      const { error: storageError } = await supabase.storage.from("food").remove([filePath]);

      if (storageError) {
        console.error("Error deleting from storage:", storageError);
      }

      fetchPhotos();
    } catch (error) {
      console.error("Error deleting photo:", error);
    }
  };

  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">Food Review App</h1>
      <div className="mb-4">
        <input type="file" onChange={handleFileChange} className="mb-2 block" />
        <button onClick={handleUpload} className="bg-blue-500 text-white p-2 rounded">
          Upload Photo
        </button>
      </div>
      <ul>
        {photos.map((photo) => (
          <li key={photo.id} className="border p-4" onClick={() => setSelectedPhotoId(photo.id)}>
           <p className="text-sm text-gray-500">{photo.name}</p> 
           <img
  src={supabase.storage.from("food").getPublicUrl(photo.storage_path).data.publicUrl}
  alt={photo.name}
  className="w-32 h-32 object-cover"
/>

            <button onClick={() => deletePhoto(photo.id, photo.storage_path)} className="text-red-500">
              Delete
            </button>

            {/* Embed ReviewManager for each photo */}
            <ReviewManager photoId={photo.id} />
          </li>
        ))}
      </ul>
    </div>
  );
}
