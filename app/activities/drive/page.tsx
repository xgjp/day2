// app/activities/food-review/page.tsx
'use client'
import { useState, useEffect, ChangeEvent } from "react";
import { createClient } from "../../../lib/supabase/client";

interface StorageFile {
  id: number;
  name: string;
  created_at?: string;
}

interface Review {
  id: number;
  photo_id: number;
  review_text: string;
  created_at: string;
}

export default function FoodReviewApp() {
  const [photos, setPhotos] = useState<StorageFile[]>([]);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState<"name" | "created_at">("created_at");
  const [reviews, setReviews] = useState<Review[]>([]);
  const [newReview, setNewReview] = useState("");
  const supabase = createClient();

  const fetchPhotos = async () => {
    const { data, error } = await supabase.from("food_photos").select("*").order(sortBy, { ascending: false });
    if (error) {
      console.error("Error fetching photos:", error);
    } else {
      setPhotos(data || []);
    }
  };

  const fetchReviews = async () => {
    const { data, error } = await supabase.from("food_reviews").select("*").order("created_at", { ascending: false });
    if (error) {
      console.error("Error fetching reviews:", error);
    } else {
      setReviews(data || []);
    }
  };

  useEffect(() => {
    fetchPhotos();
    fetchReviews();
  }, [sortBy]);

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
    }
  };

  const uploadPhoto = async () => {
    if (!selectedFile) {
      alert("Please select a file.");
      return;
    }

    const filePath = `${Date.now()}_${selectedFile.name}`;
    const { data, error } = await supabase.storage.from("food").upload(filePath, selectedFile);
    if (error) {
      console.error("Error uploading photo:", error.message);
      alert(`Upload failed: ${error.message}`);
      return;
    }

    const { data: photoRecord, error: photoError } = await supabase.from("food_photos").insert([{ name: filePath }]).select("id").single();
    if (photoError) {
      console.error("Error saving photo metadata:", photoError);
      return;
    }

    setSelectedFile(null);
    fetchPhotos();
  };

  const deletePhoto = async (photoId: number, fileName: string) => {
    const { error } = await supabase.storage.from("food").remove([fileName]);
    if (error) {
      console.error("Error deleting photo:", error);
      return;
    }

    await supabase.from("food_reviews").delete().eq("photo_id", photoId);
    await supabase.from("food_photos").delete().eq("id", photoId);
    fetchPhotos();
    fetchReviews();
  };

  const addReview = async (photoName: string) => {
    if (!newReview.trim()) {
      alert("Review cannot be empty.");
      return;
    }

    // Ensure we get the correct photo_id before inserting
    const { data: photo, error: photoError } = await supabase.from("food_photos").select("id").eq("name", photoName).single();
    if (photoError || !photo) {
      console.error("Error finding photo ID:", photoError);
      alert("Error: Photo not found.");
      return;
    }

    const { error } = await supabase.from("food_reviews").insert([{ photo_id: photo.id, review_text: newReview }]);
    if (error) {
      console.error("Error adding review:", error);
      alert("Failed to add review.");
    } else {
      setNewReview("");
      fetchReviews();
    }
  };

  const deleteReview = async (reviewId: number) => {
    const { error } = await supabase.from("food_reviews").delete().eq("id", reviewId);
    if (error) {
      console.error("Error deleting review:", error);
    } else {
      fetchReviews();
    }
  };

  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">Food Review App</h1>
      <div className="mb-4">
        <input type="file" onChange={handleFileChange} className="mb-2 block" />
        <button onClick={uploadPhoto} className="bg-blue-500 text-white p-2 rounded">Upload Photo</button>
      </div>
      <ul>
        {photos.map((photo) => (
          <li key={photo.id}>
            <p className="text-sm text-gray-500">{photo.name}</p>
            <img
              src={supabase.storage.from("food").getPublicUrl(photo.name).data.publicUrl}
              alt={photo.name}
              className="w-32 h-32 object-cover"
            />
            <button onClick={() => deletePhoto(photo.id, photo.name)} className="text-red-500">Delete</button>
            <textarea value={newReview} onChange={(e) => setNewReview(e.target.value)} className="border p-2" placeholder="Add a review"></textarea>
            <button onClick={() => addReview(photo.name)} className="bg-green-500 text-white p-2 rounded">Submit Review</button>
            <ul>
              {reviews.filter((review) => review.photo_id === photo.id).map((review) => (
                <li key={review.id} className="border p-2">
                  <p className="text-sm text-gray-500">{review.created_at}</p>
                  {review.review_text}
                  <button onClick={() => deleteReview(review.id)} className="text-red-500 ml-2">Delete Review</button>
                </li>
              ))}
            </ul>
          </li>
        ))}
      </ul>
    </div>
  );
}
