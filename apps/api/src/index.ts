import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { PrismaClient } from '@workspace/db/client'; // Adjusted import path
import { auth, requiredScopes } from 'express-oauth2-jwt-bearer'; // Auth middleware
import { CreatePostSchema } from '@workspace/types'; // Zod schema

dotenv.config(); // Load .env file

const app = express();
const port = process.env.PORT || 3001;

const prisma = new PrismaClient();

// Middleware
app.use(cors()); // Configure CORS appropriately for your frontend
app.use(express.json());

// Auth0 Middleware Configuration
// Ensure these ENV variables are set in your .env file for the API
// AUTH0_API_ISSUER_BASE_URL (e.g., https://your-tenant.auth0.com/)
// AUTH0_API_AUDIENCE (e.g., your API identifier from Auth0 dashboard)
const checkJwt = auth({
  audience: process.env.AUTH0_API_AUDIENCE as string,
  issuerBaseURL: process.env.AUTH0_API_ISSUER_BASE_URL as string,
  tokenSigningAlg: 'RS256'
});

// Routes
app.get('/', (req, res) => {
  res.send('API is running!');
});

// Protected CRUD endpoints for Posts
app.get('/posts', checkJwt, async (req, res) => {
  const auth0Id = req.auth?.payload.sub;
  if (!auth0Id) {
    return res.status(401).json({ message: 'User not authenticated' });
  }

  try {
    const posts = await prisma.post.findMany({
      where: { authorId: auth0Id },
      orderBy: { createdAt: 'desc' },
    });
    res.json(posts);
  } catch (error) {
    console.error('Error fetching posts:', error);
    res.status(500).json({ message: 'Failed to fetch posts' });
  }
});

app.post('/posts', checkJwt, async (req, res) => {
  const auth0Id = req.auth?.payload.sub;
  if (!auth0Id) {
    return res.status(401).json({ message: 'User not authenticated' });
  }

  try {
    const validationResult = CreatePostSchema.safeParse(req.body);
    if (!validationResult.success) {
      return res.status(400).json({ message: 'Invalid post data', errors: validationResult.error.format() });
    }

    const { title, content } = validationResult.data;

    // Ensure the user exists in your DB, or create them (optional, depends on flow)
    // For this example, we assume the user from Auth0 token should exist or their posts won't be associated.
    // A more robust system might sync users on first login via the web app.
    const user = await prisma.user.findUnique({ where: { auth0Id }});
    if (!user) {
        // This case should ideally be handled by user creation on web app's first login.
        // If a user made it here with a valid token but isn't in DB, it's a sync issue.
        return res.status(403).json({ message: "User profile not found in local database. Please complete profile setup." });
    }

    const post = await prisma.post.create({
      data: {
        title,
        content,
        authorId: auth0Id, // Link to the User's auth0Id
        published: true, // Default to published, or make it part of schema
      },
    });
    res.status(201).json(post);
  } catch (error) {
    console.error('Error creating post:', error);
    // Check for specific Prisma errors if needed
    res.status(500).json({ message: 'Failed to create post' });
  }
});

app.delete('/posts/:id', checkJwt, async (req, res) => {
  const auth0Id = req.auth?.payload.sub;
  const postId = req.params.id;

  if (!auth0Id) {
    return res.status(401).json({ message: 'User not authenticated' });
  }

  try {
    const post = await prisma.post.findUnique({
      where: { id: postId },
    });

    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }

    if (post.authorId !== auth0Id) {
      return res.status(403).json({ message: 'User not authorized to delete this post' });
    }

    await prisma.post.delete({
      where: { id: postId },
    });
    res.status(204).send(); // No content
  } catch (error) {
    console.error('Error deleting post:', error);
    res.status(500).json({ message: 'Failed to delete post' });
  }
});


// Start server
app.listen(port, () => {
  console.log(\`API server listening on http://localhost:\${port}\`);
});

// Handle Prisma shutdown
process.on('SIGINT', async () => {
  await prisma.\$disconnect();
  process.exit(0);
});
process.on('SIGTERM', async () => {
  await prisma.\$disconnect();
  process.exit(0);
});
