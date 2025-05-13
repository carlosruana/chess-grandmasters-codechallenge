import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import type { PlayerProfile } from '../types/index';

const GrandmasterProfile: React.FC = () => {
  const { username } = useParams<{ username: string }>();
  const [profile, setProfile] = useState<PlayerProfile | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [timeSinceOnline, setTimeSinceOnline] = useState<string>('');
  const navigate = useNavigate();

  useEffect(() => {
    if (!username) return;

    const fetchProfile = async () => {
      setLoading(true);
      setError(null);
      setProfile(null);
      setTimeSinceOnline('');
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
      <div className='min-h-screen bg-gradient-to-b from-[#22272e] via-[#2d333b] to-[#22272e] p-5 font-sans'>
        <div className='mx-auto flex h-64 max-w-2xl items-center justify-center rounded-xl border border-[#444c56] bg-[#2d333b] p-8 shadow-xl ring-1 ring-[#444c56]'>
          <div className='flex items-center space-x-3 text-lg text-gray-300'>
            <svg
              className='h-6 w-6 animate-spin text-blue-500'
              xmlns='http://www.w3.org/2000/svg'
              fill='none'
              viewBox='0 0 24 24'
            >
              <circle
                className='opacity-25'
                cx='12'
                cy='12'
                r='10'
                stroke='currentColor'
                strokeWidth='4'
              ></circle>
              <path
                className='opacity-75'
                fill='currentColor'
                d='M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z'
              ></path>
            </svg>
            <span>Loading profile for {username}...</span>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className='min-h-screen bg-gradient-to-b from-[#22272e] via-[#2d333b] to-[#22272e] p-5 font-sans'>
        <div className='mx-auto mb-4 w-full max-w-2xl rounded-xl border border-red-500 bg-[#2d333b] p-8 shadow-xl ring-1 ring-red-500'>
          <div className='text-center text-lg text-red-400'>
            <svg
              className='mx-auto mb-4 h-12 w-12 text-red-500'
              fill='none'
              viewBox='0 0 24 24'
              stroke='currentColor'
            >
              <path
                strokeLinecap='round'
                strokeLinejoin='round'
                strokeWidth='2'
                d='M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z'
              />
            </svg>
            Error: {error}
            <div className='mt-6'>
              <Link
                to='/'
                className='inline-flex items-center gap-2 rounded-lg bg-red-500/20 px-4 py-2 text-sm font-medium text-red-400 transition-all hover:bg-red-500/30'
              >
                <svg
                  className='h-4 w-4'
                  fill='none'
                  stroke='currentColor'
                  viewBox='0 0 24 24'
                >
                  <path
                    strokeLinecap='round'
                    strokeLinejoin='round'
                    strokeWidth={2}
                    d='M10 19l-7-7m0 0l7-7m-7 7h18'
                  />
                </svg>
                Back to Grandmaster List
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className='min-h-screen bg-gradient-to-b from-[#22272e] via-[#2d333b] to-[#22272e] p-5 font-sans'>
        <div className='mx-auto mb-4 w-full max-w-2xl rounded-xl border border-[#444c56] bg-[#2d333b] p-8 shadow-xl ring-1 ring-[#444c56]'>
          <div className='text-center text-lg text-gray-300'>
            No profile data available for {username}.
            <div className='mt-6'>
              <Link
                to='/'
                className='inline-flex items-center gap-2 rounded-lg bg-[#444c56] px-4 py-2 text-sm font-medium text-gray-300 transition-all hover:bg-[#444c56]/80'
              >
                <svg
                  className='h-4 w-4'
                  fill='none'
                  stroke='currentColor'
                  viewBox='0 0 24 24'
                >
                  <path
                    strokeLinecap='round'
                    strokeLinejoin='round'
                    strokeWidth={2}
                    d='M10 19l-7-7m0 0l7-7m-7 7h18'
                  />
                </svg>
                Back to Grandmaster List
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#22272e] via-[#2d333b] to-[#22272e] p-6 font-sans">
      <div className="mx-auto mb-4 w-full max-w-2xl rounded-3xl bg-[#22272e]/90 p-8 shadow-2xl ring-1 ring-[#444c56] backdrop-blur-md backdrop-saturate-150">
        <button
          type='button'
          onClick={() => navigate('/?fromProfile=1')}
          className='mb-6 inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-bold text-white shadow transition-all hover:scale-105 hover:bg-blue-700'
        >
          <svg
            className='h-4 w-4'
            fill='none'
            stroke='currentColor'
            viewBox='0 0 24 24'
          >
            <path
              strokeLinecap='round'
              strokeLinejoin='round'
              strokeWidth={2}
              d='M10 19l-7-7m0 0l7-7m-7 7h18'
            />
          </svg>
          Back to Grandmaster List
        </button>

        <div className='mb-8 text-center'>
          {profile.avatar && (
            <img
              src={profile.avatar}
              alt={`${profile.name || profile.username}'s avatar`}
              className='mx-auto mb-4 h-32 w-32 rounded-full border-4 border-blue-700 object-cover shadow-lg ring-4 ring-white/10'
            />
          )}
          <h1 className='mb-1 text-4xl font-extrabold text-white drop-shadow-lg font-mono'>
            {profile.name || profile.username}
          </h1>
          <p className='text-lg text-blue-300 font-mono'>@{profile.username}</p>
        </div>

        <div className='grid gap-6 md:grid-cols-2'>
          <div className='rounded-xl bg-[#2d333b]/80 p-6 backdrop-blur-md'>
            <h2 className='mb-4 text-sm font-bold tracking-wider text-blue-400 uppercase'>Profile Info</h2>
            <div className='space-y-4'>
              {profile.title && (
                <div className='flex items-center justify-between'>
                  <span className='text-gray-300'>Title</span>
                  <span className='inline-flex items-center rounded-full bg-blue-900/60 px-3 py-1 text-sm font-medium text-blue-200'>
                    {profile.title}
                  </span>
                </div>
              )}
              {profile.location && (
                <div className='flex items-center justify-between'>
                  <span className='text-gray-300'>Location</span>
                  <span className='font-medium text-white'>
                    {profile.location}
                  </span>
                </div>
              )}
              {profile.country && (
                <div className='flex items-center justify-between'>
                  <span className='text-gray-300'>Country</span>
                  <span className='font-medium text-white'>
                    {profile.country
                      .substring(profile.country.lastIndexOf('/') + 1)
                      .toUpperCase()}
                  </span>
                </div>
              )}
            </div>
          </div>
          <div className='rounded-xl bg-[#2d333b]/80 p-6 backdrop-blur-md'>
            <h2 className='mb-4 text-sm font-bold tracking-wider text-blue-400 uppercase'>Stats</h2>
            <div className='space-y-4'>
              <div className='flex items-center justify-between'>
                <span className='text-gray-300'>Followers</span>
                <span className='inline-flex items-center rounded-full bg-blue-900/60 px-3 py-1 text-sm font-medium text-blue-200'>
                  {profile.followers.toLocaleString()}
                </span>
              </div>
              <div className='flex items-center justify-between'>
                <span className='text-gray-300'>Member Since</span>
                <span className='font-medium text-white'>
                  {new Date(profile.joined * 1000).toLocaleDateString(
                    undefined,
                    {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                    }
                  )}
                </span>
              </div>
              {profile.league && (
                <div className='flex items-center justify-between'>
                  <span className='text-gray-300'>League</span>
                  <span className='inline-flex items-center rounded-full bg-blue-900/60 px-3 py-1 text-sm font-medium text-blue-200'>
                    {profile.league}
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>

        {timeSinceOnline && (
          <div className='mt-6 rounded-xl bg-blue-900/30 p-4 text-center'>
            <p className='text-gray-200'>
              <span className='font-medium'>Last Online:</span>
              <span className='ml-2 font-mono text-lg text-blue-300'>
                {timeSinceOnline}
              </span>
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default GrandmasterProfile;
