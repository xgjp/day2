import { render, screen, waitFor } from '@testing-library/react';
import PhotoManager from '@/components/PhotoManager';
import { supabase } from '@/lib/supabase/client';

jest.mock('@/lib/supabase/client', () => ({
  supabase: {
    from: jest.fn().mockImplementation((table) => {
      if (table === 'photos') {
        return {
          select: jest.fn().mockReturnThis(),
          ilike: jest.fn().mockReturnThis(),
          order: jest.fn().mockReturnValue({
            then: jest.fn((callback) =>
              callback({
                data: [
                  { id: '1', name: 'Test Photo', storage_path: 'test-path' },
                ],
                error: null,
              })
            ),
          }),
          delete: jest.fn().mockReturnThis(),
          eq: jest.fn().mockReturnValue({
            then: jest.fn((callback) =>
              callback({
                error: null,
              })
            ),
          }),
        };
      }
      return {};
    }),
    storage: {
      from: jest.fn(() => ({
        getPublicUrl: jest.fn((path) => ({ publicURL: `https://example.com/${path}` })),
      })),
    },
  },
}));

describe('PhotoManager', () => {
  it('renders and displays photos', async () => {
    render(<PhotoManager />);
    expect(screen.getByPlaceholderText('Search photos...')).toBeInTheDocument();
    await waitFor(() => {
      expect(screen.getByText('Test Photo')).toBeInTheDocument();
    });
  });
});
