// app/activities/food-review/page.tsx
'use client'
import { useState, useEffect, ChangeEvent } from "react";
import { createClient } from "../../../lib/supabase/client";

// Define types for a food photo and its reviews.
interface FoodPhoto {
  id: number;
  name: string;
  photo_url: string;
  uploaded_at: string;
}

interface FoodReview {
  id: number;
  photo_id: number;
  review_text: string;
  created_at: string;
}

export default function FoodReviewApp() {
  // State for photos, reviews, and input fields
  const [photos, setPhotos] = useState<FoodPhoto[]>([]);
  const [selectedPhoto, setSelectedPhoto] = useState<FoodPhoto | null>(null);
  const [newPhotoName, setNewPhotoName] = useState("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [sortBy, setSortBy] = useState<"name" | "uploaded_at">("name");
  const [reviews, setReviews] = useState<FoodReview[]>([]);
  const [newReview, setNewReview] = useState("");

  const supabase = createClient();

  // Fetch photos from the database, sorted by sortBy
  const fetchPhotos = async () => {
    const { data, error } = await supabase
      .from("food_photos")
      .select("*")
      .order(sortBy, { ascending: true });
    if (error) {
      console.error("Error fetching photos:", error);
    } else if (data) {
      setPhotos(data as FoodPhoto[]);
    }
  };

  // Fetch reviews for a specific photo
  const fetchReviews = async (photoId: number) => {
    const { data, error } = await supabase
      .from("food_reviews")
      .select("*")
      .eq("photo_id", photoId)
      .order("created_at", { ascending: true });
    if (error) {
      console.error("Error fetching reviews:", error);
    } else if (data) {
      setReviews(data as FoodReview[]);
    }
  };

  useEffect(() => {
    fetchPhotos();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sortBy]);

  // Handle file selection for uploading a photo
  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
    }
  };

  // Upload photo: First, upload file to Supabase Storage, then insert a record in "food_photos"
  const uploadPhoto = async () => {
    if (!selectedFile || !newPhotoName.trim()) return;
    // Generate a unique file path using current timestamp
    const filePath = `${Date.now()}_${selectedFile.name}`;
    const { data: uploadData, error: uploadError } = await supabase
      .storage
      .from("food-photos")
      .upload(filePath, selectedFile);

    if (uploadError) {
      console.error("Error uploading photo:", uploadError);
      return;
    }

    // Get the public URL for the uploaded file
    const { data: publicUrlData } = supabase
      .storage
      .from("food-photos")
      .getPublicUrl(filePath);

    // Insert photo record into the database
    const { error: insertError } = await supabase
      .from("food_photos")
      .insert([{ name: newPhotoName, photo_url: publicUrlData.publicUrl }]);
    if (insertError) {
      console.error("Error inserting photo record:", insertError);
    } else {
      setNewPhotoName("");
      setSelectedFile(null);
      fetchPhotos();
    }
  };

  // Delete a photo: Remove from database and optionally from storage.
  const deletePhoto = async (photo: FoodPhoto) => {
    // Remove record from "food_photos"
    const { error } = await supabase
      .from("food_photos")
      .delete()
      .eq("id", photo.id);
    if (error) {
      console.error("Error deleting photo record:", error);
    } else {
      // Optionally, remove file from storage. Here we assume the filePath is the part after the last '/'.
      const fileName = photo.photo_url.split("/").pop()!;
      const { error: storageError } = await supabase
        .storage
        .from("food-photos")
        .remove([fileName]);
      if (storageError) {
        console.error("Error deleting photo from storage:", storageError);
      }
      // Clear selected photo if it was deleted.
      if (selectedPhoto?.id === photo.id) setSelectedPhoto(null);
      fetchPhotos();
    }
  };

  // Add a review for the selected photo.
  const addReview = async () => {
    if (!selectedPhoto || !newReview.trim()) return;
    const { error } = await supabase
      .from("food_reviews")
      .insert([{ photo_id: selectedPhoto.id, review_text: newReview }]);
    if (error) {
      console.error("Error adding review:", error);
    } else {
      setNewReview("");
      fetchReviews(selectedPhoto.id);
    }
  };

  // Delete a review.
  const deleteReview = async (reviewId: number) => {
    const { error } = await supabase
      .from("food_reviews")
      .delete()
      .eq("id", reviewId);
    if (error) {
      console.error("Error deleting review:", error);
    } else if (selectedPhoto) {
      fetchReviews(selectedPhoto.id);
    }
  };

  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">Food Review App</h1>
      
      {/* Photo Upload Section */}
      <div className="mb-6 border p-4">
        <h2 className="text-xl mb-2">Upload a Food Photo</h2>
        <input
          type="file"
          onChange={handleFileChange}
          className="mb-2 block"
        />
        <input
          type="text"
          value={newPhotoName}
          onChange={(e) => setNewPhotoName(e.target.value)}
          placeholder="Enter photo name"
          className="border p-2 mr-2"
        />
        <button
          onClick={uploadPhoto}
          className="bg-blue-500 text-white p-2 rounded"
        >
          Upload Photo
        </button>
      </div>

      {/* Photo List and Sorting Controls */}
      <div className="mb-6">
        <h2 className="text-xl mb-2">Food Photos</h2>
        <div className="mb-2">
          <button
            onClick={() => setSortBy("name")}
            className="bg-green-500 text-white p-2 rounded mr-2"
          >
            Sort by Name
          </button>
          <button
            onClick={() => setSortBy("uploaded_at")}
            className="bg-green-500 text-white p-2 rounded"
          >
            Sort by Upload Date
          </button>
        </div>
        <ul className="list-disc pl-6">
          {photos.map((photo) => (
            <li key={photo.id} className="mb-2">
              <div className="flex items-center justify-between">
                <div
                  className="cursor-pointer"
                  onClick={() => {
                    setSelectedPhoto(photo);
                    fetchReviews(photo.id);
                  }}
                >
                  {photo.name} - <span className="text-sm text-gray-500">{new Date(photo.uploaded_at).toLocaleString()}</span>
                </div>
                <button
                  onClick={() => deletePhoto(photo)}
                  className="text-red-500 ml-4"
                >
                  Delete
                </button>
              </div>
            </li>
          ))}
        </ul>
      </div>

      {/* Reviews Section for Selected Photo */}
      {selectedPhoto && (
        <div className="mb-6 border p-4">
          <h2 className="text-xl mb-2">Reviews for: {selectedPhoto.name}</h2>
          <div className="mb-2">
            <textarea
              value={newReview}
              onChange={(e) => setNewReview(e.target.value)}
              placeholder="Enter your review"
              className="border p-2 w-full mb-2"
              rows={3}
            />
            <button
              onClick={addReview}
              className="bg-blue-500 text-white p-2 rounded"
            >
              Add Review
            </button>
          </div>
          <ul className="list-disc pl-6">
            {reviews.map((review) => (
              <li key={review.id} className="flex items-center justify-between">
                <span>{review.review_text}</span>
                <button
                  onClick={() => deleteReview(review.id)}
                  className="text-red-500 ml-4"
                >
                  Delete
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
