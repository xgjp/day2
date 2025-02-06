'use client'
import { useState } from "react";
import PhotoManager from "@/components/PhotoManager";

export default function FoodReviewPage() {
  const [selectedPhotoId, setSelectedPhotoId] = useState<string | null>(null);

  return (
    <div>
  
      
      {/* Pass setSelectedPhotoId to allow photo selection */}
      <PhotoManager setSelectedPhotoId={setSelectedPhotoId} />
     
    </div>
  );
}
