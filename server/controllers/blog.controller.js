const Blog = require('../models/Blog.model');
const AppError = require('../utils/AppError');
const asyncHandler = require('../utils/asyncHandler');

// ────────────────────────────────────────────────────────────────────────
// GET /api/blogs — Public: list published blogs (paginated, searchable)
// ────────────────────────────────────────────────────────────────────────
const getPublishedBlogs = asyncHandler(async (req, res) => {
  const page = Math.max(1, parseInt(req.query.page, 10) || 1);
  const limit = Math.min(50, Math.max(1, parseInt(req.query.limit, 10) || 10));
  const skip = (page - 1) * limit;

  // Build filter
  const filter = { status: 'published' };

  // Tag filter
  if (req.query.tag) {
    filter.tags = req.query.tag.toLowerCase().trim();
  }

  // Search filter (text search on title + content)
  if (req.query.search) {
    filter.$text = { $search: req.query.search };
  }

  const [blogs, total] = await Promise.all([
    Blog.find(filter)
      .populate('author', 'name email')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean(),
    Blog.countDocuments(filter),
  ]);

  res.status(200).json({
    success: true,
    data: {
      blogs,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    },
    message: 'Blogs retrieved successfully.',
  });
});

// ────────────────────────────────────────────────────────────────────────
// GET /api/blogs/:slug — Public: single published blog (increments views)
// ────────────────────────────────────────────────────────────────────────
const getBlogBySlug = asyncHandler(async (req, res) => {
  const blog = await Blog.findOneAndUpdate(
    { slug: req.params.slug, status: 'published' },
    { $inc: { views: 1 } },
    { new: true }
  )
    .populate('author', 'name email')
    .lean();

  if (!blog) {
    throw new AppError('Blog post not found.', 404);
  }

  res.status(200).json({
    success: true,
    data: { blog },
    message: 'Blog retrieved successfully.',
  });
});

// ────────────────────────────────────────────────────────────────────────
// POST /api/blogs — Protected: create blog
// ────────────────────────────────────────────────────────────────────────
const createBlog = asyncHandler(async (req, res) => {
  const { title, content, excerpt, coverImage, tags, status } = req.body;

  const blog = await Blog.create({
    title,
    content,
    excerpt,
    coverImage,
    tags: tags || [],
    status: status || 'draft',
    author: req.user._id,
  });

  // Populate author for response
  await blog.populate('author', 'name email');

  res.status(201).json({
    success: true,
    data: { blog },
    message: 'Blog created successfully.',
  });
});

// ────────────────────────────────────────────────────────────────────────
// PUT /api/blogs/:id — Protected: update blog (ownership or admin)
// ────────────────────────────────────────────────────────────────────────
const updateBlog = asyncHandler(async (req, res) => {
  let blog = await Blog.findById(req.params.id);

  if (!blog) {
    throw new AppError('Blog post not found.', 404);
  }

  // Ownership check: only author or admin can update
  if (blog.author.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
    throw new AppError('You are not authorized to update this post.', 403);
  }

  const { title, content, excerpt, coverImage, tags, status } = req.body;

  // Update fields selectively
  if (title !== undefined) blog.title = title;
  if (content !== undefined) blog.content = content;
  if (excerpt !== undefined) blog.excerpt = excerpt;
  if (coverImage !== undefined) blog.coverImage = coverImage;
  if (tags !== undefined) blog.tags = tags;
  if (status !== undefined) blog.status = status;

  await blog.save();
  await blog.populate('author', 'name email');

  res.status(200).json({
    success: true,
    data: { blog },
    message: 'Blog updated successfully.',
  });
});

// ────────────────────────────────────────────────────────────────────────
// DELETE /api/blogs/:id — Protected: delete blog (ownership or admin)
// ────────────────────────────────────────────────────────────────────────
const deleteBlog = asyncHandler(async (req, res) => {
  const blog = await Blog.findById(req.params.id);

  if (!blog) {
    throw new AppError('Blog post not found.', 404);
  }

  // Ownership check
  if (blog.author.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
    throw new AppError('You are not authorized to delete this post.', 403);
  }

  await Blog.findByIdAndDelete(req.params.id);

  res.status(200).json({
    success: true,
    data: null,
    message: 'Blog deleted successfully.',
  });
});

// ────────────────────────────────────────────────────────────────────────
// GET /api/blogs/my/posts — Protected: current user's blogs
// ────────────────────────────────────────────────────────────────────────
const getMyBlogs = asyncHandler(async (req, res) => {
  const page = Math.max(1, parseInt(req.query.page, 10) || 1);
  const limit = Math.min(50, Math.max(1, parseInt(req.query.limit, 10) || 10));
  const skip = (page - 1) * limit;

  const filter = { author: req.user._id };

  if (req.query.status) {
    filter.status = req.query.status;
  }

  const [blogs, total] = await Promise.all([
    Blog.find(filter)
      .populate('author', 'name email')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean(),
    Blog.countDocuments(filter),
  ]);

  res.status(200).json({
    success: true,
    data: {
      blogs,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    },
    message: 'Your blogs retrieved successfully.',
  });
});

// ────────────────────────────────────────────────────────────────────────
// GET /api/admin/blogs — Admin: all blogs, all statuses
// ────────────────────────────────────────────────────────────────────────
const adminGetAllBlogs = asyncHandler(async (req, res) => {
  const page = Math.max(1, parseInt(req.query.page, 10) || 1);
  const limit = Math.min(50, Math.max(1, parseInt(req.query.limit, 10) || 10));
  const skip = (page - 1) * limit;

  const filter = {};

  if (req.query.status) {
    filter.status = req.query.status;
  }

  if (req.query.search) {
    filter.$text = { $search: req.query.search };
  }

  const [blogs, total] = await Promise.all([
    Blog.find(filter)
      .populate('author', 'name email')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean(),
    Blog.countDocuments(filter),
  ]);

  res.status(200).json({
    success: true,
    data: {
      blogs,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    },
    message: 'All blogs retrieved successfully.',
  });
});

// ────────────────────────────────────────────────────────────────────────
// GET /api/blogs/:id/edit — Protected: get blog for editing (by ID)
// ────────────────────────────────────────────────────────────────────────
const getBlogForEdit = asyncHandler(async (req, res) => {
  const blog = await Blog.findById(req.params.id).populate('author', 'name email');

  if (!blog) {
    throw new AppError('Blog post not found.', 404);
  }

  // Ownership check
  if (blog.author._id.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
    throw new AppError('You are not authorized to edit this post.', 403);
  }

  res.status(200).json({
    success: true,
    data: { blog },
    message: 'Blog retrieved for editing.',
  });
});

module.exports = {
  getPublishedBlogs,
  getBlogBySlug,
  createBlog,
  updateBlog,
  deleteBlog,
  getMyBlogs,
  adminGetAllBlogs,
  getBlogForEdit,
};
