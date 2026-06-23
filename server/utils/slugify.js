const crypto = require('crypto');

/**
 * Converts a string into a URL-friendly slug.
 *  - Lowercases the string
 *  - Replaces non-alphanumeric characters (except hyphens) with hyphens
 *  - Collapses multiple consecutive hyphens
 *  - Trims leading/trailing hyphens
 *
 * @param {string} text - The text to slugify (typically a blog title).
 * @returns {string} A clean, URL-safe slug.
 */
const slugify = (text) => {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')   // Remove special chars (keep word chars, spaces, hyphens)
    .replace(/[\s_]+/g, '-')    // Replace spaces & underscores with hyphens
    .replace(/-+/g, '-')        // Collapse multiple hyphens
    .replace(/^-+|-+$/g, '');   // Trim leading/trailing hyphens
};

/**
 * Generates a short random suffix (8 hex chars) to ensure slug uniqueness.
 * Uses Node's built-in crypto module — no external dependency needed.
 *
 * @returns {string} 8-character hexadecimal string.
 */
const generateSuffix = () => {
  return crypto.randomBytes(4).toString('hex');
};

module.exports = { slugify, generateSuffix };
