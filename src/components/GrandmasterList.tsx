import React from 'react';
import { Link } from 'react-router-dom';
import { useGrandmasters } from '../hooks/useGrandmasters';

const GrandmasterList: React.FC = () => {
  const { grandmasters, loading, error, fetchGrandmasters } = useGrandmasters();

  if (loading && grandmasters.length === 0) {
    return (
      <div className='p-5 text-center text-lg text-gray-600'>
        Loading Grandmasters...
      </div>
    );
  }

  if (error) {
    return (
      <div className='p-5 text-center text-lg text-red-600'>
        Error: {error} <button onClick={fetchGrandmasters} className='ml-2 px-2 py-1 bg-blue-500 text-white rounded hover:bg-blue-600'>Retry</button>
      </div>
    );
  }

  if (grandmasters.length === 0 && !loading) {
    return (
      <div className='p-5 text-center text-lg text-gray-600'>
        No Grandmasters found. <button onClick={fetchGrandmasters} className='ml-2 px-2 py-1 bg-blue-500 text-white rounded hover:bg-blue-600'>Try Again</button>
      </div>
    );
  }

  return (
    <div className='p-5 font-sans'>
      <h1 className='mb-5 text-center text-2xl font-bold text-gray-800'>
        Chess Grandmasters
      </h1>
      <ul className='grid list-none grid-cols-[repeat(auto-fill,minmax(150px,1fr))] gap-2.5 p-0'>
        {grandmasters.map((gm) => (
          <li
            key={gm}
            className='rounded-md border border-gray-200 bg-gray-50 p-0 text-center'
          >
            <Link
              to={`/player/${gm}`}
              className='block h-full w-full cursor-pointer p-2.5 transition-colors duration-200 ease-in-out hover:bg-gray-200'
            >
              {gm}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default GrandmasterList;
