import React from 'react';
import { User, Heart, Users } from 'lucide-react';
import { userApi } from '../utils/userApi';

const ProfilePopup = ({ user }) => {
  if (!user) {
    return <div className="bg-xenial-dark border border-xenial-gray rounded-lg p-4 shadow-lg w-64 font-body">
      <p className="text-white text-sm">Loading user data...</p>
    </div>;
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
          <span>{user.followers_count || 0} {user.followers_count !== 1 ? '' : ''}</span>
        </div>
        <div className="flex items-center">
          <User size={14} className="mr-1" />
          <span>{user.following_count || 0} </span>
        </div>
        <div className="flex items-center">
          <Heart size={14} className="mr-1" />
          <span>{user.likes_count || 0} {user.likes_count !== 1 ? '' : ''}</span>
        </div>
      </div>
    </div>
  );
};

export default ProfilePopup;