import { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import ReactQuill from 'react-quill-new';
import 'react-quill-new/dist/quill.snow.css';
import useBlogs from '../hooks/useBlogs';

const QUILL_MODULES = {
  toolbar: [
    [{ header: [1, 2, 3, 4, false] }],
    ['bold', 'italic', 'underline', 'strike'],
    [{ color: [] }, { background: [] }],
    ['blockquote', 'code-block'],
    [{ list: 'ordered' }, { list: 'bullet' }],
    [{ indent: '-1' }, { indent: '+1' }],
    ['link', 'image', 'video'],
    [{ align: [] }],
    ['clean'],
  ],
};

const QUILL_FORMATS = [
  'header', 'bold', 'italic', 'underline', 'strike',
  'color', 'background', 'blockquote', 'code-block',
  'list', 'indent', 'link', 'image', 'video', 'align',
];

const Editor = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { createBlog, updateBlog, fetchBlogForEdit, loading, error, setError } = useBlogs();
  const quillRef = useRef(null);

  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [excerpt, setExcerpt] = useState('');
  const [coverImage, setCoverImage] = useState('');
  const [tags, setTags] = useState('');
  const [status, setStatus] = useState('draft');
  const [saving, setSaving] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');

  const isEdit = Boolean(id);

  // Load existing blog for editing
  useEffect(() => {
    if (id) {
      fetchBlogForEdit(id).then((blog) => {
        if (blog) {
          setTitle(blog.title);
          setContent(blog.content);
          setExcerpt(blog.excerpt || '');
          setCoverImage(blog.coverImage || '');
          setTags(blog.tags?.join(', ') || '');
          setStatus(blog.status);
        }
      }).catch(() => {});
    }
  }, [id, fetchBlogForEdit]);

  const handleSubmit = async (publishStatus) => {
    setError(null);
    setSuccessMsg('');

    if (!title.trim()) {
      setError('Title is required');
      return;
    }
    if (content.replace(/<[^>]*>/g, '').trim().length < 50) {
      setError('Content must be at least 50 characters');
      return;
    }

    const parsedTags = tags
      .split(',')
      .map((t) => t.trim())
      .filter((t) => t)
      .slice(0, 5);

    const blogData = {
      title: title.trim(),
      content,
      excerpt: excerpt.trim() || undefined,
      coverImage: coverImage.trim() || undefined,
      tags: parsedTags,
      status: publishStatus || status,
    };

    setSaving(true);

    try {
      if (isEdit) {
        await updateBlog(id, blogData);
        setSuccessMsg('Post updated successfully!');
      } else {
        const result = await createBlog(blogData);
        setSuccessMsg('Post created successfully!');
        // Navigate to edit mode with the new ID
        setTimeout(() => {
          navigate(`/editor/${result.data.blog._id}`, { replace: true });
        }, 1000);
      }
    } catch {
      // error handled by hook
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      <Helmet>
        <title>{isEdit ? 'Edit Post' : 'Create Post'} — BlogWeb</title>
      </Helmet>

      <div className="editor-page">
        <div className="container">
          {/* Editor Header */}
          <div className="editor-header">
            <h1 className="editor-title">{isEdit ? '✏️ Edit Post' : '📝 Create New Post'}</h1>
            <div className="editor-actions">
              <button
                onClick={() => handleSubmit('draft')}
                disabled={saving}
                className="btn btn-outline"
                id="save-draft-btn"
              >
                {saving ? 'Saving...' : 'Save Draft'}
              </button>
              <button
                onClick={() => handleSubmit('published')}
                disabled={saving}
                className="btn btn-primary"
                id="publish-btn"
              >
                {saving ? 'Publishing...' : isEdit ? 'Update & Publish' : 'Publish'}
              </button>
            </div>
          </div>

          {/* Messages */}
          {error && (
            <div className="alert alert-error">
              <span>⚠</span> {error}
            </div>
          )}
          {successMsg && (
            <div className="alert alert-success">
              <span>✅</span> {successMsg}
            </div>
          )}

          {/* Editor Form */}
          <div className="editor-grid">
            <div className="editor-main">
              {/* Title */}
              <input
                type="text"
                id="editor-title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Post title..."
                className="editor-title-input"
                maxLength={120}
              />

              {/* Rich Text Editor */}
              <div className="editor-quill-wrapper">
                <ReactQuill
                  ref={quillRef}
                  theme="snow"
                  value={content}
                  onChange={setContent}
                  modules={QUILL_MODULES}
                  formats={QUILL_FORMATS}
                  placeholder="Start writing your story..."
                />
              </div>
            </div>

            {/* Sidebar */}
            <div className="editor-sidebar">
              <div className="sidebar-card">
                <h3 className="sidebar-title">Post Settings</h3>

                <div className="form-group">
                  <label htmlFor="editor-status" className="form-label">Status</label>
                  <select
                    id="editor-status"
                    value={status}
                    onChange={(e) => setStatus(e.target.value)}
                    className="form-select"
                  >
                    <option value="draft">Draft</option>
                    <option value="published">Published</option>
                  </select>
                </div>

                <div className="form-group">
                  <label htmlFor="editor-cover" className="form-label">Cover Image URL</label>
                  <input
                    id="editor-cover"
                    type="text"
                    value={coverImage}
                    onChange={(e) => setCoverImage(e.target.value)}
                    placeholder="https://example.com/image.jpg"
                    className="form-input"
                  />
                  {coverImage && (
                    <div className="cover-preview">
                      <img src={coverImage} alt="Cover preview" onError={(e) => e.target.style.display = 'none'} />
                    </div>
                  )}
                </div>

                <div className="form-group">
                  <label htmlFor="editor-excerpt" className="form-label">Excerpt</label>
                  <textarea
                    id="editor-excerpt"
                    value={excerpt}
                    onChange={(e) => setExcerpt(e.target.value)}
                    placeholder="Brief summary (auto-generated if empty)"
                    className="form-textarea"
                    rows={3}
                    maxLength={300}
                  />
                  <span className="char-count">{excerpt.length}/300</span>
                </div>

                <div className="form-group">
                  <label htmlFor="editor-tags" className="form-label">Tags</label>
                  <input
                    id="editor-tags"
                    type="text"
                    value={tags}
                    onChange={(e) => setTags(e.target.value)}
                    placeholder="react, javascript, web (comma separated)"
                    className="form-input"
                  />
                  <span className="form-hint">Up to 5 tags, comma separated</span>
                </div>
              </div>

              <button onClick={() => navigate('/dashboard')} className="btn btn-ghost btn-full" style={{ marginTop: '1rem' }}>
                ← Back to Dashboard
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Editor;
