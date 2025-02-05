import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import ReviewManager from '@/components/ReviewManager';
import { supabase } from '@/lib/supabase/client';

jest.mock('@/lib/supabase/client', () => ({
  supabase: {
    from: jest.fn().mockImplementation((table) => {
      if (table === 'food_reviews') {
        return {
          select: jest.fn().mockReturnThis(),
          eq: jest.fn().mockReturnValue({
            then: jest.fn((callback) =>
              callback({
                data: [{ id: 'review1', content: 'Great food!' }],
                error: null,
              })
            ),
          }),
          insert: jest.fn().mockReturnValue({
            then: jest.fn((callback) =>
              callback({ error: null })
            ),
          }),
          delete: jest.fn().mockReturnValue({
            eq: jest.fn().mockReturnValue({
              then: jest.fn((callback) =>
                callback({ error: null })
              ),
            }),
          }),
        };
      }
      return {};
    }),
    auth: {
      getUser: jest.fn().mockResolvedValue({ data: { user: { id: 'user1' } }, error: null }),
    },
  },
}));

describe('ReviewManager', () => {
  it('renders and displays reviews', async () => {
    render(<ReviewManager photoId="demo-photo-id" />);
    await waitFor(() => {
      expect(screen.getByText('Great food!')).toBeInTheDocument();
    });
  });

  it('allows posting a review', async () => {
    render(<ReviewManager photoId="demo-photo-id" />);
    const textarea = screen.getByPlaceholderText('Write your review...');
    fireEvent.change(textarea, { target: { value: 'Delicious!' } });
    const button = screen.getByText('Post Review');
    fireEvent.click(button);
    await waitFor(() => {
      // After posting, the textarea should be cleared.
      expect(textarea).toHaveValue('');
    });
  });
});
