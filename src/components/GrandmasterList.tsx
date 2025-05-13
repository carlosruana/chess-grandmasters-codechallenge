import React, { useEffect, useState } from 'react';
import type { GrandmasterListResponse } from '../types';

const API_URL = 'https://api.chess.com/pub/titled/GM';

const GrandmasterList: React.FC = () => {
  const [grandmasters, setGrandmasters] = useState<string[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchGrandmasters = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await fetch(API_URL);
        if (!response.ok) {
          throw new Error(`Error fetching data: ${response.statusText}`);
        }
        const data: GrandmasterListResponse = await response.json();
        setGrandmasters(data.players);
      } catch (err) {
        if (err instanceof Error) {
          setError(err.message);
        } else {
          setError('An unknown error occurred');
        }
        console.error("Failed to fetch grandmasters:", err);
      }
      setLoading(false);
    };

    fetchGrandmasters();
  }, []);

  if (loading) {
    return <div className="text-center text-lg p-5 text-gray-600">Loading Grandmasters...</div>;
  }

  if (error) {
    return <div className="text-center text-lg p-5 text-red-600">Error: {error}</div>;
  }

  return (
    <div className="p-5 font-sans">
      <h1 className="text-center text-gray-800 text-2xl font-bold mb-5">Chess Grandmasters</h1>
      <ul className="list-none p-0 grid grid-cols-[repeat(auto-fill,minmax(150px,1fr))] gap-2.5">
        {grandmasters.map((gm) => (
          <li key={gm} className="bg-gray-50 border border-gray-200 p-2.5 text-center rounded-md cursor-pointer transition-colors duration-200 ease-in-out hover:bg-gray-200">
            {gm}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default GrandmasterList;
