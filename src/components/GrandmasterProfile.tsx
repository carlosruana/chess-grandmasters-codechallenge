import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import type { PlayerProfileResponse } from '../types';

const GrandmasterProfile: React.FC = () => {
  const { username } = useParams<{ username: string }>();
  const [profile, setProfile] = useState<PlayerProfileResponse | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!username) return;

    const fetchProfile = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await fetch(`https://api.chess.com/pub/player/${username}`);
        if (!response.ok) {
          if (response.status === 404) {
            throw new Error(`Player "${username}" not found.`);
          } else {
            throw new Error(`Error fetching data: ${response.statusText} (status: ${response.status})`);
          }
        }
        const data: PlayerProfileResponse = await response.json();
        setProfile(data);
      } catch (err) {
        if (err instanceof Error) {
          setError(err.message);
        } else {
          setError('An unknown error occurred');
        }
        console.error(`Failed to fetch profile for ${username}:`, err);
      }
      setLoading(false);
    };

    fetchProfile();
  }, [username]);

  if (loading) {
    return <div className="text-center text-lg p-5 text-gray-600">Loading profile for {username}...</div>;
  }

  if (error) {
    return <div className="text-center text-lg p-5 text-red-600">Error: {error}</div>;
  }

  if (!profile) {
    return <div className="text-center text-lg p-5 text-gray-600">No profile data available for {username}.</div>;
  }

  // Helper function to format Unix timestamp to a readable date/time
  const formatTimestamp = (timestamp: number) => {
    return new Date(timestamp * 1000).toLocaleString();
  };

  return (
    <div className="p-5 font-sans max-w-2xl mx-auto bg-white shadow-md rounded-lg">
      <h1 className="text-center text-gray-800 text-3xl font-bold mb-6">
        {profile.name ? `${profile.name} (${profile.username})` : profile.username}
        {profile.title && <span className="text-xl text-yellow-500 ml-2">{profile.title}</span>}
      </h1>
      <div className="flex flex-col items-center md:flex-row md:items-start">
        {profile.avatar && (
          <img
            src={profile.avatar}
            alt={`${profile.username}'s avatar`}
            className="w-32 h-32 rounded-full mb-4 md:mb-0 md:mr-6 border-2 border-gray-300"
          />
        )}
        <div className="text-gray-700 space-y-2 text-center md:text-left">
          <p>
            <strong>Username:</strong> {profile.username}
          </p>
          {profile.name && (
            <p>
              <strong>Name:</strong> {profile.name}
            </p>
          )}
          <p>
            <strong>Profile URL:</strong> <a href={profile.url} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline">{profile.url}</a>
          </p>
          <p>
            <strong>Followers:</strong> {profile.followers.toLocaleString()}
          </p>
          <p>
            <strong>Country:</strong> <a href={`https://www.chess.com/country/${profile.country.split('/').pop()}`} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline">{profile.country.split('/').pop()?.toUpperCase()}</a>
          </p>
          <p>
            <strong>Last Online:</strong> {formatTimestamp(profile.last_online)}
          </p>
          <p>
            <strong>Joined:</strong> {formatTimestamp(profile.joined)}
          </p>
          <p>
            <strong>Status:</strong> <span className={`px-2 py-1 text-sm font-semibold rounded-full ${profile.status === 'closed:fair_play_violations' ? 'bg-red-200 text-red-800' : 'bg-green-200 text-green-800'}`}>{profile.status}</span>
          </p>
          {profile.is_streamer && profile.twitch_url && (
            <p>
              <strong>Twitch:</strong> <a href={profile.twitch_url} target="_blank" rel="noopener noreferrer" className="text-purple-600 hover:underline">{profile.twitch_url}</a>
            </p>
          )}
          {profile.league && (
            <p>
              <strong>League:</strong> {profile.league}
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default GrandmasterProfile;
