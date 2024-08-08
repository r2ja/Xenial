import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { MessageSquare, RefreshCw, Heart } from 'lucide-react';
import { postApi } from '../utils/postApi';
import { userApi } from '../utils/userApi';
import { authApi } from '../utils/authApi';
import ProfilePopup from './profilePopUp';

const PostCard = ({ post_id, user_id, user_name, avatar_url, content, comments_count, reposts_count, likes_count, created_at }) => {
  const navigate = useNavigate();
  const [likes, setLikes] = useState(parseInt(likes_count));
  const [comments, setComments] = useState(parseInt(comments_count));
  const [reposts, setReposts] = useState(parseInt(reposts_count));
  const [isLiked, setIsLiked] = useState(false);
  const [showProfilePopup, setShowProfilePopup] = useState(false);
  const [userData, setUserData] = useState(null);

  useEffect(() => {
    let isMounted = true;
    const fetchUserData = async () => {
      try {
        const response = await userApi.getUserProfile(user_id);
        if (isMounted) {
          setUserData(response.data);
        }
      } catch (error) {
        console.error('Error fetching user data:', error);
      }
    };

    if (showProfilePopup && !userData) {
      fetchUserData();
    }

    return () => {
      isMounted = false;
    };
  }, [user_id, showProfilePopup]);

  const handleAuthenticatedAction = async (action) => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/');
      return false;
    }
    return true;
  };

  const handleLike = async () => {
    if (await handleAuthenticatedAction()) {
      try {
        await postApi.likePost(post_id);
        setLikes(prev => prev + 1);
        setIsLiked(true);
      } catch (error) {
        console.error('Error liking post:', error);
        if (error.response && error.response.status === 401) {
          authApi.logout();
          navigate('/');
        }
      }
    }
  };

  const handleComment = async () => {
    if (await handleAuthenticatedAction()) {
      try {
        await postApi.commentOnPost(post_id);
        setComments(prev => prev + 1);
      } catch (error) {
        console.error('Error commenting on post:', error);
        if (error.response && error.response.status === 401) {
          authApi.logout();
          navigate('/');
        }
      }
    }
  };

  const handleRepost = async () => {
    if (await handleAuthenticatedAction()) {
      try {
        await postApi.repostPost(post_id);
        setReposts(prev => prev + 1);
      } catch (error) {
        console.error('Error reposting:', error);
        if (error.response && error.response.status === 401) {
          authApi.logout();
          navigate('/');
        }
      }
    }
  };

  return (
    <div className="bg-xenial-gray rounded-lg p-4 w-full font-body relative">
      <div className="flex items-start space-x-3">
        <div 
          className="relative"
          onMouseEnter={() => setShowProfilePopup(true)}
          onMouseLeave={() => setShowProfilePopup(false)}
        >
          <img src={userApi.getFullAvatarUrl(avatar_url)} alt={`${user_name}'s avatar`} className="w-10 h-10 rounded-full" />
          {showProfilePopup && (
            <div className="absolute left-0 mt-2 z-10">
              <ProfilePopup user={userData} />
            </div>
          )}
        </div>
        <div className="flex-grow">
          <div className="flex items-center space-x-2">
            <h3 className="font-bold text-white">{user_name}</h3>
            <p className="text-gray-400 text-sm">{new Date(created_at).toLocaleString()}</p>
          </div>
          <p className="text-white mt-2">{content}</p>
        </div>
      </div>
      <div className="flex justify-between mt-4 text-gray-400 text-sm">
        <IconButton icon={<MessageSquare size={16} />} count={comments} onClick={handleComment} />
        <IconButton icon={<RefreshCw size={16} />} count={reposts} onClick={handleRepost} />
        <IconButton
          icon={<Heart size={16} />}
          count={likes}
          active={isLiked}
          onClick={handleLike}
        />
      </div>
    </div>
  );
};

const IconButton = ({ icon, count, active, onClick }) => {
  return (
    <button
      className={`flex items-center space-x-1 ${
        active ? 'text-xenial-blue' : 'text-gray-400'
      } hover:text-xenial-blue`}
      onClick={onClick}
    >
      {icon}
      <span>{count}</span>
    </button>
  );
};

export default PostCard;