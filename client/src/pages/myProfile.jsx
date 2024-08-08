import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Edit } from "lucide-react";
import PostCard from "../components/postCard";
import { userApi } from "../utils/userApi";
import { authApi } from "../utils/authApi";

const MyProfile = () => {
  const navigate = useNavigate();
  const [profile, setProfile] = useState(null);
  const [posts, setPosts] = useState([]);
  const [error, setError] = useState(null);
  const [avatarError, setAvatarError] = useState(false);

  useEffect(() => {
    const fetchProfileData = async () => {
      try {
        const [profileResponse, postsResponse] = await Promise.all([
          userApi.getCurrentUserProfile(),
          userApi.getCurrentUserPosts()
        ]);
        setProfile(profileResponse.data);
        setPosts(postsResponse.data);
      } catch (error) {
        console.error("Error fetching profile data:", error);
        setError(error.response?.data?.error || error.message);
        if (error.response?.status === 401) {
          authApi.logout();
          navigate("/login");
        }
      }
    };

    fetchProfileData();
  }, [navigate]);

  if (error) return <div className="text-red-500 p-4 font-mono">{error}</div>;
  if (!profile) return <div className="text-white p-4 font-mono">Loading...</div>;

  const getInitial = (name) => {
    return name && typeof name === 'string' ? name.charAt(0).toUpperCase() : '?';
  };

  return (
    <div className="flex flex-col h-screen bg-xenial-dark text-white font-mono">
      <div className="flex-shrink-0 p-6 border-b border-gray-700">
        <h2 className="text-3xl font-bold font-heading mb-4">my profile</h2>
        <div className="flex items-center mb-4">
          <div className="w-24 h-24 bg-gray-300 rounded-full mr-4 overflow-hidden">
            {profile.avatar_url && !avatarError ? (
              <img
                src={userApi.getFullAvatarUrl(profile.avatar_url)}
                alt="Profile"
                className="w-full h-full object-cover"
                onError={() => setAvatarError(true)}
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-xenial-blue text-white text-2xl font-bold">
                {getInitial(profile.full_name || profile.username)}
              </div>
            )}
          </div>
          <div className="flex-grow">
            <h3 className="text-xl font-bold">{profile.full_name || profile.username}</h3>
            <p className="text-gray-400">@{profile.username}</p>
            <p className="mt-2">{profile.bio}</p>
          </div>
          <button 
            className="bg-xenial-blue text-white px-4 py-2 rounded-full flex items-center hover:bg-opacity-80 transition-colors"
            onClick={() => navigate("/settings")}
          >
            <Edit size={16} className="mr-2" />
            Edit Profile
          </button>
        </div>
        <div className="flex justify-between text-center">
          {['followers', 'following', 'likes'].map((stat) => (
            <div key={stat}>
              <p className="font-bold">{profile[`${stat}_count`] || 0}</p>
              <p className="text-gray-400">{stat}</p>
            </div>
          ))}
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

export default MyProfile;