require('dotenv').config({ path: require('path').resolve(__dirname, '../../.env') });
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('../models/User.model');
const Blog = require('../models/Blog.model');

// Mock Authors Data
const authors = [
  {
    name: 'Jane Doe',
    email: 'jane@example.com',
    password: 'password123',
    role: 'user',
    bio: 'Tech enthusiast and software engineer. Writing about web development and AI.',
  },
  {
    name: 'John Smith',
    email: 'john@example.com',
    password: 'password123',
    role: 'user',
    bio: 'Digital nomad and lifestyle blogger sharing stories from around the globe.',
  },
  {
    name: 'Alice Johnson',
    email: 'alice@example.com',
    password: 'password123',
    role: 'user',
    bio: 'Product designer focusing on user experience, UI trends, and typography.',
  },
];

// Mock Blogs Data
const blogs = [
  {
    title: 'The Future of Web Development in 2026',
    content: '<p>Web development is evolving faster than ever. In this post, we explore how AI-driven tools, edge computing, and new rendering paradigms are shaping the future of the frontend ecosystem. We will dive deep into React 19, Server Components, and the rise of autonomous coding agents.</p><h2>The Rise of AI Agents</h2><p>AI is no longer just a copilot; it is becoming an active participant in building our web applications...</p>',
    coverImage: 'https://images.unsplash.com/photo-1498050108023-c5249f4df085?auto=format&fit=crop&w=800&q=80',
    tags: ['tech', 'web', 'future'],
    status: 'published',
  },
  {
    title: 'Minimalism in UI Design',
    content: '<p>Minimalism is more than just white space. It is about intentionality. When designing modern interfaces, removing the non-essential allows the content to breathe. By utilizing carefully selected typography and high-contrast elements, designers can guide the user’s focus exactly where it needs to be.</p><h3>Typography as the Hero</h3><p>In the absence of complex graphical elements, typography takes the center stage...</p>',
    coverImage: 'https://images.unsplash.com/photo-1561070791-2526d30994b5?auto=format&fit=crop&w=800&q=80',
    tags: ['design', 'ui', 'minimalism'],
    status: 'published',
  },
  {
    title: 'A Guide to Digital Nomad Life in Bali',
    content: '<p>Bali has long been the mecca for digital nomads. With its vibrant culture, lush landscapes, and excellent coffee shops with reliable Wi-Fi, it offers the perfect blend of work and play. In this guide, I share my favorite spots in Canggu and Ubud, along with tips for maintaining a productive routine.</p>',
    coverImage: 'https://images.unsplash.com/photo-1537996194471-e657df975ab4?auto=format&fit=crop&w=800&q=80',
    tags: ['lifestyle', 'travel', 'nomad'],
    status: 'published',
  },
  {
    title: 'Mastering Framer Motion in React',
    content: '<p>Animations can turn a good website into a great one. Framer Motion is the standard for React animations. In this tutorial, we cover everything from simple hover effects to complex staggered list animations and layout transitions.</p><pre><code>import { motion } from "framer-motion";\n\n<motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} /></code></pre><p>Let’s get started by exploring the spring physics behind the scenes.</p>',
    coverImage: 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?auto=format&fit=crop&w=800&q=80',
    tags: ['tech', 'react', 'animation'],
    status: 'published',
  },
  {
    title: 'The Psychology of Color in Branding',
    content: '<p>Why do so many tech companies use blue? Why are fast-food logos often red and yellow? Color psychology plays a massive role in consumer behavior. Understanding how different hues impact mood and perception is crucial for any brand identity project.</p>',
    coverImage: 'https://images.unsplash.com/photo-1507608616759-54f48f0af0ee?auto=format&fit=crop&w=800&q=80',
    tags: ['design', 'branding', 'color'],
    status: 'published',
  },
  {
    title: '10 Must-Have Gadgets for Remote Workers',
    content: '<p>Working from home requires the right setup. From ergonomic chairs to noise-canceling headphones and the perfect mechanical keyboard, here are ten gadgets that have completely transformed my remote work experience.</p>',
    coverImage: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?auto=format&fit=crop&w=800&q=80',
    tags: ['tech', 'remote', 'gear'],
    status: 'published',
  },
  {
    title: 'How to brew the perfect V60 Pour Over',
    content: '<p>Coffee brewing is both an art and a science. The Hario V60 offers unparalleled clarity in the cup, highlighting the delicate floral and fruity notes of light-roasted specialty coffee. Here is my exact recipe, including grind size, water temperature, and pouring technique.</p>',
    coverImage: 'https://images.unsplash.com/photo-1497935586351-b67a49e012bf?auto=format&fit=crop&w=800&q=80',
    tags: ['lifestyle', 'coffee'],
    status: 'published',
  },
  {
    title: 'Demystifying Glassmorphism',
    content: '<p>Glassmorphism took the design world by storm and shows no signs of leaving. It relies on the <code>backdrop-filter: blur()</code> CSS property to create a frosted glass effect. In this article, I will show you how to layer backgrounds and semi-transparent panels to achieve this premium look.</p>',
    coverImage: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=800&q=80',
    tags: ['design', 'css', 'trends'],
    status: 'published',
  },
  {
    title: 'Building Scalable APIs with Node.js',
    content: '<p>Node.js is incredibly fast, but building a scalable backend requires proper architecture. We will look at MVC patterns, dependency injection, and how to effectively use caching and message queues to handle millions of requests.</p>',
    coverImage: 'https://images.unsplash.com/photo-1526040652367-600053ae7b6b?auto=format&fit=crop&w=800&q=80',
    tags: ['tech', 'nodejs', 'backend'],
    status: 'published',
  },
];

const seedDatabase = async () => {
  try {
    if (!process.env.MONGO_URI) {
      throw new Error("MONGO_URI is missing in .env");
    }

    console.log("Connecting to MongoDB...");
    await mongoose.connect(process.env.MONGO_URI);
    console.log("✅ Connected.");

    // Delete existing records
    console.log("Clearing existing data...");
    await Blog.deleteMany();
    await User.deleteMany();

    // Create Authors
    console.log("Creating authors...");
    const createdAuthors = [];
    for (const authorData of authors) {
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(authorData.password, salt);
      const user = await User.create({ ...authorData, password: hashedPassword });
      createdAuthors.push(user);
    }

    // Map Blogs to Authors (randomly assign)
    console.log("Creating blogs...");
    const blogsWithAuthors = blogs.map((blog, index) => {
      // 0, 3, 6 -> Jane (Tech), 1, 4, 7 -> Alice (Design), 2, 5, 8 -> John (Lifestyle)
      let authorIndex = index % 3; 
      if (blog.tags.includes('design')) authorIndex = 2; // Alice
      if (blog.tags.includes('lifestyle')) authorIndex = 1; // John
      if (blog.tags.includes('tech')) authorIndex = 0; // Jane

      return {
        ...blog,
        coverImage: `https://picsum.photos/seed/blog${index}/800/400`,
        author: createdAuthors[authorIndex]._id,
        views: Math.floor(Math.random() * 500) + 10,
      };
    });

    for (const blog of blogsWithAuthors) {
      await Blog.create(blog);
    }

    console.log("✅ Database seeded successfully!");
    process.exit(0);
  } catch (error) {
    console.error("❌ Seeding error:", error);
    process.exit(1);
  }
};

seedDatabase();
