import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { useAuth } from '../context/AuthContext';
import useBlogs from '../hooks/useBlogs';
import usePagination from '../hooks/usePagination';

const Dashboard = () => {
  const { user } = useAuth();
  const { blogs, loading, error, fetchMyBlogs, deleteBlog } = useBlogs();
  const { page, limit, totalPages, hasNextPage, hasPrevPage, updatePagination, goToPage, nextPage, prevPage } = usePagination(10);
  const [statusFilter, setStatusFilter] = useState('');
  const [deleteConfirm, setDeleteConfirm] = useState(null);

  useEffect(() => {
    const params = { page, limit };
    if (statusFilter) params.status = statusFilter;

    fetchMyBlogs(params).then((res) => {
      if (res) updatePagination(res.data.pagination);
    }).catch(() => {});
  }, [page, limit, statusFilter, fetchMyBlogs, updatePagination]);

  const handleDelete = async (id) => {
    try {
      await deleteBlog(id);
      setDeleteConfirm(null);
    } catch {
      // error handled by hook
    }
  };

  return (
    <>
      <Helmet>
        <title>Dashboard — BlogWeb</title>
      </Helmet>

      <div className="dashboard">
        <div className="container">
          {/* Dashboard Header */}
          <div className="dashboard-header">
            <div>
              <h1 className="dashboard-title">Welcome back, {user?.name} 👋</h1>
              <p className="dashboard-subtitle">Manage your blog posts</p>
            </div>
            <Link to="/editor" className="btn btn-primary">
              <span>+</span> New Post
            </Link>
          </div>

          {/* Filters */}
          <div className="dashboard-filters">
            <button
              onClick={() => setStatusFilter('')}
              className={`filter-btn ${statusFilter === '' ? 'filter-active' : ''}`}
            >
              All
            </button>
            <button
              onClick={() => setStatusFilter('published')}
              className={`filter-btn ${statusFilter === 'published' ? 'filter-active' : ''}`}
            >
              Published
            </button>
            <button
              onClick={() => setStatusFilter('draft')}
              className={`filter-btn ${statusFilter === 'draft' ? 'filter-active' : ''}`}
            >
              Drafts
            </button>
          </div>

          {/* Posts Table */}
          {loading ? (
            <div className="table-skeleton">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="skeleton-row">
                  <div className="skeleton-line" style={{ width: '60%' }} />
                  <div className="skeleton-line skeleton-line-sm" style={{ width: '15%' }} />
                  <div className="skeleton-line skeleton-line-sm" style={{ width: '15%' }} />
                </div>
              ))}
            </div>
          ) : error ? (
            <div className="error-state">
              <p>⚠ {error}</p>
            </div>
          ) : blogs.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon">📝</div>
              <h3>No posts yet</h3>
              <p>Start writing your first blog post!</p>
              <Link to="/editor" className="btn btn-primary" style={{ marginTop: '1rem' }}>
                Create Your First Post
              </Link>
            </div>
          ) : (
            <div className="posts-table">
              <div className="table-header">
                <span className="table-col table-col-title">Title</span>
                <span className="table-col table-col-status">Status</span>
                <span className="table-col table-col-date">Date</span>
                <span className="table-col table-col-views">Views</span>
                <span className="table-col table-col-actions">Actions</span>
              </div>

              {blogs.map((blog) => (
                <div key={blog._id} className="table-row">
                  <div className="table-col table-col-title">
                    <Link to={blog.status === 'published' ? `/blog/${blog.slug}` : '#'} className="post-title-link">
                      {blog.title}
                    </Link>
                    <div className="post-tags-mini">
                      {blog.tags?.slice(0, 3).map((t) => (
                        <span key={t} className="tag-tiny">#{t}</span>
                      ))}
                    </div>
                  </div>
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
                    <Link to={`/editor/${blog._id}`} className="action-btn action-edit" title="Edit">
                      ✏️
                    </Link>
                    {deleteConfirm === blog._id ? (
                      <div className="delete-confirm">
                        <button onClick={() => handleDelete(blog._id)} className="action-btn action-delete-confirm">Yes</button>
                        <button onClick={() => setDeleteConfirm(null)} className="action-btn action-cancel">No</button>
                      </div>
                    ) : (
                      <button onClick={() => setDeleteConfirm(blog._id)} className="action-btn action-delete" title="Delete">
                        🗑️
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Pagination */}
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

export default Dashboard;
