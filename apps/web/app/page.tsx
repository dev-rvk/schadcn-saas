// apps/web/app/page.tsx
import { auth0 } from '@/lib/auth0';
import { Button } from '@workspace/ui/components/button';
import Link from 'next/link';
import { fetchPostsAction } from '@/app/actions';
import { PostManager } from '@/components/PostManager'; // Import the new client component
import { Post } from '@workspace/types';

export default async function Page() {
  const session = await auth0.getSession();
  let initialPosts: Post[] = [];
  let initialError: string | null = null;

  if (session?.user) {
    const postsResult = await fetchPostsAction();
    if (postsResult.success) {
      initialPosts = postsResult.data;
    } else {
      initialError = postsResult.error;
      console.error("Error fetching initial posts for page.tsx:", initialError);
    }
  }

  return (
    <div className="container mx-auto p-4 min-h-svh">
      <header className="flex justify-between items-center py-4 mb-6 border-b">
        <h1 className="text-3xl font-bold">My Awesome App (Server Actions)</h1>
        {session?.user ? (
          <div className="flex items-center gap-4">
            <span className="text-sm">Welcome, {session.user.name || session.user.email}!</span>
            {session.user.picture && <img src={session.user.picture} alt="avatar" className="w-8 h-8 rounded-full" />}
            <Button variant="outline" asChild>
              <Link href="/auth/logout">Logout</Link>
            </Button>
          </div>
        ) : (
          <div className="flex gap-2">
            <Button asChild>
              <Link href="/auth/login">Login</Link>
            </Button>
            <Button variant="outline" asChild>
              <Link href="/auth/login?connection=google-oauth2&screen_hint=signup">Sign up with Google</Link>
            </Button>
             <Button variant="outline" asChild>
              <Link href="/auth/login?connection=github&screen_hint=signup">Sign up with GitHub</Link>
            </Button>
          </div>
        )}
      </header>

      {session?.user ? (
        <div>
          <PostManager initialPosts={initialPosts} initialError={initialError} />
          <details className="mt-8 p-2 border rounded">
            <summary className="cursor-pointer font-semibold">User Session Data (Debug)</summary>
            <pre className="mt-2 p-3 bg-slate-100 dark:bg-slate-800 rounded-md text-xs overflow-auto w-full max-w-2xl">
              {JSON.stringify(session, null, 2)}
            </pre>
          </details>
        </div>
      ) : (
        <div className="text-center mt-10">
          <p className="text-xl">Please log in to manage your posts.</p>
        </div>
      )}
    </div>
  );
}
