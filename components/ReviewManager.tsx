'use client';
import React, { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase/supabaseClient';

interface ReviewManagerProps {
  photoId: string;
}

export default function ReviewManager({ photoId }: ReviewManagerProps) {
  const [reviews, setReviews] = useState<any[]>([]);
  const [newReview, setNewReview] = useState('');

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
    const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
if (sessionError || !sessionData.session || !sessionData.session.user) {
  console.error('User not authenticated');
  return;
}
    const user = sessionData.session.user;
    const { error } = await supabase.from('food_reviews').insert({
      photo_id: photoId,
      review_text: newReview, // ✅ Correct column name
      user_id: user.id,
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
