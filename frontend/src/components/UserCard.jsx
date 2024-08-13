import React from 'react';
import { Link } from 'react-router-dom';

const UserCard = ({ user_id, username, full_name, avatar_url, bio }) => {
  return (
    <Link to={`/user/${user_id}`} className="block hover:bg-xenial-gray p-4 rounded-lg mb-2">
      <div className="flex items-center">
        <img 
          src={avatar_url || '/default-avatar.png'} 
          alt={username} 
          className="w-12 h-12 rounded-full mr-4"
        />
        <div>
          <h4 className="font-semibold">{full_name}</h4>
          <p className="text-gray-400">@{username}</p>
          {bio && <p className="text-sm mt-1">{bio}</p>}
        </div>
      </div>
    </Link>
  );
};

export default UserCard;