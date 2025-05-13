import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import type { PlayerProfile } from '../types';

const GrandmasterProfile: React.FC = () => {
  const { username } = useParams<{ username: string }>();
  const [profile, setProfile] = useState<PlayerProfile | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [timeSinceOnline, setTimeSinceOnline] = useState<string>('');

  useEffect(() => {
    if (!username) return;

    const fetchProfile = async () => {
      setLoading(true);
      setError(null);
      setProfile(null); // Clear previous profile data
      setTimeSinceOnline(''); // Clear previous time
      try {
        const response = await fetch(
          `https://api.chess.com/pub/player/${username}`
        );
        if (!response.ok) {
          if (response.status === 404) {
            throw new Error(`Player profile not found for "${username}".`);
          }
          throw new Error(
            `Error fetching profile: ${response.statusText} (status: ${response.status})`
          );
        }
        const data: PlayerProfile = await response.json();
        setProfile(data);
      } catch (err) {
        if (err instanceof Error) {
          setError(err.message);
        } else {
          setError('An unknown error occurred while fetching the profile.');
        }
        setProfile(null);
      }
      setLoading(false);
    };

    fetchProfile();
  }, [username]);

  useEffect(() => {
    if (!profile?.last_online) {
      setTimeSinceOnline(''); // Clear if no last_online timestamp
      return;
    }

    const lastOnlineTimestamp = profile.last_online * 1000; // Convert to milliseconds

    const updateClock = () => {
      const now = Date.now();
      const diffSeconds = Math.max(
        0,
        Math.floor((now - lastOnlineTimestamp) / 1000)
      );

      const hours = Math.floor(diffSeconds / 3600);
      const minutes = Math.floor((diffSeconds % 3600) / 60);
      const seconds = diffSeconds % 60;

      const formattedTime =
        `${String(hours).padStart(2, '0')}:` +
        `${String(minutes).padStart(2, '0')}:` +
        `${String(seconds).padStart(2, '0')} ago`;

      setTimeSinceOnline(formattedTime);
    };

    updateClock(); // Initial call to set time immediately
    const intervalId = setInterval(updateClock, 1000); // Update every second

    return () => clearInterval(intervalId); // Cleanup interval on unmount or profile change
  }, [profile?.last_online]);

  if (loading) {
    return (
      <div className='p-5 text-center text-lg text-gray-600'>
        Loading profile for {username}...
      </div>
    );
  }

  if (error) {
    return (
      <div className='p-5 text-center text-lg text-red-600'>
        Error: {error}
        <div className='mt-4'>
          <Link
            to='/'
            className='rounded bg-blue-500 px-4 py-2 text-white hover:bg-blue-600'
          >
            Back to Grandmaster List
          </Link>
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className='p-5 text-center text-lg text-gray-600'>
        No profile data available for {username}.
        <div className='mt-4'>
          <Link
            to='/'
            className='rounded bg-blue-500 px-4 py-2 text-white hover:bg-blue-600'
          >
            Back to Grandmaster List
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className='flex flex-col items-center p-5 font-sans'>
      <div className='mb-4 w-full max-w-md rounded-lg border border-gray-200 bg-white p-6 shadow-md'>
        <Link
          to='/'
          className='mb-4 inline-block text-blue-500 hover:text-blue-700'
        >
          &larr; Back to Grandmaster List
        </Link>
        {profile.avatar && (
          <img
            src={profile.avatar}
            alt={`${profile.name || profile.username}'s avatar`}
            className='mx-auto mb-4 h-32 w-32 rounded-full border-2 border-gray-300 object-cover shadow-sm'
          />
        )}
        <h1 className='mb-1 text-center text-3xl font-bold text-gray-800'>
          {profile.name || profile.username}
        </h1>
        <p className='mb-4 text-center text-lg text-gray-500'>
          @{profile.username}
        </p>

        <div className='space-y-2 text-gray-700'>
          {profile.title && (
            <p>
              <span className='font-semibold'>Title:</span> {profile.title}
            </p>
          )}
          {profile.location && (
            <p>
              <span className='font-semibold'>Location:</span>{' '}
              {profile.location}
            </p>
          )}
          {profile.country && (
            <p>
              <span className='font-semibold'>Country:</span>{' '}
              {profile.country
                .substring(profile.country.lastIndexOf('/') + 1)
                .toUpperCase()}
            </p>
          )}
          <p>
            <span className='font-semibold'>Followers:</span>{' '}
            {profile.followers}
          </p>
          <p>
            <span className='font-semibold'>Joined:</span>{' '}
            {new Date(profile.joined * 1000).toLocaleDateString()}
          </p>
          {/* Last Online Clock Implementation */}
          {timeSinceOnline && (
            <div className='mt-4 border-t border-gray-200 pt-4'>
              <p className='text-center text-gray-600'>
                <span className='font-semibold'>Last Online:</span>
                <span className='ml-2 font-mono text-lg text-blue-600'>
                  {timeSinceOnline}
                </span>
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default GrandmasterProfile;
