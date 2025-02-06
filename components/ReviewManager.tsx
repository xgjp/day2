import React, { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase/supabaseClient'; // Using the existing import pattern from the project

interface Review {
  id: string;
  review_text: string;
  user_id: string;
  created_at: string;
}

interface ReviewManagerProps {
  photoId: string;
}

export default function ReviewManager({ photoId }: ReviewManagerProps) {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [newReview, setNewReview] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);

  useEffect(() => {
    // Get current user ID on component mount
    const getCurrentUser = async () => {
      const { data: { session }, error } = await supabase.auth.getSession();
      if (session?.user) {
        setCurrentUserId(session.user.id);
      }
    };
    getCurrentUser();
  }, []);

  const fetchReviews = async () => {
    const { data, error } = await supabase
      .from('food_reviews')
      .select('*')
      .eq('photo_id', photoId)
      .order('created_at', { ascending: false });

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
    if (!newReview.trim()) return;
    
    setIsSubmitting(true);
    try {
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      if (sessionError || !session?.user) {
        alert('Please sign in to post a review');
        return;
      }

      const { error } = await supabase.from('food_reviews').insert({
        photo_id: photoId,
        review_text: newReview.trim(),
        user_id: session.user.id
      });

      if (error) throw error;
      
      setNewReview('');
      fetchReviews();
    } catch (error) {
      console.error('Error posting review:', error);
      alert('Failed to post review. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (reviewId: string) => {
    try {
      const { error } = await supabase
        .from('food_reviews')
        .delete()
        .eq('id', reviewId)
        .eq('user_id', currentUserId);

      if (error) throw error;
      fetchReviews();
    } catch (error) {
      console.error('Error deleting review:', error);
      alert('Failed to delete review');
    }
  };

  return (
    <div className="mt-4 space-y-4">
      <div className="space-y-2">
        <textarea
          className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          placeholder="Write your review..."
          value={newReview}
          onChange={(e) => setNewReview(e.target.value)}
          rows={3}
        />
        <button
          onClick={handleSubmit}
          disabled={isSubmitting || !newReview.trim()}
          className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isSubmitting ? 'Posting...' : 'Post Review'}
        </button>
      </div>

      <div className="space-y-4">
        {reviews.map((review) => (
          <div key={review.id} className="p-4 bg-gray-50 rounded-lg">
            <p className="text-gray-800">{review.review_text}</p>
            <div className="mt-2 flex justify-between items-center text-sm text-gray-500">
              <span>{new Date(review.created_at).toLocaleDateString()}</span>
              {review.user_id === currentUserId && (
                <button
                  onClick={() => handleDelete(review.id)}
                  className="text-red-500 hover:text-red-600"
                >
                  Delete
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}