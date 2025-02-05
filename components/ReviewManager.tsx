'use client';
import React, { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';

interface ReviewManagerProps {
  photoId: string;
}

export default function ReviewManager({ photoId }: ReviewManagerProps) {
  const [reviews, setReviews] = useState<any[]>([]);
  const [newReview, setNewReview] = useState('');
  const supabase = createClient();

  const fetchReviews = async () => {
    const { data, error } = await supabase
      .from('food_reviews')
      .select('*')
      .eq('photo_id', photoId);
    if (error) {
      console.error('Error fetching reviews:', error);
    } else {
      setReviews(data || []);
    }
  };

  useEffect(() => {
    fetchReviews();
  }, [photoId]);

  const handleSubmit = async () => {
    const { data: userData, error: userError } = await supabase.auth.getUser();
    if (userError || !userData.user) {
      console.error('User not authenticated');
      return;
    }
    const user = userData.user;
    const { error } = await supabase.from('food_reviews').insert({
      photo_id: photoId,
      content: newReview,
      user_id: user.id,
      rating: 5, // default rating for MVP
    });
    if (error) {
      console.error('Error posting review:', error);
    } else {
      setNewReview('');
      fetchReviews();
    }
  };

  const handleDelete = async (reviewId: string) => {
    const { error } = await supabase.from('food_reviews').delete().eq('id', reviewId);
    if (error) {
      console.error('Error deleting review:', error);
    } else {
      fetchReviews();
    }
  };

  return (
    <div className="mt-4">
      <h3>Reviews</h3>
      <textarea
        placeholder="Write your review..."
        value={newReview}
        onChange={(e) => setNewReview(e.target.value)}
      />
      <button onClick={handleSubmit}>Post Review</button>
      <div>
        {reviews.map((review) => (
          <div key={review.id} className="review-card">
           <p>{review.review_text}</p>
            <button onClick={() => handleDelete(review.id)}>Delete</button>
          </div>
        ))}
      </div>
    </div>
  );
}
