// MyPostCard.jsx
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { MessageSquare, RefreshCw, Heart } from 'lucide-react';
import { postApi } from '../utils/postApi';
import { userApi } from '../utils/userApi';
import { authApi } from '../utils/authApi';

const MyPostCard = ({ post_id, content, comments_count, reposts_count, likes_count, created_at, is_repost, reposted_by }) => {
  const [likes, setLikes] = useState(parseInt(likes_count));
  const [reposts, setReposts] = useState(parseInt(reposts_count));
  const [isLiked, setIsLiked] = useState(false);
  const [isReposted, setIsReposted] = useState(false);
  const [user, setUser] = useState(null);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const userData = await userApi.getCurrentUserProfile();
        setUser(userData);
      } catch (error) {
        console.error('Error fetching user data:', error);
      }
    };

    const checkLikeStatus = async () => {
      try {
        const response = await postApi.checkLikeStatus(post_id);
        setIsLiked(response.data.isLiked);
      } catch (error) {
        console.error('Error checking like status:', error);
      }
    };

    const checkRepostStatus = async () => {
      try {
        const response = await postApi.checkRepostStatus(post_id);
        setIsReposted(response.data.isReposted);
      } catch (error) {
        console.error('Error checking repost status:', error);
      }
    };

    fetchUserData();
    checkLikeStatus();
    checkRepostStatus();
  }, [post_id]);

  const handleLike = async () => {
    try {
      await postApi.likePost(post_id);
      setLikes(prev => isLiked ? prev - 1 : prev + 1);
      setIsLiked(!isLiked);
    } catch (error) {
      console.error('Error liking post:', error);
    }
  };

  const handleRepost = async () => {
    try {
      await postApi.repostPost(post_id);
      setReposts(prev => isReposted ? prev - 1 : prev + 1);
      setIsReposted(!isReposted);
    } catch (error) {
      console.error('Error reposting:', error);
    }
  };

  if (!user) return null;

  return (
    <div className="bg-xenial-gray rounded-lg p-4 w-full font-body relative">
      {is_repost && (
        <div className="text-gray-400 text-sm mb-2">
          {reposted_by} reposted this
        </div>
      )}
      <div className="flex items-start space-x-3">
        <Link to="/profile">
          <img 
            src={userApi.getFullAvatarUrl(user.avatar_url)} 
            alt={`${user.username}'s avatar`} 
            className="w-10 h-10 rounded-full"
          />
        </Link>
        <div className="flex-grow">
          <div className="flex items-center space-x-2">
            <Link 
              to="/profile"
              className="font-bold text-white hover:underline"
            >
              {user.username}
            </Link>
            <p className="text-gray-400 text-sm">
              {new Date(created_at).toLocaleString()}
            </p>
          </div>
          <p className="text-white mt-2">{content}</p>
        </div>
      </div>
      <div className="flex justify-between mt-4 text-gray-400 text-sm">
        <button className="flex items-center space-x-1">
          <MessageSquare size={16} />
          <span>{comments_count}</span>
        </button>
        <button
          className={`flex items-center space-x-1 ${isReposted ? 'text-green-500' : ''}`}
          onClick={handleRepost}
        >
          <RefreshCw size={16} />
          <span>{reposts}</span>
        </button>
        <button
          className={`flex items-center space-x-1 ${isLiked ? 'text-red-500' : ''}`}
          onClick={handleLike}
        >
          <Heart size={16} />
          <span>{likes}</span>
        </button>
      </div>
    </div>
  );
};

export default MyPostCard;