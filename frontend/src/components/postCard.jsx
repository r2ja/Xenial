import React, { useState } from 'react';
import { MessageSquare, RefreshCw, Heart } from 'lucide-react';
import { postApi } from '../utils/postApi';

const PostCard = ({ post_id, user_name, avatar_url, content, comments_count, reposts_count, likes_count, created_at }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [likes, setLikes] = useState(parseInt(likes_count));
  const [comments, setComments] = useState(parseInt(comments_count));
  const [reposts, setReposts] = useState(parseInt(reposts_count));
  const [isLiked, setIsLiked] = useState(false);

  const toggleExpand = () => setIsExpanded(!isExpanded);

  const handleLike = async () => {
    try {
      await postApi.likePost(post_id);
      setLikes(prev => prev + 1);
      setIsLiked(true);
    } catch (error) {
      console.error('Error liking post:', error);
    }
  };

  const handleComment = async () => {
    try {
      await postApi.commentOnPost(post_id);
      setComments(prev => prev + 1);
    } catch (error) {
      console.error('Error commenting on post:', error);
    }
  };

  const handleRepost = async () => {
    try {
      await postApi.repostPost(post_id);
      setReposts(prev => prev + 1);
    } catch (error) {
      console.error('Error reposting:', error);
    }
  };

  return (
    <div className="bg-xenial-gray rounded-lg p-4 mb-4">
      <div className="flex items-start space-x-3">
        <img src={avatar_url} alt={`${user_name}'s avatar`} className="w-10 h-10 rounded-full" />
        <div className="flex-grow">
          <h3 className="font-bold text-white">{user_name}</h3>
          <p className="text-gray-400 text-sm">{new Date(created_at).toLocaleString()}</p>
          <p className={`text-white mt-2 ${isExpanded ? '' : 'line-clamp-3'}`}>{content}</p>
          {!isExpanded && content.length > 150 && (
            <button onClick={toggleExpand} className="text-xenial-blue mt-2">
              View more
            </button>
          )}
        </div>
      </div>
      <div className="flex justify-between mt-4">
        <IconButton icon={<MessageSquare />} count={comments} onClick={handleComment} />
        <IconButton icon={<RefreshCw />} count={reposts} onClick={handleRepost} />
        <IconButton
          icon={<Heart />}
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
      {React.cloneElement(icon, { className: 'w-5 h-5' })}
      <span>{count}</span>
    </button>
  );
};

export default PostCard;