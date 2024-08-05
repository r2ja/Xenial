import React, { useState, useEffect, useCallback } from 'react';
import { Search, X, Send } from 'lucide-react';
import Sidebar from '../components/sideBar';
import PostCard from '../components/postCard';
import InfiniteScroll from '../components/infiniteScroll';
import { postApi } from '../utils/postApi';

const MainPage = () => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [newPost, setNewPost] = useState('');
  const [page, setPage] = useState(1);

  const loadMorePosts = useCallback(async () => {
    if (loading) return;
    setLoading(true);
    try {
      const response = await postApi.getPosts(page);
      const newPosts = response.data;
      setPosts(prevPosts => [...prevPosts, ...newPosts]);
      setPage(prevPage => prevPage + 1);
      if (newPosts.length === 0) {
        setHasMore(false);
      }
    } catch (error) {
      console.error('Error fetching posts:', error);
    } finally {
      setLoading(false);
    }
  }, [loading, page]);

  useEffect(() => {
    loadMorePosts();
  }, []);

  const handleSearch = async (e) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      try {
        const response = await postApi.searchPosts(searchTerm);
        setPosts(response.data);
        setHasMore(false);
      } catch (error) {
        console.error('Error searching posts:', error);
      }
    }
  };

  const handlePostSubmit = async (e) => {
    e.preventDefault();
    if (newPost.trim()) {
      try {
        const response = await postApi.createPost({ content: newPost });
        setPosts(prevPosts => [response.data, ...prevPosts]);
        setNewPost('');
      } catch (error) {
        console.error('Error creating post:', error);
      }
    }
  };

  return (
    <div className="flex min-h-screen bg-xenial-dark text-white font-body">
      <Sidebar />
      <main className="flex-grow ml-64 flex flex-col">
        <div className="bg-xenial-dark p-6 fixed top-0 left-64 right-0 z-10">
          <h2 className="text-3xl font-bold mb-6 font-heading">latest</h2>
          <form onSubmit={handleSearch} className="mb-6 relative">
            <input
              type="text"
              placeholder="search"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-xenial-gray p-3 pr-20 rounded-full focus:outline-none focus:ring-2 focus:ring-xenial-blue"
            />
            <button type="submit" className="absolute right-3 top-1/2 transform -translate-y-1/2">
              <Search className="text-gray-400" />
            </button>
            {searchTerm && (
              <button
                type="button"
                onClick={() => setSearchTerm('')}
                className="absolute right-10 top-1/2 transform -translate-y-1/2"
              >
                <X className="text-gray-400" />
              </button>
            )}
          </form>
          <form onSubmit={handlePostSubmit} className="mb-6 relative">
            <textarea
              placeholder="tell everyone what's going on..."
              value={newPost}
              onChange={(e) => setNewPost(e.target.value)}
              className="w-full bg-xenial-gray p-3 pr-12 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-xenial-blue"
              rows="2"
            />
            <button
              type="submit"
              className="absolute right-3 bottom-3 text-xenial-blue hover:text-xenial-blue-light"
            >
              <Send size={20} />
            </button>
          </form>
        </div>
        <div className="mt-64 p-6">
          <InfiniteScroll
            loadMore={loadMorePosts}
            hasMore={hasMore}
            loader={<div className="text-center py-4">Loading...</div>}
          >
            <div className="space-y-4">
              {posts.map((post) => (
                <PostCard key={post.post_id} {...post} />
              ))}
            </div>
          </InfiniteScroll>
        </div>
      </main>
    </div>
  );
};

export default MainPage;