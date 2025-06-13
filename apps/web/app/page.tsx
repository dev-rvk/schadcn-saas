'use client';

import { useEffect, useState, FormEvent } from 'react';
import { useUser, Session } from '@auth0/nextjs-auth0/client';
import { getAccessToken } from '@auth0/nextjs-auth0/client';
import { Button } from '@workspace/ui/components/button';
import { Input } from '@workspace/ui/components/input'; // Assuming path
import { Textarea } from '@workspace/ui/components/textarea'; // Assuming path
import Link from 'next/link';
import { Post, CreatePostInput } from '@workspace/types'; // Import types

const NEXT_PUBLIC_API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

export default function Page() {
  const { user, error: authError, isLoading: authLoading } = useUser();
  const [posts, setPosts] = useState<Post[]>([]);
  const [isLoadingPosts, setIsLoadingPosts] = useState(false);
  const [errorPosts, setErrorPosts] = useState<string | null>(null);

  const [newPostTitle, setNewPostTitle] = useState('');
  const [newPostContent, setNewPostContent] = useState('');
  const [isSubmittingPost, setIsSubmittingPost] = useState(false);

  // Fetch posts when user is loaded
  useEffect(() => {
    if (user && !authLoading) {
      fetchPosts();
    }
  }, [user, authLoading]);

  const fetchPosts = async () => {
    setIsLoadingPosts(true);
    setErrorPosts(null);
    try {
      const { accessToken } = await getAccessToken();
      if (!accessToken) {
        throw new Error('Access token not available.');
      }
      const response = await fetch(\`\${NEXT_PUBLIC_API_URL}/posts\`, {
        headers: {
          Authorization: \`Bearer \${accessToken}\`,
        },
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to fetch posts');
      }
      const data: Post[] = await response.json();
      setPosts(data);
    } catch (err: any) {
      setErrorPosts(err.message);
    } finally {
      setIsLoadingPosts(false);
    }
  };

  const handleCreatePost = async (e: FormEvent) => {
    e.preventDefault();
    if (!newPostTitle.trim() || !newPostContent.trim()) {
      setErrorPosts("Title and content cannot be empty.");
      return;
    }
    setIsSubmittingPost(true);
    setErrorPosts(null);
    try {
      const { accessToken } = await getAccessToken();
      if (!accessToken) throw new Error('Access token not available.');

      const postInput: CreatePostInput = { title: newPostTitle, content: newPostContent };

      const response = await fetch(\`\${NEXT_PUBLIC_API_URL}/posts\`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: \`Bearer \${accessToken}\`,
        },
        body: JSON.stringify(postInput),
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to create post');
      }
      setNewPostTitle('');
      setNewPostContent('');
      fetchPosts(); // Refresh posts list
    } catch (err: any) {
      setErrorPosts(err.message);
    } finally {
      setIsSubmittingPost(false);
    }
  };

  const handleDeletePost = async (postId: string) => {
    if (!confirm('Are you sure you want to delete this post?')) return;
    setErrorPosts(null);
    try {
      const { accessToken } = await getAccessToken();
      if (!accessToken) throw new Error('Access token not available.');

      const response = await fetch(\`\${NEXT_PUBLIC_API_URL}/posts/\${postId}\`, {
        method: 'DELETE',
        headers: {
          Authorization: \`Bearer \${accessToken}\`,
        },
      });
      if (!response.ok && response.status !== 204) { // 204 is success with no content
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to delete post');
      }
      fetchPosts(); // Refresh posts list
    } catch (err: any) {
      setErrorPosts(err.message);
    }
  };

  if (authLoading) return <div className="flex items-center justify-center min-h-svh">Loading authentication...</div>;
  if (authError) return <div className="flex items-center justify-center min-h-svh">Auth Error: {authError.message}</div>;

  return (
    <div className="container mx-auto p-4 min-h-svh">
      <header className="flex justify-between items-center py-4 mb-6 border-b">
        <h1 className="text-3xl font-bold">My Awesome App</h1>
        {user ? (
          <div className="flex items-center gap-4">
            <span className="text-sm">Welcome, {user.name || user.email}!</span>
            {user.picture && <img src={user.picture} alt="avatar" className="w-8 h-8 rounded-full" />}
            <Button variant="outline" asChild>
              <Link href="/api/auth/logout">Logout</Link>
            </Button>
          </div>
        ) : (
          <div className="flex gap-2">
            <Button asChild>
              <Link href="/api/auth/login">Login</Link>
            </Button>
            <Button variant="outline" asChild>
              <Link href="/api/auth/login?connection=google-oauth2">Login with Google</Link>
            </Button>
          </div>
        )}
      </header>

      {user && (
        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">Create New Post</h2>
          <form onSubmit={handleCreatePost} className="space-y-4 p-4 border rounded-lg shadow">
            <div>
              <label htmlFor="postTitle" className="block text-sm font-medium mb-1">Title</label>
              <Input
                id="postTitle"
                type="text"
                value={newPostTitle}
                onChange={(e) => setNewPostTitle(e.target.value)}
                placeholder="Post title"
                disabled={isSubmittingPost}
                required
                className="w-full"
              />
            </div>
            <div>
              <label htmlFor="postContent" className="block text-sm font-medium mb-1">Content</label>
              <Textarea
                id="postContent"
                value={newPostContent}
                onChange={(e) => setNewPostContent(e.target.value)}
                placeholder="Post content..."
                disabled={isSubmittingPost}
                required
                rows={5}
                className="w-full"
              />
            </div>
            <Button type="submit" disabled={isSubmittingPost}>
              {isSubmittingPost ? 'Submitting...' : 'Create Post'}
            </Button>
          </form>
        </section>
      )}

      {user && (
        <section>
          <h2 className="text-2xl font-semibold mb-4">Your Posts</h2>
          {isLoadingPosts && <p>Loading posts...</p>}
          {errorPosts && <p className="text-red-500">Error: {errorPosts}</p>}
          {!isLoadingPosts && !errorPosts && posts.length === 0 && (
            <p>No posts found. Create your first post above!</p>
          )}
          <div className="space-y-4">
            {posts.map((post) => (
              <article key={post.id} className="p-4 border rounded-lg shadow-sm">
                <h3 className="text-xl font-semibold mb-1">{post.title}</h3>
                <p className="text-gray-700 dark:text-gray-300 mb-2">{post.content}</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Created: {new Date(post.createdAt!).toLocaleDateString()}
                </p>
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => handleDeletePost(post.id)}
                  className="mt-2"
                >
                  Delete
                </Button>
              </article>
            ))}
          </div>
        </section>
      )}

      {!user && !authLoading && (
        <div className="text-center mt-10">
          <p className="text-xl">Please log in to manage your posts.</p>
        </div>
      )}
    </div>
  );
}
