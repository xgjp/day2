// app/activities/food-review/page.tsx
'use client'
import { useState, useEffect, ChangeEvent } from "react";
import { createClient } from "../../../lib/supabase/client";

interface StorageFile {
  name: string;
  created_at?: string;
}

interface Review {
  id: number;
  photo_name: string;
  user_id: string;
  review_text: string;
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
    const { data, error } = await supabase.storage.from("food").list("", {
      limit: 100,
      offset: 0,
      sortBy: { column: sortBy, order: "desc" }
    });
    if (error) {
      console.error("Error fetching photos:", error);
    } else {
      setPhotos(data || []);
    }
  };

  const fetchReviews = async () => {
    const { data, error } = await supabase.from("food_reviews").select("*");
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
    const { data, error } = await supabase.storage.from("food-photos").upload(filePath, selectedFile);
    if (error) {
      console.error("Error uploading photo:", error.message);
      alert(`Upload failed: ${error.message}`);
      return;
    }

    setSelectedFile(null);
    fetchPhotos();
  };

  const deletePhoto = async (fileName: string) => {
    const { error } = await supabase.storage.from("food-photos").remove([fileName]);
    if (error) {
      console.error("Error deleting photo:", error);
    } else {
      await supabase.from("food_reviews").delete().eq("photo_name", fileName);
      fetchPhotos();
      fetchReviews();
    }
  };

  const addReview = async (photoName: string) => {
    if (!newReview.trim()) return;
    const { error } = await supabase.from("food_reviews").insert([{ photo_name: photoName, review_text: newReview }]);
    if (error) {
      console.error("Error adding review:", error);
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
          <li key={photo.name}>
            <img
              src={supabase.storage.from("food").getPublicUrl(photo.name).data.publicUrl}
              alt={photo.name}
              className="w-32 h-32 object-cover"
            />
            <button onClick={() => deletePhoto(photo.name)} className="text-red-500">Delete</button>
            <textarea value={newReview} onChange={(e) => setNewReview(e.target.value)} className="border p-2" placeholder="Add a review"></textarea>
            <button onClick={() => addReview(photo.name)} className="bg-green-500 text-white p-2 rounded">Submit Review</button>
            <ul>
              {reviews.filter((review) => review.photo_name === photo.name).map((review) => (
                <li key={review.id} className="border p-2">
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
