// myProfile.jsx
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import MyPostCard from "../components/myPostCard";
import { userApi } from "../utils/userApi";
import { authApi } from "../utils/authApi";

const MyProfile = () => {
  const navigate = useNavigate();
  const [profileData, setProfileData] = useState(null);
  const [posts, setPosts] = useState([]);
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchProfileData = async () => {
      try {
        const [profileResponse, postsResponse] = await Promise.all([
          userApi.getCurrentUserProfile(),
          userApi.getCurrentUserPosts(),
        ]);
        setProfileData(profileResponse);
        setPosts(postsResponse);
      } catch (error) {
        console.error("Error fetching profile data:", error);
        setError(error.response?.data?.error || error.message || "An error occurred while fetching profile data");
        if (error.response?.status === 401) {
          authApi.logout();
          navigate("/login");
        }
      } finally {
        setIsLoading(false);
      }
    };
  
    fetchProfileData();
  }, [navigate]);

  if (isLoading) return <div className="text-white p-4 font-mono">Loading...</div>;
  if (error) return <div className="text-red-500 p-4 font-mono">{error}</div>;
  if (!profileData) return <div className="text-white p-4 font-mono">No profile data available.</div>;

  return (
    <div className="flex flex-col h-screen bg-xenial-dark text-white font-mono">
      <div className="flex-shrink-0 p-6 border-b border-gray-700">
        <h2 className="text-3xl font-bold font-heading mb-4">my profile</h2>
        <div className="flex items-center mb-4">
          <img
            src={userApi.getFullAvatarUrl(profileData.avatar_url)}
            alt="Profile"
            className="w-24 h-24 rounded-full mr-4"
          />
          <div className="flex-grow">
            <h3 className="text-xl font-bold">
              {profileData.full_name || profileData.username}
            </h3>
            <p className="text-gray-400">@{profileData.username}</p>
            <p className="mt-2">{profileData.bio}</p>
          </div>
          <button
            className="bg-xenial-blue text-white px-4 py-2 rounded-full flex items-center hover:bg-opacity-80 transition-colors"
            onClick={() => navigate("/settings")}
          >
            Edit Profile
          </button>
        </div>
        <div className="flex justify-between text-center">
          <div>
            <p className="font-bold">{profileData.followers_count}</p>
            <p className="text-gray-400">followers</p>
          </div>
          <div>
            <p className="font-bold">{profileData.following_count}</p>
            <p className="text-gray-400">following</p>
          </div>
          <div>
            <p className="font-bold">{profileData.likes_count}</p>
            <p className="text-gray-400">likes</p>
          </div>
          <div>
            <p className="font-bold">{profileData.reposts_count}</p>
            <p className="text-gray-400">reposts</p>
          </div>
        </div>
      </div>
      <div className="flex-grow overflow-y-auto scrollbar-thin scrollbar-thumb-xenial-blue scrollbar-track-xenial-gray">
        <div className="space-y-6 p-6">
          {posts.map((post) => (
            <MyPostCard key={post.post_id} {...post} />
          ))}
        </div>
      </div>
    </div>
  );
};

export default MyProfile;