import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { postService } from '../services/api';

const PostDetail = () => {
  const { id } = useParams();
  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [comment, setComment] = useState('');

  useEffect(() => {
    const fetchPost = async () => {
      try {
        const response = await postService.getPost(id);
        setPost(response.data);
      } catch (err) {
        setError('Failed to load post');
      } finally {
        setLoading(false);
      }
    };

    fetchPost();
  }, [id]);

  const handleCommentSubmit = async (e) => {
    e.preventDefault();
    try {
      await postService.addComment(id, { content: comment });
      setComment('');
      // Refresh post to show new comment
      const response = await postService.getPost(id);
      setPost(response.data);
    } catch (err) {
      setError('Failed to add comment');
    }
  };

  if (loading) return <div>Loading post...</div>;
  if (error) return <div className="text-red-500">{error}</div>;
  if (!post) return <div>Post not found</div>;

  return (
    <div className="max-w-4xl mx-auto">
      <article className="bg-white rounded-lg shadow-md p-8">
        {post.featuredImage && (
          <img
            src={`http://localhost:5000/${post.featuredImage}`}
            alt={post.title}
            className="w-full h-64 object-cover rounded mb-6"
          />
        )}
        <h1 className="text-4xl font-bold mb-4">{post.title}</h1>
        <div className="flex justify-between text-gray-600 mb-6">
          <span>By {post.author.name}</span>
          <span>{new Date(post.createdAt).toLocaleDateString()}</span>
        </div>
        <div className="prose max-w-none mb-8">
          {post.content.split('\n').map((paragraph, index) => (
            <p key={index} className="mb-4">{paragraph}</p>
          ))}
        </div>
        <div className="flex flex-wrap gap-2 mb-8">
          {post.tags.map((tag, index) => (
            <span key={index} className="bg-gray-200 px-3 py-1 rounded-full text-sm">
              {tag}
            </span>
          ))}
        </div>
        <div className="border-t pt-8">
          <h3 className="text-2xl font-semibold mb-4">Comments</h3>
          {post.comments.map((comment) => (
            <div key={comment._id} className="bg-gray-50 p-4 rounded mb-4">
              <div className="flex justify-between mb-2">
                <strong>{comment.user.name}</strong>
                <span className="text-sm text-gray-500">
                  {new Date(comment.createdAt).toLocaleDateString()}
                </span>
              </div>
              <p>{comment.content}</p>
            </div>
          ))}
          <form onSubmit={handleCommentSubmit} className="mt-6">
            <textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Add a comment..."
              className="w-full p-3 border rounded"
              rows="4"
              required
            />
            <button
              type="submit"
              className="mt-2 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
            >
              Post Comment
            </button>
          </form>
        </div>
      </article>
    </div>
  );
};

export default PostDetail;