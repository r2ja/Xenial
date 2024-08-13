import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import PostCard from '../components/postCard';
import { userApi } from '../utils/userApi';
import { authApi } from '../utils/authApi';

const UserProfile = () => {
  const { username } = useParams();
  const navigate = useNavigate();
  const [profile, setProfile] = useState(null);
  const [posts, setPosts] = useState([]);
  const [stats, setStats] = useState(null);
  const [isFollowing, setIsFollowing] = useState(false);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    console.log("Username from URL:", username); // Add this line for debugging

    const fetchProfileData = async () => {
      try {
        setLoading(true);
        const [profileResponse, postsResponse, statsResponse, followStatusResponse] = await Promise.all([
          userApi.getUserProfile(username),
          userApi.getUserPosts(username),
          userApi.getUserStats(username),
          userApi.getFollowStatus(username)
        ]);
        setProfile(profileResponse.data);
        setPosts(postsResponse.data);
        setStats(statsResponse);
        setIsFollowing(followStatusResponse.data.isFollowing);
      } catch (error) {
        console.error('Error fetching profile data:', error);
        setError(error.response?.data?.error || error.message);
        if (error.response?.status === 401) {
          authApi.logout();
          navigate('/login');
        }
      } finally {
        setLoading(false);
      }
    };

    fetchProfileData();
  }, [username, navigate]);

  const handleFollowToggle = async () => {
    try {
      const response = await userApi.toggleFollow(username);
      setIsFollowing(response.data.isFollowing);
      // Update followers count
      setStats(prevStats => ({
        ...prevStats,
        followers_count: response.data.isFollowing ? prevStats.followers_count + 1 : prevStats.followers_count - 1
      }));
    } catch (error) {
      console.error('Error toggling follow:', error);
    }
  };

  if (loading) return <div className="text-white p-4 font-mono">Loading...</div>;
  if (error) return <div className="text-red-500 p-4 font-mono">{error}</div>;
  if (!profile || !stats) return <div className="text-white p-4 font-mono">No profile data available.</div>;

  return (
    <div className="flex flex-col h-screen bg-xenial-dark text-white font-mono">
      <div className="flex-shrink-0 p-6 border-b border-gray-700">
        <button onClick={() => navigate(-1)} className="flex items-center text-xenial-blue mb-4">
          <ArrowLeft size={20} className="mr-2" />
          <span>go back</span>
        </button>
        <div className="flex items-center mb-4">
          <img
            src={userApi.getFullAvatarUrl(profile.avatar_url)}
            alt="Profile"
            className="w-24 h-24 rounded-full mr-4"
          />
          <div className="flex-grow">
            <h3 className="text-xl font-bold">{profile.full_name || profile.username}</h3>
            <p className="text-gray-400">@{profile.username}</p>
            <p className="mt-2">{profile.bio}</p>
          </div>
          <button 
            className={`px-4 py-2 rounded-full ${
              isFollowing 
                ? 'bg-xenial-blue text-white' 
                : 'border border-gray-400 text-gray-400'
            } hover:bg-opacity-80 transition-colors`}
            onClick={handleFollowToggle}
          >
            {isFollowing ? 'Following' : 'Follow'}
          </button>
        </div>
        <div className="flex justify-between text-center">
          <div>
            <p className="font-bold">{stats.followers_count}</p>
            <p className="text-gray-400">followers</p>
          </div>
          <div>
            <p className="font-bold">{stats.following_count}</p>
            <p className="text-gray-400">following</p>
          </div>
          <div>
            <p className="font-bold">{stats.likes_count}</p>
            <p className="text-gray-400">likes</p>
          </div>
          <div>
            <p className="font-bold">{stats.reposts_count}</p>
            <p className="text-gray-400">reposts</p>
          </div>
        </div>
      </div>
      <div className="flex-grow overflow-y-auto scrollbar-thin scrollbar-thumb-xenial-blue scrollbar-track-xenial-gray">
        <div className="space-y-6 p-6">
          {posts.map((post) => (
            <PostCard key={post.post_id} {...post} />
          ))}
        </div>
      </div>
    </div>
  );
};

export default UserProfile;