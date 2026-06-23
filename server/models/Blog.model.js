const mongoose = require('mongoose');
const sanitizeHtml = require('sanitize-html');
const { slugify, generateSuffix } = require('../utils/slugify');

const blogSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Title is required'],
      trim: true,
      minlength: [3, 'Title must be at least 3 characters'],
      maxlength: [120, 'Title cannot exceed 120 characters'],
    },
    slug: {
      type: String,
      unique: true,
      index: true,
    },
    content: {
      type: String,
      required: [true, 'Content is required'],
      minlength: [50, 'Content must be at least 50 characters'],
    },
    excerpt: {
      type: String,
      maxlength: [300, 'Excerpt cannot exceed 300 characters'],
    },
    coverImage: {
      type: String,
      default: '',
    },
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Author is required'],
    },
    tags: {
      type: [String],
      validate: {
        validator: (arr) => arr.length <= 5,
        message: 'A post can have at most 5 tags',
      },
      set: (tags) => tags.map((t) => t.toLowerCase().trim()),
    },
    status: {
      type: String,
      enum: {
        values: ['draft', 'published'],
        message: 'Status must be either draft or published',
      },
      default: 'draft',
    },
    views: {
      type: Number,
      default: 0,
      min: 0,
    },
  },
  {
    timestamps: true,
  }
);

// ── Indexes ────────────────────────────────────────────────────────────
blogSchema.index({ tags: 1 });
blogSchema.index({ status: 1, createdAt: -1 });
blogSchema.index({ author: 1 });
blogSchema.index({ title: 'text', content: 'text' });

// ── Pre-save: Generate slug + sanitize HTML content ───────────────────
blogSchema.pre('save', async function (next) {
  // Generate slug from title if title changed or doc is new
  if (this.isModified('title') || this.isNew) {
    let baseSlug = slugify(this.title);

    // Check for existing slug and append suffix if collision
    const existingBlog = await mongoose.model('Blog').findOne({ slug: baseSlug, _id: { $ne: this._id } });
    if (existingBlog) {
      baseSlug = `${baseSlug}-${generateSuffix()}`;
    }
    this.slug = baseSlug;
  }

  // Sanitize HTML content
  if (this.isModified('content')) {
    this.content = sanitizeHtml(this.content, {
      allowedTags: sanitizeHtml.defaults.allowedTags.concat([
        'img', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
        'figure', 'figcaption', 'video', 'source',
        'iframe', 'pre', 'code', 'span', 'div',
      ]),
      allowedAttributes: {
        ...sanitizeHtml.defaults.allowedAttributes,
        img: ['src', 'alt', 'title', 'width', 'height', 'loading'],
        a: ['href', 'name', 'target', 'rel'],
        iframe: ['src', 'width', 'height', 'frameborder', 'allowfullscreen'],
        span: ['class', 'style'],
        div: ['class', 'style'],
        code: ['class'],
        pre: ['class'],
      },
      allowedSchemes: ['http', 'https', 'mailto'],
    });
  }

  // Auto-generate excerpt from content if not provided
  if (this.isModified('content') && !this.excerpt) {
    const plainText = sanitizeHtml(this.content, {
      allowedTags: [],
      allowedAttributes: {},
    });
    this.excerpt = plainText.substring(0, 200).trim() + (plainText.length > 200 ? '…' : '');
  }

  next();
});

// ── Remove __v from JSON output ───────────────────────────────────────
blogSchema.methods.toJSON = function () {
  const obj = this.toObject();
  delete obj.__v;
  return obj;
};

const Blog = mongoose.model('Blog', blogSchema);

module.exports = Blog;
