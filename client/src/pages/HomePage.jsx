import { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import useBlogs from '../hooks/useBlogs';
import usePagination from '../hooks/usePagination';
import { motion } from 'framer-motion';

const HomePage = () => {
  const { blogs, loading, error, fetchPublishedBlogs } = useBlogs();
  const { page, limit, totalPages, hasNextPage, hasPrevPage, updatePagination, goToPage, nextPage, prevPage } = usePagination(9);
  const [searchParams, setSearchParams] = useSearchParams();
  const [search, setSearch] = useState(searchParams.get('search') || '');
  const [activeTag, setActiveTag] = useState(searchParams.get('tag') || '');

  useEffect(() => {
    const params = { page, limit };
    if (search) params.search = search;
    if (activeTag) params.tag = activeTag;

    fetchPublishedBlogs(params).then((res) => {
      if (res) updatePagination(res.data.pagination);
    }).catch(() => {});
  }, [page, limit, activeTag, fetchPublishedBlogs, updatePagination]);

  const handleSearch = (e) => {
    e.preventDefault();
    const params = { page: 1, limit };
    if (search) params.search = search;
    if (activeTag) params.tag = activeTag;

    setSearchParams(search ? { search, ...(activeTag ? { tag: activeTag } : {}) } : (activeTag ? { tag: activeTag } : {}));

    fetchPublishedBlogs(params).then((res) => {
      if (res) updatePagination(res.data.pagination);
    }).catch(() => {});
  };

  const handleTagClick = (tag) => {
    const newTag = activeTag === tag ? '' : tag;
    setActiveTag(newTag);
    if (newTag) {
      setSearchParams({ ...(search ? { search } : {}), tag: newTag });
    } else {
      setSearchParams(search ? { search } : {});
    }
  };

  const allTags = [...new Set(blogs.flatMap((b) => b.tags || []))];

  return (
    <>
      <Helmet>
        <title>BlogWeb — Discover Amazing Stories</title>
        <meta name="description" content="Explore thought-provoking articles, tutorials, and stories from our community of writers." />
        <meta property="og:title" content="BlogWeb — Discover Amazing Stories" />
        <meta property="og:description" content="Explore thought-provoking articles, tutorials, and stories from our community of writers." />
      </Helmet>

      {/* Hero Section */}
      <motion.section 
        className="hero"
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
      >
        <div className="hero-bg-gradient" />
        <div className="hero-content">
          <span className="hero-badge">✦ Welcome to BlogWeb</span>
          <h1 className="hero-title">
            Where Ideas Come to <span className="gradient-text">Life</span>
          </h1>
          <p className="hero-subtitle">
            Explore thought-provoking articles, tutorials, and stories from our community of passionate writers.
          </p>

          {/* Search */}
          <form onSubmit={handleSearch} className="search-form">
            <div className="search-input-wrapper">
              <svg className="search-icon" xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="11" cy="11" r="8" />
                <path d="m21 21-4.3-4.3" />
              </svg>
              <input
                type="text"
                id="search-input"
                placeholder="Search articles..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="search-input"
              />
              <button type="submit" className="search-btn">Search</button>
            </div>
          </form>
        </div>
      </motion.section>

      {/* Tags */}
      {allTags.length > 0 && (
        <section className="tags-section">
          <div className="container">
            <div className="tags-list">
              {allTags.map((tag) => (
                <button
                  key={tag}
                  onClick={() => handleTagClick(tag)}
                  className={`tag-chip ${activeTag === tag ? 'tag-active' : ''}`}
                >
                  #{tag}
                </button>
              ))}
              {activeTag && (
                <button onClick={() => handleTagClick(activeTag)} className="tag-clear">
                  ✕ Clear filter
                </button>
              )}
            </div>
          </div>
        </section>
      )}

      {/* Blog Grid */}
      <section className="blogs-section">
        <div className="container">
          {loading ? (
            <div className="loading-grid">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="blog-card-skeleton">
                  <div className="skeleton-image" />
                  <div className="skeleton-content">
                    <div className="skeleton-line skeleton-line-sm" />
                    <div className="skeleton-line skeleton-line-lg" />
                    <div className="skeleton-line skeleton-line-md" />
                  </div>
                </div>
              ))}
            </div>
          ) : error ? (
            <div className="error-state">
              <p className="error-text">⚠ {error}</p>
            </div>
          ) : blogs.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon">📝</div>
              <h3>No posts found</h3>
              <p>Check back later or try a different search.</p>
            </div>
          ) : (
            <motion.div 
              className="blog-grid"
              initial="hidden"
              animate="show"
              variants={{
                hidden: { opacity: 0 },
                show: {
                  opacity: 1,
                  transition: { staggerChildren: 0.1 }
                }
              }}
            >
              {blogs.map((blog, index) => (
                <motion.div
                  key={blog._id}
                  variants={{
                    hidden: { opacity: 0, y: 30 },
                    show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 50 } }
                  }}
                  className={index === 0 ? 'blog-card-featured' : ''}
                >
                  <Link to={`/blog/${blog.slug}`} className="blog-card" style={{ height: '100%' }}>
                  {blog.coverImage && (
                    <div className="blog-card-image">
                      <img src={blog.coverImage} alt={blog.title} loading="lazy" />
                    </div>
                  )}
                  {!blog.coverImage && (
                    <div className="blog-card-image blog-card-image-placeholder">
                      <div className="placeholder-gradient" />
                    </div>
                  )}
                  <div className="blog-card-body">
                    <div className="blog-card-meta">
                      <span className="blog-author">
                        <span className="author-avatar">{blog.author?.name?.charAt(0)}</span>
                        {blog.author?.name}
                      </span>
                      <span className="blog-date">
                        {new Date(blog.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                      </span>
                    </div>
                    <h2 className="blog-card-title">{blog.title}</h2>
                    <p className="blog-card-excerpt">{blog.excerpt}</p>
                    <div className="blog-card-footer">
                      <div className="blog-tags">
                        {blog.tags?.slice(0, 3).map((tag) => (
                          <span key={tag} className="tag-small">#{tag}</span>
                        ))}
                      </div>
                      <span className="blog-views">👁 {blog.views}</span>
                    </div>
                  </div>
                  </Link>
                </motion.div>
              ))}
            </motion.div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="pagination">
              <button onClick={prevPage} disabled={!hasPrevPage} className="pagination-btn">
                ← Previous
              </button>
              <div className="pagination-pages">
                {[...Array(totalPages)].map((_, i) => (
                  <button
                    key={i + 1}
                    onClick={() => goToPage(i + 1)}
                    className={`pagination-page ${page === i + 1 ? 'pagination-active' : ''}`}
                  >
                    {i + 1}
                  </button>
                ))}
              </div>
              <button onClick={nextPage} disabled={!hasNextPage} className="pagination-btn">
                Next →
              </button>
            </div>
          )}
        </div>
      </section>
    </>
  );
};

export default HomePage;
