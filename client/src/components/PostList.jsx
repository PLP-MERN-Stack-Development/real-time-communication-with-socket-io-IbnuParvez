import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { postService } from '../services/api';

const PostList = () => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const response = await postService.getAllPosts();
        setPosts(response.data);
      } catch (err) {
        setError('Failed to load posts');
      } finally {
        setLoading(false);
      }
    };

    fetchPosts();
  }, []);

  if (loading) return <div>Loading posts...</div>;
  if (error) return <div className="text-red-500">{error}</div>;

  return (
    <div>
      <h1 className="text-3xl font-bold mb-8">Blog Posts</h1>
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {posts.map((post) => (
          <div key={post._id} className="bg-white rounded-lg shadow-md p-6">
            {post.featuredImage && (
              <img
                src={`http://localhost:5000/${post.featuredImage}`}
                alt={post.title}
                className="w-full h-48 object-cover rounded mb-4"
              />
            )}
            <h2 className="text-xl font-semibold mb-2">
              <Link to={`/posts/${post._id}`} className="text-blue-600 hover:text-blue-800">
                {post.title}
              </Link>
            </h2>
            <p className="text-gray-600 mb-4">{post.excerpt}</p>
            <div className="flex justify-between text-sm text-gray-500">
              <span>By {post.author.name}</span>
              <span>{new Date(post.createdAt).toLocaleDateString()}</span>
            </div>
            <div className="mt-2">
              <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs">
                {post.category.name}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default PostList;