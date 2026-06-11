import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
import { readDatabase, writeDatabase } from './db.js';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;
const JWT_SECRET = process.env.JWT_SECRET || 'penoft-news-portal-secret-key-12345';

// Middlewares
app.use(cors());
app.use(express.json());
app.use(morgan('dev'));

// Middleware to authorize Admin JWT
function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Bearer <token>

  if (!token) {
    return res.status(401).json({ message: 'Access token required' });
  }

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ message: 'Invalid or expired token' });
    }
    req.user = user;
    next();
  });
}

// Helper: Check and auto-publish scheduled posts
function checkScheduledPublishing(data) {
  let updated = false;
  const now = new Date();

  data.news = data.news.map(post => {
    if (post.status === 'Scheduled' && post.scheduledAt) {
      const scheduledTime = new Date(post.scheduledAt);
      if (scheduledTime <= now) {
        post.status = 'Published';
        post.publishedAt = now.toISOString();
        updated = true;
        console.log(`[Auto-Publish] Post "${post.title}" is now Published!`);
      }
    }
    return post;
  });

  if (updated) {
    writeDatabase(data);
  }
}

// ==========================================
// AUTHENTICATION ENDPOINTS
// ==========================================

// Login Admin
app.post('/api/auth/login', (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: 'Username/Email and Password are required' });
  }

  const data = readDatabase();
  const user = data.users.find(u => u.email === email || u.email.toLowerCase() === email.toLowerCase());

  if (!user) {
    return res.status(401).json({ message: 'Invalid credentials' });
  }

  const isPasswordValid = bcrypt.compareSync(password, user.password);
  if (!isPasswordValid) {
    return res.status(401).json({ message: 'Invalid credentials' });
  }

  // Create JWT Token
  const token = jwt.sign(
    { id: user.id, name: user.name, email: user.email },
    JWT_SECRET,
    { expiresIn: '24h' }
  );

  res.json({
    token,
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      bio: user.bio,
      avatar: user.avatar
    }
  });
});

// Get Profile Info
app.get('/api/auth/profile', authenticateToken, (req, res) => {
  const data = readDatabase();
  const user = data.users.find(u => u.id === req.user.id);

  if (!user) {
    return res.status(404).json({ message: 'User not found' });
  }

  res.json({
    id: user.id,
    name: user.name,
    email: user.email,
    bio: user.bio,
    avatar: user.avatar
  });
});

// Update Profile Info
app.put('/api/auth/profile', authenticateToken, (req, res) => {
  const { name, email, bio, avatar } = req.body;

  const data = readDatabase();
  const userIndex = data.users.findIndex(u => u.id === req.user.id);

  if (userIndex === -1) {
    return res.status(404).json({ message: 'User not found' });
  }

  // Check email uniqueness if email changed
  if (email && email !== data.users[userIndex].email) {
    const emailExists = data.users.some(u => u.email === email && u.id !== req.user.id);
    if (emailExists) {
      return res.status(400).json({ message: 'Email/Username already in use' });
    }
    data.users[userIndex].email = email;
  }

  if (name) data.users[userIndex].name = name;
  if (bio !== undefined) data.users[userIndex].bio = bio;
  if (avatar) data.users[userIndex].avatar = avatar;

  // Sync author details inside news posts
  const updatedUser = data.users[userIndex];
  data.news = data.news.map(post => {
    // If we have posts, sync author details
    if (post.author && post.author.name === data.users[userIndex].name) {
      post.author.name = updatedUser.name;
      post.author.avatar = updatedUser.avatar;
    }
    return post;
  });

  writeDatabase(data);

  res.json({
    id: updatedUser.id,
    name: updatedUser.name,
    email: updatedUser.email,
    bio: updatedUser.bio,
    avatar: updatedUser.avatar
  });
});

// Change Password
app.put('/api/auth/change-password', authenticateToken, (req, res) => {
  const { currentPassword, newPassword } = req.body;

  if (!currentPassword || !newPassword) {
    return res.status(400).json({ message: 'Current and new passwords are required' });
  }

  const data = readDatabase();
  const userIndex = data.users.findIndex(u => u.id === req.user.id);

  if (userIndex === -1) {
    return res.status(404).json({ message: 'User not found' });
  }

  const user = data.users[userIndex];

  // Verify current password
  const isPasswordValid = bcrypt.compareSync(currentPassword, user.password);
  if (!isPasswordValid) {
    return res.status(400).json({ message: 'Incorrect current password' });
  }

  // Hash new password
  const salt = bcrypt.genSaltSync(10);
  user.password = bcrypt.hashSync(newPassword, salt);

  writeDatabase(data);

  res.json({ message: 'Password changed successfully' });
});


// ==========================================
// NEWS CRUD ENDPOINTS
// ==========================================

// Get News Feed
app.get('/api/news', (req, res) => {
  const { category, status, q } = req.query;
  const data = readDatabase();

  // Handle scheduled release checks before serving
  checkScheduledPublishing(data);

  let result = [...data.news];

  // If request has status and is NOT Published, check if user is admin
  if (status && status !== 'Published') {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    if (!token) {
      return res.status(401).json({ message: 'Unauthorized access to news state' });
    }
    try {
      jwt.verify(token, JWT_SECRET);
      result = result.filter(post => post.status === status);
    } catch (err) {
      return res.status(403).json({ message: 'Access denied' });
    }
  } else if (!status) {
    // By default, non-admins only see Published news
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    let isAdmin = false;
    if (token) {
      try {
        jwt.verify(token, JWT_SECRET);
        isAdmin = true;
      } catch (e) { }
    }

    if (!isAdmin) {
      result = result.filter(post => post.status === 'Published');
    }
  } else {
    // Explicitly requested Published
    result = result.filter(post => post.status === 'Published');
  }

  // Filter by category
  if (category) {
    result = result.filter(post => post.category.toLowerCase() === category.toLowerCase());
  }

  // Filter by query search
  if (q) {
    const query = q.toLowerCase();
    result = result.filter(post =>
      post.title.toLowerCase().includes(query) ||
      post.content.toLowerCase().includes(query)
    );
  }

  // Sort by published date descending (or id descending for drafts)
  result.sort((a, b) => {
    const dateA = a.publishedAt ? new Date(a.publishedAt) : new Date(0);
    const dateB = b.publishedAt ? new Date(b.publishedAt) : new Date(0);
    return dateB - dateA || b.id.localeCompare(a.id);
  });

  res.json(result);
});

// Get Single News Post
app.get('/api/news/:id', (req, res) => {
  const { id } = req.params;
  const data = readDatabase();

  checkScheduledPublishing(data);

  const post = data.news.find(p => p.id === id);

  if (!post) {
    return res.status(404).json({ message: 'Article not found' });
  }

  // If not Published, authenticate that reader is admin
  if (post.status !== 'Published') {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    if (!token) {
      return res.status(401).json({ message: 'Access token required for this article' });
    }
    try {
      jwt.verify(token, JWT_SECRET);
    } catch (err) {
      return res.status(403).json({ message: 'Forbidden' });
    }
  }

  res.json(post);
});

// Create News Post
app.post('/api/news', authenticateToken, (req, res) => {
  const { title, content, category, subcategory, status, scheduledAt, image } = req.body;

  if (!title || !content || !category) {
    return res.status(400).json({ message: 'Title, content, and category are required' });
  }

  const data = readDatabase();

  // Find author profile details
  const authorUser = data.users.find(u => u.id === req.user.id) || {
    name: req.user.name,
    avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBm7pqSHIQdbp6vMe41ishb6FNfP8yPT-aVYAlcz9chiiSdd-kAcPvQ4YfQgb21ek3qnIUtdCzGYSAlY_rwgQz7b7Uj9JpHbdwSoKUWS-Csfy2m03z4E9QxHBbccSklkab_0fxs96f0JBOlsbc-WfKGgLh4iH3w1Gt9gMn4uEMOkDQdC0I40gUUmnIKOu4x_aYfsLDZXndYbfwTeTgMgCzIDrjYyNuuONPrRdikG9puV8AFoPAbGGhNEsKySqRTQ7vQfXMrqown5wyB'
  };

  // Generate unique ID
  const newId = `news-${Date.now()}`;

  // Calculate read time roughly
  const wordCount = content.trim().split(/\s+/).length;
  const readTime = Math.max(1, Math.ceil(wordCount / 200));

  const now = new Date();
  const isPublished = status === 'Published';
  const isScheduled = status === 'Scheduled';

  const newPost = {
    id: newId,
    title,
    content,
    category,
    subcategory: subcategory || '',
    status: status || 'Draft',
    publishedAt: isPublished ? now.toISOString() : '',
    scheduledAt: isScheduled ? new Date(scheduledAt).toISOString() : '',
    readTime,
    image: image || 'https://lh3.googleusercontent.com/aida-public/AB6AXuCmxNzAUCDE9nJoKdd4Uts3jxk_JEAq8cXTE2qZluLFhQLeBd7Oz52rFNtjqIDcNz48PZUSsTeweucV019l_H2vuyyXBmV0z3jbFVia-vVM12LjMKFw7aEmjxVb2hg7L6asOo0h9d12EhgwJuokTZ48bV54w5dl6GCmpO_ZmMrJnMFZOpzTXGMfX46jZfICbi46k6uhQwW9hpZm8bKuwd6vlJhEQ06QqrdyhPAGZTy6Vc9hamslPlWddPGI-lQSVKMWZ5XSrQbhHeL2',
    author: {
      name: authorUser.name,
      avatar: authorUser.avatar
    }
  };

  data.news.unshift(newPost);
  writeDatabase(data);

  res.status(201).json(newPost);
});

// Edit News Post
app.put('/api/news/:id', authenticateToken, (req, res) => {
  const { id } = req.params;
  const { title, content, category, subcategory, status, scheduledAt, image } = req.body;

  const data = readDatabase();
  const postIndex = data.news.findIndex(p => p.id === id);

  if (postIndex === -1) {
    return res.status(404).json({ message: 'Article not found' });
  }

  const existingPost = data.news[postIndex];

  // Update properties if provided
  if (title) existingPost.title = title;
  if (content) {
    existingPost.content = content;
    const wordCount = content.trim().split(/\s+/).length;
    existingPost.readTime = Math.max(1, Math.ceil(wordCount / 200));
  }
  if (category) existingPost.category = category;
  if (subcategory !== undefined) existingPost.subcategory = subcategory;
  if (image !== undefined) existingPost.image = image;

  // Handle status transitions
  if (status) {
    const now = new Date();
    if (status === 'Published' && existingPost.status !== 'Published') {
      existingPost.publishedAt = now.toISOString();
      existingPost.scheduledAt = '';
    } else if (status === 'Scheduled') {
      existingPost.scheduledAt = scheduledAt ? new Date(scheduledAt).toISOString() : '';
      existingPost.publishedAt = '';
    } else if (status === 'Draft' || status === 'In-Review') {
      existingPost.publishedAt = '';
      existingPost.scheduledAt = '';
    }
    existingPost.status = status;
  }

  data.news[postIndex] = existingPost;
  writeDatabase(data);

  res.json(existingPost);
});

// Delete News Post
app.delete('/api/news/:id', authenticateToken, (req, res) => {
  const { id } = req.params;
  const data = readDatabase();
  const postIndex = data.news.findIndex(p => p.id === id);

  if (postIndex === -1) {
    return res.status(404).json({ message: 'Article not found' });
  }

  data.news.splice(postIndex, 1);
  writeDatabase(data);

  res.json({ message: 'Article deleted successfully' });
});

// Start Server
// Serve built frontend in production (ESM compatible)
if (process.env.NODE_ENV === 'production') {
  const frontendDist = path.join(__dirname, '..', 'frontend', 'dist');
  app.use(express.static(frontendDist));
  app.get('*', (req, res) => {
    res.sendFile(path.join(frontendDist, 'index.html'));
  });
} else {
  // Safe startup – prevent EADDRINUSE on Nodemon restarts
  if (!global.__serverInstance) {
    global.__serverInstance = app.listen(PORT, () => {
      console.log(`[PENOFT Server] Listening on http://localhost:${PORT}`);
    });

    const shutdown = () => {
      if (global.__serverInstance) {
        global.__serverInstance.close(() => {
          console.log('Server closed');
          global.__serverInstance = null;
          process.exit(0);
        });
      }
    };
    process.on('SIGINT', shutdown);
    process.on('SIGTERM', shutdown);
  }
}
