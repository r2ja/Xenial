import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { Search, X } from "lucide-react";
import PostCard from "../components/postCard";
import { postApi } from "../utils/postApi";
import { authApi } from "../utils/authApi";
import debounce from "lodash/debounce";

const TrendingPage = () => {
  const navigate = useNavigate();
  const [posts, setPosts] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [user, setUser] = useState(null);
  const [isSearching, setIsSearching] = useState(false);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const currentUser = await authApi.getCurrentUser();
        setUser(currentUser || null);
        if (!currentUser) navigate("/login");
      } catch (error) {
        console.error("Authentication error:", error);
        authApi.logout();
        navigate("/login");
      }
    };

    checkAuth();
    loadTrendingPosts();
  }, [navigate]);

  const loadTrendingPosts = async () => {
    try {
      const response = await postApi.getTrendingPosts();
      setPosts(response.data);
    } catch (error) {
      console.error("Error fetching trending posts:", error);
    }
  };

  const debouncedSearch = useCallback(
    debounce(async (term) => {
      if (term.trim() === "") {
        setSearchResults([]);
        setIsSearching(false);
        return;
      }
      try {
        const response = await postApi.searchPosts(term);
        setSearchResults(response.data.posts);
      } catch (error) {
        console.error("Error searching:", error);
      } finally {
        setIsSearching(false);
      }
    }, 300),
    []
  );

  useEffect(() => {
    if (searchTerm) {
      setIsSearching(true);
      debouncedSearch(searchTerm);
    } else {
      setSearchResults([]);
      setIsSearching(false);
    }
  }, [searchTerm, debouncedSearch]);

  return (
    <div className="flex flex-col h-screen bg-xenial-dark text-white">
      <div className="flex-shrink-0 p-6 border-b border-gray-700">
        <h2 className="text-3xl font-bold font-heading mb-4">trending</h2>
        <div className="mb-4 relative">
          <input
            type="text"
            placeholder="search"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-xenial-gray p-3 pr-10 rounded-full focus:outline-none focus:ring-2 focus:ring-xenial-blue"
          />
          <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          {searchTerm && (
            <X
              className="absolute right-10 top-1/2 transform -translate-y-1/2 text-gray-400 cursor-pointer"
              onClick={() => setSearchTerm('')}
            />
          )}
        </div>
      </div>
      <div className="flex-grow overflow-y-auto scrollbar-thin scrollbar-thumb-xenial-blue scrollbar-track-xenial-gray">
        <div className="space-y-6 p-6">
          {isSearching ? (
            <div className="text-center">Searching...</div>
          ) : searchTerm ? (
            searchResults.length > 0 ? (
              searchResults.map((post) => <PostCard key={post.post_id} {...post} />)
            ) : (
              <div className="text-center">No results found</div>
            )
          ) : (
            posts.map((post) => <PostCard key={post.post_id} {...post} />)
          )}
        </div>
      </div>
    </div>
  );
};

export default TrendingPage;