// profilePopUp.jsx
import React, { useState, useEffect } from 'react';
import { User, Heart, Users } from 'lucide-react';
import { userApi } from '../utils/userApi';

const ProfilePopup = ({ username }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchUserData = async () => {
      if (!username) {
        setLoading(false);
        return;
      }
      try {
        const userData = await userApi.getUserProfile(username);
        setUser(userData.data);
      } catch (error) {
        console.error('Error fetching user data:', error);
        setError('Failed to load user data');
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, [username]);

  if (loading) {
    return <div className="bg-xenial-dark border border-xenial-gray rounded-lg p-4 shadow-lg w-64 font-body">
      <p className="text-white text-sm">Loading user data...</p>
    </div>;
  }

  if (error) {
    return <div className="bg-xenial-dark border border-xenial-gray rounded-lg p-4 shadow-lg w-64 font-body">
      <p className="text-white text-sm">{error}</p>
    </div>;
  }

  if (!user) {
    return null;
  }

  const avatarUrl = userApi.getFullAvatarUrl(user.avatar_url);

  return (
    <div className="bg-xenial-dark border border-xenial-gray rounded-lg p-4 shadow-lg w-64 font-body">
      <div className="flex items-center space-x-3 mb-3">
        <img src={avatarUrl || '/default-avatar.png'} alt={`${user.username}'s avatar`} className="w-12 h-12 rounded-full" />
        <div>
          <h3 className="font-bold text-white">{user.full_name || user.username}</h3>
          <p className="text-gray-400 text-sm">@{user.username}</p>
        </div>
      </div>
      <p className="text-white text-sm mb-3">{user.bio || 'No bio available'}</p>
      <div className="flex justify-between text-gray-400 text-xs">
        <div className="flex items-center">
          <Users size={14} className="mr-1" />
          <span>{user.followers_count || 0} followers</span>
        </div>
        <div className="flex items-center">
          <User size={14} className="mr-1" />
          <span>{user.following_count || 0} following</span>
        </div>
        <div className="flex items-center">
          <Heart size={14} className="mr-1" />
          <span>{user.likes_count || 0} likes</span>
        </div>
      </div>
    </div>
  );
};

export default ProfilePopup;