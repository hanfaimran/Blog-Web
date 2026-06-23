import { useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import useBlogs from '../hooks/useBlogs';

const BlogPost = () => {
  const { slug } = useParams();
  const { blog, loading, error, fetchBlogBySlug } = useBlogs();

  useEffect(() => {
    if (slug) {
      fetchBlogBySlug(slug).catch(() => {});
    }
  }, [slug, fetchBlogBySlug]);

  if (loading) {
    return (
      <div className="blog-post-skeleton">
        <div className="container-narrow">
          <div className="skeleton-line skeleton-line-sm" style={{ width: '30%' }} />
          <div className="skeleton-line skeleton-line-xl" style={{ marginTop: '1rem' }} />
          <div className="skeleton-line skeleton-line-lg" />
          <div className="skeleton-block" style={{ height: '400px', marginTop: '2rem' }} />
          <div className="skeleton-lines-group">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="skeleton-line" style={{ width: `${Math.random() * 40 + 60}%` }} />
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="error-page">
        <div className="error-icon">😢</div>
        <h2>Post Not Found</h2>
        <p>{error}</p>
        <Link to="/" className="btn btn-primary">← Back to Home</Link>
      </div>
    );
  }

  if (!blog) return null;

  return (
    <>
      <Helmet>
        <title>{blog.title} — BlogWeb</title>
        <meta name="description" content={blog.excerpt} />
        <meta property="og:title" content={blog.title} />
        <meta property="og:description" content={blog.excerpt} />
        {blog.coverImage && <meta property="og:image" content={blog.coverImage} />}
        <meta property="og:type" content="article" />
      </Helmet>

      <article className="blog-post">
        <div className="container-narrow">
          {/* Breadcrumb */}
          <div className="breadcrumb">
            <Link to="/">Home</Link>
            <span className="breadcrumb-sep">/</span>
            <span>{blog.title}</span>
          </div>

          {/* Header */}
          <header className="blog-post-header">
            <div className="blog-post-tags">
              {blog.tags?.map((tag) => (
                <Link key={tag} to={`/?tag=${tag}`} className="tag-chip tag-chip-sm">#{tag}</Link>
              ))}
            </div>
            <h1 className="blog-post-title">{blog.title}</h1>
            <div className="blog-post-meta">
              <div className="blog-post-author">
                <div className="author-avatar-lg">
                  {blog.author?.name?.charAt(0).toUpperCase()}
                </div>
                <div className="author-info">
                  <span className="author-name">{blog.author?.name}</span>
                  <span className="post-date">
                    {new Date(blog.createdAt).toLocaleDateString('en-US', {
                      month: 'long',
                      day: 'numeric',
                      year: 'numeric',
                    })}
                    <span className="dot-sep">·</span>
                    {blog.views} views
                  </span>
                </div>
              </div>
            </div>
          </header>

          {/* Cover Image */}
          {blog.coverImage && (
            <div className="blog-post-cover">
              <img src={blog.coverImage} alt={blog.title} />
            </div>
          )}

          {/* Content */}
          <div
            className="blog-post-content prose"
            dangerouslySetInnerHTML={{ __html: blog.content }}
          />

          {/* Footer */}
          <div className="blog-post-footer">
            <Link to="/" className="btn btn-outline">
              ← Back to all posts
            </Link>
          </div>
        </div>
      </article>
    </>
  );
};

export default BlogPost;
