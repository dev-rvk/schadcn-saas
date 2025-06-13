import { z } from 'zod';

// Example User schema
export const UserSchema = z.object({
  id: z.string().uuid(),
  email: z.string().email({ message: "Invalid email address" }),
  name: z.string().min(2, { message: "Name must be at least 2 characters long" }).optional(),
});

export type User = z.infer<typeof UserSchema>;

// Example Post schema
export const PostSchema = z.object({
  id: z.string().uuid(),
  title: z.string().min(3, { message: "Title must be at least 3 characters long" }),
  content: z.string().min(10, { message: "Content must be at least 10 characters long" }),
  authorId: z.string().uuid(),
  createdAt: z.date().optional(),
  updatedAt: z.date().optional(),
});

export type Post = z.infer<typeof PostSchema>;

// Schema for creating a post (omitting id, authorId, createdAt, updatedAt as they'll be set by server/db)
export const CreatePostSchema = PostSchema.omit({
  id: true,
  authorId: true, // Will be derived from authenticated user on the server
  createdAt: true,
  updatedAt: true,
});

export type CreatePostInput = z.infer<typeof CreatePostSchema>;
