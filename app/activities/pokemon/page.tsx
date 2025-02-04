// app/activities/pokemon/page.tsx
'use client'
import { useState, useEffect } from 'react';
import { createClient } from '../../../lib/supabase/client';

// Type for Pokémon data fetched from PokeAPI.
interface PokemonData {
  name: string;
  sprites: {
    front_default: string;
  };
}

// Type for a review record in Supabase.
interface PokemonReview {
  id: number;
  pokemon_name: string;
  review_text: string;
  created_at: string;
}

export default function PokemonReviewApp() {
    const supabase = createClient();
  // State for the search term and fetched Pokémon.
  const [searchTerm, setSearchTerm] = useState('');
  const [pokemon, setPokemon] = useState<PokemonData | null>(null);

  // State for reviews, new review input, and sorting.
  const [reviews, setReviews] = useState<PokemonReview[]>([]);
  const [newReview, setNewReview] = useState('');
  const [sortBy, setSortBy] = useState<'name' | 'created_at'>('created_at');

  // Function to search for a Pokémon using the PokeAPI.
  const searchPokemon = async () => {
    if (!searchTerm.trim()) return;
    try {
      const res = await fetch(`https://pokeapi.co/api/v2/pokemon/${searchTerm.toLowerCase()}`);
      if (!res.ok) {
        alert('Pokémon not found');
        setPokemon(null);
        return;
      }
      const data: PokemonData = await res.json();
      setPokemon(data);
      // When a Pokémon is found, fetch its reviews.
      fetchReviews(data.name);
    } catch (error) {
      console.error('Error fetching Pokémon:', error);
    }
  };

  // Function to fetch reviews for a given Pokémon name.
  const fetchReviews = async (pokemonName: string) => {
    const { data, error } = await supabase
      .from('pokemon_reviews')
      .select('*')
      .eq('pokemon_name', pokemonName)
      .order(sortBy, { ascending: true });
    if (error) {
      console.error('Error fetching reviews:', error);
    } else if (data) {
      setReviews(data as PokemonReview[]);
    }
  };

  // Function to add a new review.
  const addReview = async () => {
    if (!pokemon || !newReview.trim()) return;
    const { error } = await supabase
      .from('pokemon_reviews')
      .insert([{ pokemon_name: pokemon.name, review_text: newReview }]);
    if (error) {
      console.error('Error adding review:', error);
      alert(`Error adding review: ${error.message}`);
    } else {
      setNewReview('');
      fetchReviews(pokemon.name);
    }
  };

  // Function to delete a review by its ID.
  const deleteReview = async (reviewId: number) => {
    const { error } = await supabase
      .from('pokemon_reviews')
      .delete()
      .eq('id', reviewId);
    if (error) {
      console.error('Error deleting review:', error);
      alert(`Error deleting review: ${error.message}`);
    } else if (pokemon) {
      fetchReviews(pokemon.name);
    }
  };

  // Re-fetch reviews if the sorting option changes.
  useEffect(() => {
    if (pokemon) {
      fetchReviews(pokemon.name);
    }
  }, [sortBy]);

  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">Pokémon Review App</h1>
      
      {/* Search Section */}
      <div className="mb-4">
        <input 
          type="text" 
          value={searchTerm} 
          onChange={(e) => setSearchTerm(e.target.value)} 
          placeholder="Enter Pokémon name"
          className="border p-2 mr-2"
        />
        <button 
          onClick={searchPokemon} 
          className="bg-blue-500 text-white p-2 rounded"
        >
          Search
        </button>
      </div>
      
      {/* Display Pokémon Information if found */}
      {pokemon && (
        <div className="mb-4">
          <h2 className="text-xl capitalize">{pokemon.name}</h2>
          {pokemon.sprites.front_default && (
            <img 
              src={pokemon.sprites.front_default} 
              alt={pokemon.name} 
              className="w-32 h-32" 
            />
          )}
        </div>
      )}

      {/* Review Section for the Selected Pokémon */}
      {pokemon && (
        <div className="mb-4 border p-4">
          <h3 className="text-lg mb-2">Reviews for {pokemon.name}</h3>
          
          {/* Add New Review */}
          <div className="mb-2">
            <textarea
              value={newReview}
              onChange={(e) => setNewReview(e.target.value)}
              placeholder="Write your review here..."
              className="border p-2 w-full mb-2"
              rows={3}
            />
            <button
              onClick={addReview}
              className="bg-green-500 text-white p-2 rounded"
            >
              Add Review
            </button>
          </div>

          {/* Sorting Controls */}
          <div className="mb-2">
            <button
              onClick={() => setSortBy('created_at')}
              className="bg-green-500 text-white p-2 rounded mr-2"
            >
              Sort by Date
            </button>
            <button
              onClick={() => setSortBy('name')}
              className="bg-green-500 text-white p-2 rounded"
            >
              Sort by Name
            </button>
          </div>

          {/* Reviews List */}
          <ul className="list-disc pl-6">
            {reviews.map((review) => (
              <li key={review.id} className="flex items-center justify-between mb-2">
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
