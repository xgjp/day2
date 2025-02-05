'use client'
import { useState } from "react";
import PhotoManager from "@/components/PhotoManager";
import ReviewManager from "@/components/ReviewManager";

export default function FoodReviewPage() {
  const [selectedPhotoId, setSelectedPhotoId] = useState<string | null>(null);

  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">Food Review App</h1>
      
      {/* Pass setSelectedPhotoId to allow photo selection */}
      <PhotoManager setSelectedPhotoId={setSelectedPhotoId} />

      {selectedPhotoId && (
        <section>
          <h2 className="text-xl font-bold mt-4">Reviews</h2>
          <ReviewManager photoId={selectedPhotoId} />
        </section>
      )}
    </div>
  );
}
