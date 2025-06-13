'use client';

import { useState, useTransition, FormEvent, useEffect } from 'react';
import { Post } from '@workspace/types';
import { createPostAction, deletePostAction, fetchPostsAction } from '@/app/actions'; // Assuming actions.ts is in app directory
import { Button } from '@workspace/ui/components/button';
import { Input } from '@workspace/ui/components/input';
import { Textarea } from '@workspace/ui/components/textarea';

interface PostManagerProps {
  initialPosts: Post[];
  initialError?: string | null;
}

export function PostManager({ initialPosts, initialError }: PostManagerProps) {
  const [posts, setPosts] = useState<Post[]>(initialPosts);
  const [error, setError] = useState<string | null>(initialError || null);

  const [newPostTitle, setNewPostTitle] = useState('');
  const [newPostContent, setNewPostContent] = useState('');

  const [isPending, startTransition] = useTransition();

  // Effect to refresh posts if initialPosts change due to revalidation by parent
  useEffect(() => {
    setPosts(initialPosts);
    setError(initialError || null);
  }, [initialPosts, initialError]);


  const handleCreatePost = async (e: FormEvent) => {
    e.preventDefault();
    if (!newPostTitle.trim() || !newPostContent.trim()) {
      setError("Title and content cannot be empty.");
      return;
    }
    setError(null);

    startTransition(async () => {
      const formData = new FormData();
      formData.append('title', newPostTitle);
      formData.append('content', newPostContent);

      const result = await createPostAction(formData);
      if (result.success) {
        setNewPostTitle('');
        setNewPostContent('');
        // Posts will be updated by revalidation from server action
        // Optionally, could optimistically update here or explicitly refetch:
        // const fetchResult = await fetchPostsAction();
        // if (fetchResult.success) setPosts(fetchResult.data);
        // else setError(fetchResult.error);
      } else {
        setError(result.error + (result.details ? ` ${JSON.stringify(result.details)}` : ''));
      }
    });
  };

  const handleDeletePost = async (postId: string) => {
    if (!confirm('Are you sure you want to delete this post?')) return;
    setError(null);

    startTransition(async () => {
      const result = await deletePostAction(postId);
      if (result.success) {
        // Posts updated by revalidation
      } else {
        setError(result.error);
      }
    });
  };

  return (
    <div>
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
              disabled={isPending}
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
              disabled={isPending}
              required
              rows={5}
              className="w-full"
            />
          </div>
          <Button type="submit" disabled={isPending}>
            {isPending ? 'Submitting...' : 'Create Post'}
          </Button>
        </form>
      </section>

      <section>
        <h2 className="text-2xl font-semibold mb-4">Your Posts</h2>
        {isPending && <p>Updating posts...</p>}
        {error && <p className="text-red-500">Error: {error}</p>}

        {!isPending && !error && posts.length === 0 && (
          <p>No posts found. Create your first post above!</p>
        )}
        <div className="space-y-4">
          {posts.map((post) => (
            <article key={post.id} className="p-4 border rounded-lg shadow-sm">
              <h3 className="text-xl font-semibold mb-1">{post.title}</h3>
              <p className="text-gray-700 dark:text-gray-300 mb-2 whitespace-pre-wrap">{post.content}</p>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Created: {new Date(post.createdAt!).toLocaleDateString()}
              </p>
              <Button
                variant="destructive"
                size="sm"
                onClick={() => handleDeletePost(post.id)}
                disabled={isPending}
                className="mt-2"
              >
                Delete
              </Button>
            </article>
          ))}
        </div>
      </section>
    </div>
  );
}
