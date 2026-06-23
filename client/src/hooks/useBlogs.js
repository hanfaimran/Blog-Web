import { useState, useCallback } from 'react';
import API from '../utils/axios';

/**
 * Custom hook for blog CRUD operations.
 */
const useBlogs = () => {
  const [blogs, setBlogs] = useState([]);
  const [blog, setBlog] = useState(null);
  const [pagination, setPagination] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // ── Fetch published blogs (public) ────────────────────────────────
  const fetchPublishedBlogs = useCallback(async (params = {}) => {
    setLoading(true);
    setError(null);
    try {
      const res = await API.get('/blogs', { params });
      setBlogs(res.data.data.blogs);
      setPagination(res.data.data.pagination);
      return res.data;
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to fetch blogs');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // ── Fetch single blog by slug (public) ────────────────────────────
  const fetchBlogBySlug = useCallback(async (slug) => {
    setLoading(true);
    setError(null);
    try {
      const res = await API.get(`/blogs/slug/${slug}`);
      setBlog(res.data.data.blog);
      return res.data.data.blog;
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to fetch blog');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // ── Fetch current user's blogs ────────────────────────────────────
  const fetchMyBlogs = useCallback(async (params = {}) => {
    setLoading(true);
    setError(null);
    try {
      const res = await API.get('/blogs/my/posts', { params });
      setBlogs(res.data.data.blogs);
      setPagination(res.data.data.pagination);
      return res.data;
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to fetch your blogs');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // ── Fetch blog for editing (by ID) ────────────────────────────────
  const fetchBlogForEdit = useCallback(async (id) => {
    setLoading(true);
    setError(null);
    try {
      const res = await API.get(`/blogs/${id}/edit`);
      setBlog(res.data.data.blog);
      return res.data.data.blog;
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to fetch blog');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // ── Create blog ───────────────────────────────────────────────────
  const createBlog = useCallback(async (blogData) => {
    setLoading(true);
    setError(null);
    try {
      const res = await API.post('/blogs', blogData);
      return res.data;
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to create blog');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // ── Update blog ───────────────────────────────────────────────────
  const updateBlog = useCallback(async (id, blogData) => {
    setLoading(true);
    setError(null);
    try {
      const res = await API.put(`/blogs/${id}`, blogData);
      return res.data;
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to update blog');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // ── Delete blog ───────────────────────────────────────────────────
  const deleteBlog = useCallback(async (id) => {
    setLoading(true);
    setError(null);
    try {
      const res = await API.delete(`/blogs/${id}`);
      setBlogs((prev) => prev.filter((b) => b._id !== id));
      return res.data;
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to delete blog');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // ── Admin: fetch all blogs ────────────────────────────────────────
  const fetchAllBlogs = useCallback(async (params = {}) => {
    setLoading(true);
    setError(null);
    try {
      const res = await API.get('/blogs/admin/all', { params });
      setBlogs(res.data.data.blogs);
      setPagination(res.data.data.pagination);
      return res.data;
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to fetch all blogs');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    blogs,
    blog,
    pagination,
    loading,
    error,
    fetchPublishedBlogs,
    fetchBlogBySlug,
    fetchMyBlogs,
    fetchBlogForEdit,
    createBlog,
    updateBlog,
    deleteBlog,
    fetchAllBlogs,
    setError,
  };
};

export default useBlogs;
