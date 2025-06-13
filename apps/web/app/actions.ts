'use server';

import { auth0 } from '@/lib/auth0';
import { CreatePostInput, PostSchema, CreatePostSchema, Post } from '@workspace/types';
import { revalidatePath } from 'next/cache';

const NEXT_PUBLIC_API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

type ActionResult<T = any> = { success: true; data: T } | { success: false; error: string; details?: any };

async function getApiAccessToken(): Promise<string | undefined> {
  const session = await auth0.getSession();
  // The accessToken for the API should be available in the session
  // if audience was correctly configured in Auth0Client.
  // It might be directly on session.accessToken or session.user.accessToken depending on SDK version and config.
  // Let's assume session.accessToken based on common patterns with audience parameter.
  if (!session || !session.accessToken) {
    console.error("No session or access token found in actions.ts");
    return undefined;
  }
  return session.accessToken;
}

export async function fetchPostsAction(): Promise<ActionResult<Post[]>> {
  const accessToken = await getApiAccessToken();
  if (!accessToken) {
    return { success: false, error: 'User not authenticated or access token unavailable.' };
  }

  try {
    const response = await fetch(`${NEXT_PUBLIC_API_URL}/posts`, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
      cache: 'no-store', // Ensure fresh data
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ message: 'Failed to fetch posts and parse error' }));
      console.error("API Error fetching posts:", errorData);
      return { success: false, error: errorData.message || 'Failed to fetch posts' };
    }
    const posts: Post[] = await response.json();
    return { success: true, data: posts };
  } catch (err: any) {
    console.error("Network/fetch error in fetchPostsAction:", err);
    return { success: false, error: err.message || 'An unexpected error occurred while fetching posts.' };
  }
}

export async function createPostAction(formData: FormData): Promise<ActionResult<Post>> {
  const accessToken = await getApiAccessToken();
  if (!accessToken) {
    return { success: false, error: 'User not authenticated or access token unavailable.' };
  }

  const rawFormData = {
    title: formData.get('title') as string,
    content: formData.get('content') as string,
  };

  const validationResult = CreatePostSchema.safeParse(rawFormData);
  if (!validationResult.success) {
    return { success: false, error: 'Invalid post data.', details: validationResult.error.format() };
  }

  try {
    const response = await fetch(`${NEXT_PUBLIC_API_URL}/posts`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${accessToken}`,
      },
      body: JSON.stringify(validationResult.data),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ message: 'Failed to create post and parse error' }));
      console.error("API Error creating post:", errorData);
      return { success: false, error: errorData.message || 'Failed to create post' };
    }
    const newPost: Post = await response.json();
    revalidatePath('/'); // Revalidate the page to show the new post
    return { success: true, data: newPost };
  } catch (err: any) {
    console.error("Network/fetch error in createPostAction:", err);
    return { success: false, error: err.message || 'An unexpected error occurred while creating the post.' };
  }
}

export async function deletePostAction(postId: string): Promise<ActionResult<{ id: string }>> {
  const accessToken = await getApiAccessToken();
  if (!accessToken) {
    return { success: false, error: 'User not authenticated or access token unavailable.' };
  }

  if (!postId || typeof postId !== 'string') {
    return { success: false, error: 'Invalid post ID.' };
  }

  try {
    const response = await fetch(`${NEXT_PUBLIC_API_URL}/posts/${postId}`, {
      method: 'DELETE',
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    // DELETE requests often return 204 No Content on success
    if (response.status === 204) {
      revalidatePath('/'); // Revalidate the page
      return { success: true, data: { id: postId } };
    }

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ message: 'Failed to delete post and parse error' }));
      console.error("API Error deleting post:", errorData);
      return { success: false, error: errorData.message || 'Failed to delete post' };
    }

    // Should ideally be 204, but if API returns JSON on delete for some reason:
    // const deletedData = await response.json();
    revalidatePath('/');
    return { success: true, data: { id: postId } }; // Or deletedData if applicable

  } catch (err: any) {
    console.error("Network/fetch error in deletePostAction:", err);
    return { success: false, error: err.message || 'An unexpected error occurred while deleting the post.' };
  }
}
