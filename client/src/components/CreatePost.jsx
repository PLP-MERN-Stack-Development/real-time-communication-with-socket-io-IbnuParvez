import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { postService, categoryService } from '../services/api';

const CreatePost = () => {
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    category: '',
    tags: '',
    isPublished: false
  });
  const [featuredImage, setFeaturedImage] = useState(null);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await categoryService.getAllCategories();
        setCategories(response.data);
      } catch (err) {
        setError('Failed to load categories');
      }
    };

    fetchCategories();
  }, []);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleImageChange = (e) => {
    setFeaturedImage(e.target.files[0]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const submitData = new FormData();
      Object.keys(formData).forEach(key => {
        if (key === 'tags') {
          submitData.append(key, JSON.stringify(formData[key].split(',').map(tag => tag.trim())));
        } else {
          submitData.append(key, formData[key]);
        }
      });

      if (featuredImage) {
        submitData.append('featuredImage', featuredImage);
      }

      await postService.createPost(submitData);
      navigate('/');
    } catch (err) {
      setError('Failed to create post');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-3xl font-bold mb-8">Create New Post</h1>
      <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-md p-6">
        {error && <div className="text-red-500 mb-4">{error}</div>}

        <div className="mb-4">
          <label className="block text-gray-700 mb-2">Title</label>
          <input
            type="text"
            name="title"
            value={formData.title}
            onChange={handleChange}
            className="w-full p-3 border rounded"
            required
          />
        </div>

        <div className="mb-4">
          <label className="block text-gray-700 mb-2">Content</label>
          <textarea
            name="content"
            value={formData.content}
            onChange={handleChange}
            className="w-full p-3 border rounded"
            rows="10"
            required
          />
        </div>

        <div className="mb-4">
          <label className="block text-gray-700 mb-2">Category</label>
          <select
            name="category"
            value={formData.category}
            onChange={handleChange}
            className="w-full p-3 border rounded"
            required
          >
            <option value="">Select a category</option>
            {categories.map(category => (
              <option key={category._id} value={category._id}>
                {category.name}
              </option>
            ))}
          </select>
        </div>

        <div className="mb-4">
          <label className="block text-gray-700 mb-2">Tags (comma separated)</label>
          <input
            type="text"
            name="tags"
            value={formData.tags}
            onChange={handleChange}
            className="w-full p-3 border rounded"
            placeholder="javascript, react, tutorial"
          />
        </div>

        <div className="mb-4">
          <label className="block text-gray-700 mb-2">Featured Image</label>
          <input
            type="file"
            accept="image/*"
            onChange={handleImageChange}
            className="w-full p-3 border rounded"
          />
        </div>

        <div className="mb-6">
          <label className="flex items-center">
            <input
              type="checkbox"
              name="isPublished"
              checked={formData.isPublished}
              onChange={handleChange}
              className="mr-2"
            />
            Publish immediately
          </label>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-blue-600 text-white py-3 rounded hover:bg-blue-700 disabled:opacity-50"
        >
          {loading ? 'Creating...' : 'Create Post'}
        </button>
      </form>
    </div>
  );
};

export default CreatePost;