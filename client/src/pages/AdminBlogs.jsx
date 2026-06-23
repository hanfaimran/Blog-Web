import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import useBlogs from '../hooks/useBlogs';
import usePagination from '../hooks/usePagination';

const AdminBlogs = () => {
  const { blogs, loading, error, fetchAllBlogs, deleteBlog } = useBlogs();
  const { page, limit, totalPages, hasNextPage, hasPrevPage, updatePagination, goToPage, nextPage, prevPage } = usePagination(15);
  const [statusFilter, setStatusFilter] = useState('');
  const [search, setSearch] = useState('');
  const [deleteConfirm, setDeleteConfirm] = useState(null);

  useEffect(() => {
    const params = { page, limit };
    if (statusFilter) params.status = statusFilter;
    if (search) params.search = search;

    fetchAllBlogs(params).then((res) => {
      if (res) updatePagination(res.data.pagination);
    }).catch(() => {});
  }, [page, limit, statusFilter, fetchAllBlogs, updatePagination]);

  const handleSearch = (e) => {
    e.preventDefault();
    const params = { page: 1, limit };
    if (statusFilter) params.status = statusFilter;
    if (search) params.search = search;

    fetchAllBlogs(params).then((res) => {
      if (res) updatePagination(res.data.pagination);
    }).catch(() => {});
  };

  const handleDelete = async (id) => {
    try {
      await deleteBlog(id);
      setDeleteConfirm(null);
    } catch {
      // error handled
    }
  };

  return (
    <>
      <Helmet>
        <title>Admin — All Posts — BlogWeb</title>
      </Helmet>

      <div className="admin-page">
        <div className="container">
          <div className="admin-header">
            <div>
              <h1 className="admin-title">🛡️ All Blog Posts</h1>
              <p className="admin-subtitle">Manage all posts across the platform</p>
            </div>
          </div>

          {/* Controls */}
          <div className="admin-controls">
            <form onSubmit={handleSearch} className="admin-search">
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search posts..."
                className="form-input"
                id="admin-search-input"
              />
              <button type="submit" className="btn btn-primary btn-sm">Search</button>
            </form>
            <div className="dashboard-filters">
              {['', 'published', 'draft'].map((s) => (
                <button key={s} onClick={() => setStatusFilter(s)} className={`filter-btn ${statusFilter === s ? 'filter-active' : ''}`}>
                  {s || 'All'}
                </button>
              ))}
            </div>
          </div>

          {/* Table */}
          {loading ? (
            <div className="table-skeleton">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="skeleton-row">
                  <div className="skeleton-line" style={{ width: '50%' }} />
                  <div className="skeleton-line skeleton-line-sm" style={{ width: '15%' }} />
                  <div className="skeleton-line skeleton-line-sm" style={{ width: '15%' }} />
                  <div className="skeleton-line skeleton-line-sm" style={{ width: '10%' }} />
                </div>
              ))}
            </div>
          ) : error ? (
            <div className="error-state"><p>⚠ {error}</p></div>
          ) : blogs.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon">📭</div>
              <h3>No posts found</h3>
            </div>
          ) : (
            <div className="posts-table">
              <div className="table-header">
                <span className="table-col table-col-title">Title</span>
                <span className="table-col table-col-author">Author</span>
                <span className="table-col table-col-status">Status</span>
                <span className="table-col table-col-date">Date</span>
                <span className="table-col table-col-views">Views</span>
                <span className="table-col table-col-actions">Actions</span>
              </div>

              {blogs.map((blog) => (
                <div key={blog._id} className="table-row">
                  <div className="table-col table-col-title">
                    <span className="post-title-link">{blog.title}</span>
                  </div>
                  <span className="table-col table-col-author">
                    <span className="author-avatar-sm">{blog.author?.name?.charAt(0)}</span>
                    {blog.author?.name}
                  </span>
                  <span className="table-col table-col-status">
                    <span className={`status-badge ${blog.status === 'published' ? 'status-published' : 'status-draft'}`}>
                      {blog.status}
                    </span>
                  </span>
                  <span className="table-col table-col-date">
                    {new Date(blog.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                  </span>
                  <span className="table-col table-col-views">{blog.views}</span>
                  <div className="table-col table-col-actions">
                    <Link to={`/editor/${blog._id}`} className="action-btn action-edit" title="Edit">✏️</Link>
                    {deleteConfirm === blog._id ? (
                      <div className="delete-confirm">
                        <button onClick={() => handleDelete(blog._id)} className="action-btn action-delete-confirm">Yes</button>
                        <button onClick={() => setDeleteConfirm(null)} className="action-btn action-cancel">No</button>
                      </div>
                    ) : (
                      <button onClick={() => setDeleteConfirm(blog._id)} className="action-btn action-delete" title="Delete">🗑️</button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}

          {totalPages > 1 && (
            <div className="pagination">
              <button onClick={prevPage} disabled={!hasPrevPage} className="pagination-btn">← Previous</button>
              <div className="pagination-pages">
                {[...Array(totalPages)].map((_, i) => (
                  <button key={i + 1} onClick={() => goToPage(i + 1)} className={`pagination-page ${page === i + 1 ? 'pagination-active' : ''}`}>
                    {i + 1}
                  </button>
                ))}
              </div>
              <button onClick={nextPage} disabled={!hasNextPage} className="pagination-btn">Next →</button>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default AdminBlogs;
