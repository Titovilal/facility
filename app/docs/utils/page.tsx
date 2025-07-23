import { CodeBlock } from "@/components/docs/code-block";
import { ArrowRight, FileText, WrapText, Zap } from "lucide-react";
import Link from "next/link";

export default function UtilsPage() {
  return (
    <div className="container mx-auto max-w-4xl px-4 py-12">
      <div className="space-y-12">
        <div className="text-center">
          <div className="mb-4 flex items-center justify-center gap-4">
            <WrapText className="h-8 w-8 text-purple-400" />
            <h1 className="text-4xl font-bold tracking-tight">Utility Functions</h1>
          </div>
          <p className="text-muted-foreground text-xl">
            Powerful helper functions to simplify API calls and error handling
          </p>
        </div>

        <section>
          <div className="space-y-12">
            {/* Introduction to Utilities */}
            <div className="space-y-4">
              <h3 className="flex items-center text-2xl font-medium">
                <FileText className="mr-3 h-6 w-6 text-purple-400" />
                Overview of Utility Functions
              </h3>
              <p>
                The template provides a set of utility functions in <code>/lib/utils.ts</code> that
                make common tasks easier and more consistent. We focus on two particularly useful
                functions: <code>tryCatch</code> and <code>fetchApi</code>.
              </p>
              <div className="bg-muted rounded-lg p-6">
                <CodeBlock
                  title="/lib/utils.ts"
                  language="typescript"
                  code={`import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * Utility function to merge class names using clsx and tailwind-merge.
 * @param inputs - Array of class names to merge.
 * @returns Merged class names.
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

type ApiError = {
  status: number;
  message: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  data?: any; // Using any here to allow for flexible error data structures
};

type Result<T, E = ApiError> = { data: T; error: null } | { data: null; error: E };

/**
 * Wraps a promise in a try-catch block and returns a Result object.
 * @param promise - The promise to execute.
 * @returns A Result object containing either the data or an error.
 */
export async function tryCatch<T, E = Error>(promise: Promise<T>): Promise<Result<T, E>> {
  try {
    return { data: await promise, error: null };
  } catch (error) {
    return { data: null, error: error as E };
  }
}

type FetchOptions = RequestInit & {
  params?: Record<string, string>;
};

/**
 * Fetches data from an API endpoint.
 * @param endpoint - The API endpoint to fetch from.
 * @param options - Optional fetch options, including query parameters.
 * @returns A Result object containing either the data or an ApiError.
 */
export async function fetchApi<T>(
  endpoint: string,
  options: FetchOptions = {}
): Promise<Result<T, ApiError>> {
  const { params, ...fetchOptions } = options;
  let url = endpoint;

  // Add query params if they exist
  if (params) {
    const searchParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      searchParams.append(key, value);
    });
    url += \`?\${searchParams.toString()}\`;
  }

  try {
    const response = await fetch(url, {
      ...fetchOptions,
      headers: {
        "Content-Type": "application/json",
        ...fetchOptions.headers,
      },
    });

    const data = await response.json();

    if (!response.ok) {
      return {
        data: null,
        error: {
          status: response.status,
          message: data.error || "An error occurred",
          data: data,
        },
      };
    }

    return { data, error: null };
  } catch (error) {
    return {
      data: null,
      error: {
        status: 500,
        message: error instanceof Error ? error.message : "Network error",
      },
    };
  }
}`}
                />
              </div>
            </div>

            {/* tryCatch Function */}
            <div className="space-y-4">
              <h3 className="flex items-center text-2xl font-medium">
                <div className="bg-primary/10 mr-3 flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full">
                  <span className="font-semibold">1</span>
                </div>
                The tryCatch Function
              </h3>
              <div className="pl-11">
                <p className="mb-4">
                  The <code>tryCatch</code> function provides a clean way to handle promises and
                  their potential errors without writing repetitive try-catch blocks. It returns a
                  standardized <code>Result</code> object that makes error handling more consistent
                  and predictable.
                </p>
                <div className="bg-muted rounded-lg p-6">
                  <CodeBlock
                    title="tryCatch Function Signature"
                    language="typescript"
                    code={`type Result<T, E = ApiError> = { data: T; error: null } | { data: null; error: E };

export async function tryCatch<T, E = Error>(promise: Promise<T>): Promise<Result<T, E>> {
  try {
    return { data: await promise, error: null };
  } catch (error) {
    return { data: null, error: error as E };
  }
}`}
                  />
                </div>
                <div className="mt-6">
                  <h4 className="mb-2 text-lg font-medium">Key Features:</h4>
                  <ul className="list-disc pl-5">
                    <li>Generic typing allows for any promise return type and error type</li>
                    <li>
                      Returns a consistent <code>Result</code> object structure
                    </li>
                    <li>Eliminates repetitive try-catch code</li>
                    <li>Makes error handling explicit rather than through exceptions</li>
                  </ul>
                </div>
                <div className="mt-6">
                  <h4 className="mb-2 text-lg font-medium">Usage Example:</h4>
                  <div className="bg-muted rounded-lg p-6">
                    <CodeBlock
                      title="Using tryCatch with a database operation"
                      language="typescript"
                      code={`import { tryCatch } from '@/lib/utils';
import { getAdminDb } from '@/db/db';
import { users } from '@/db/schemas/users';

async function findUserById(id: string) {
  const db = getAdminDb();
  
  // Using tryCatch to handle potential database errors
  const result = await tryCatch(
    db.query.users.findFirst({
      where: eq(users.id, id),
    })
  );
  
  if (result.error) {
    console.error("Database error:", result.error);
    return null;
  }
  
  return result.data;
}`}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* fetchApi Function */}
            <div className="space-y-4">
              <h3 className="flex items-center text-2xl font-medium">
                <div className="bg-primary/10 mr-3 flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full">
                  <span className="font-semibold">2</span>
                </div>
                The fetchApi Function
              </h3>
              <div className="pl-11">
                <p className="mb-4">
                  The <code>fetchApi</code> function is a wrapper around the native{" "}
                  <code>fetch</code> that adds consistent error handling, automatic JSON parsing,
                  and support for query parameters. It also returns a standardized
                  <code>Result</code> object similar to <code>tryCatch</code>.
                </p>
                <div className="bg-muted rounded-lg p-6">
                  <CodeBlock
                    title="fetchApi Function Signature"
                    language="typescript"
                    code={`type ApiError = {
  status: number;
  message: string;
  data?: any;
};

type FetchOptions = RequestInit & {
  params?: Record<string, string>;
};

export async function fetchApi<T>(
  endpoint: string,
  options: FetchOptions = {}
): Promise<Result<T, ApiError>> {
  // ... implementation
}`}
                  />
                </div>
                <div className="mt-6">
                  <h4 className="mb-2 text-lg font-medium">Key Features:</h4>
                  <ul className="list-disc pl-5">
                    <li>Automatic handling of HTTP request errors</li>
                    <li>Automatic JSON parsing of responses</li>
                    <li>
                      Support for query parameters through <code>params</code> option
                    </li>
                    <li>Consistent error format with HTTP status codes</li>
                    <li>TypeScript generics for response type safety</li>
                  </ul>
                </div>
                <div className="mt-6">
                  <h4 className="mb-2 text-lg font-medium">Usage Examples:</h4>
                  <div className="bg-muted rounded-lg p-6">
                    <CodeBlock
                      title="Basic GET request with fetchApi"
                      language="typescript"
                      code={`import { fetchApi } from '@/lib/utils';

// Type for the expected response
type User = {
  id: string;
  name: string;
  email: string;
};

async function getUser(userId: string) {
  // GET request with query parameters
  const result = await fetchApi<User>('/api/users', {
    params: { id: userId }
  });
  
  if (result.error) {
    console.error("Failed to fetch user:", result.error.message);
    return null;
  }
  
  return result.data;
}`}
                    />
                  </div>
                  <div className="bg-muted mt-4 rounded-lg p-6">
                    <CodeBlock
                      title="POST request with fetchApi"
                      language="typescript"
                      code={`import { fetchApi } from '@/lib/utils';

type CreateUserPayload = {
  name: string;
  email: string;
  role: string;
};

type CreateUserResponse = {
  user: {
    id: string;
    name: string;
    email: string;
    role: string;
    createdAt: string;
  };
};

async function createUser(userData: CreateUserPayload) {
  // POST request with JSON body
  const result = await fetchApi<CreateUserResponse>('/api/users', {
    method: 'POST',
    body: JSON.stringify(userData)
  });
  
  if (result.error) {
    if (result.error.status === 409) {
      throw new Error("User with this email already exists");
    }
    throw new Error("Failed to create user: " + result.error.message);
  }
  
  return result.data.user;
}`}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Combining tryCatch and fetchApi */}
            <div className="space-y-4">
              <h3 className="flex items-center text-2xl font-medium">
                <div className="bg-primary/10 mr-3 flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full">
                  <span className="font-semibold">3</span>
                </div>
                Using tryCatch with fetchApi
              </h3>
              <div className="pl-11">
                <p className="mb-4">
                  While <code>fetchApi</code> already includes error handling for network and HTTP
                  errors, you can combine it with <code>tryCatch</code> to handle additional
                  exceptions that might occur during processing.
                </p>
                <div className="bg-muted rounded-lg p-6">
                  <CodeBlock
                    title="Combining tryCatch with fetchApi"
                    language="typescript"
                    code={`import { fetchApi, tryCatch } from '@/lib/utils';

async function processUserData(userId: string) {
  // Using tryCatch to handle any exceptions in the entire function
  const result = await tryCatch(async () => {
    // Fetch user data
    const userResult = await fetchApi<{ user: UserType }>('/api/users', {
      params: { id: userId }
    });
    
    if (userResult.error) {
      throw new Error(\`Failed to fetch user: \${userResult.error.message}\`);
    }
    
    const user = userResult.data.user;
    
    // Fetch additional data
    const statsResult = await fetchApi<{ stats: StatsType }>('/api/stats', {
      params: { userId }
    });
    
    if (statsResult.error) {
      throw new Error(\`Failed to fetch stats: \${statsResult.error.message}\`);
    }
    
    // Process and combine data
    return {
      ...user,
      stats: statsResult.data.stats,
      lastActive: new Date(user.lastActiveTimestamp)
    };
  });
  
  if (result.error) {
    console.error("Error in processing user data:", result.error);
    return null;
  }
  
  return result.data;
}`}
                  />
                </div>
                <div className="mt-6">
                  <h4 className="mb-2 text-lg font-medium">Benefits of this approach:</h4>
                  <ul className="list-disc pl-5">
                    <li>Handles multiple API calls in a single function</li>
                    <li>Provides consistent error handling for all types of errors</li>
                    <li>Allows custom error transformation and propagation</li>
                    <li>Keeps the code clean by avoiding nested try-catch blocks</li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Example: Using in React components */}
            <div className="space-y-4">
              <h3 className="flex items-center text-2xl font-medium">
                <div className="bg-primary/10 mr-3 flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full">
                  <span className="font-semibold">4</span>
                </div>
                Using in React Components
              </h3>
              <div className="pl-11">
                <p className="mb-4">
                  These utility functions are particularly useful in React components where you need
                  to handle data fetching and processing. Here&apos;s a practical example of a
                  component using <code>fetchApi</code>:
                </p>
                <div className="bg-muted rounded-lg p-6">
                  <CodeBlock
                    title="React component using fetchApi"
                    language="tsx"
                    code={`"use client";
import { fetchApi } from '@/lib/utils';
import { useEffect, useState } from 'react';

type Profile = {
  id: number;
  name: string;
  email: string;
  role: string;
};

export function ProfileData({ userId }: { userId: string }) {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadProfile() {
      setLoading(true);
      setError(null);
      
      const result = await fetchApi<{ profile: Profile }>('/api/profile', {
        params: { userId }
      });
      
      if (result.error) {
        setError(result.error.message);
      } else {
        setProfile(result.data.profile);
      }
      
      setLoading(false);
    }
    
    loadProfile();
  }, [userId]);

  if (loading) return <div>Loading profile...</div>;
  if (error) return <div className="text-red-500">Error: {error}</div>;
  if (!profile) return <div>No profile found</div>;

  return (
    <div className="border p-4 rounded-lg">
      <h2 className="text-xl font-bold">{profile.name}</h2>
      <p className="text-gray-600">{profile.email}</p>
      <p className="text-sm bg-blue-100 inline-block px-2 py-1 rounded">
        {profile.role}
      </p>
    </div>
  );
}`}
                  />
                </div>
                <div className="mt-6">
                  <p className="mb-4">
                    You can also use these functions in form submission handlers:
                  </p>
                  <div className="bg-muted rounded-lg p-6">
                    <CodeBlock
                      title="Form submission with fetchApi"
                      language="tsx"
                      code={`"use client";
import { fetchApi } from '@/lib/utils';
import { useState } from 'react';
import { toast } from 'sonner';

export function UpdateProfileForm({ userId }: { userId: string }) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setIsSubmitting(true);
    
    const result = await fetchApi('/api/profile', {
      method: 'PUT',
      body: JSON.stringify({ name, email, userId }),
    });
    
    setIsSubmitting(false);
    
    if (result.error) {
      toast.error("Failed to update profile: " + result.error.message);
    } else {
      toast.success("Profile updated successfully!");
      // Reset form or redirect
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium mb-1">Name</label>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="w-full border rounded p-2"
          required
        />
      </div>
      
      <div>
        <label className="block text-sm font-medium mb-1">Email</label>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full border rounded p-2"
          required
        />
      </div>
      
      <button
        type="submit"
        disabled={isSubmitting}
        className="bg-blue-500 text-white rounded px-4 py-2"
      >
        {isSubmitting ? 'Updating...' : 'Update Profile'}
      </button>
    </form>
  );
}`}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Best Practices */}
            <div className="space-y-4">
              <h3 className="flex items-center text-2xl font-medium">
                <Zap className="mr-3 h-6 w-6 text-purple-400" />
                Best Practices
              </h3>
              <div className="bg-primary/10 border-primary/20 rounded-md border p-4">
                <p className="font-medium">
                  Follow these best practices when working with these utility functions:
                </p>
                <ul className="mt-2 list-disc space-y-1 pl-5">
                  <li>
                    Always provide a specific type parameter to{" "}
                    <code>fetchApi&lt;YourType&gt;</code> for better type safety
                  </li>
                  <li>
                    Handle both success and error cases from the returned <code>Result</code> object
                  </li>
                  <li>
                    Use <code>params</code> for query parameters instead of manually constructing
                    URLs
                  </li>
                  <li>
                    Use <code>tryCatch</code> for complex operations that might throw exceptions
                  </li>
                  <li>Check for specific error status codes to provide better error messages</li>
                  <li>
                    For deeply nested operations, consider using <code>tryCatch</code> at the
                    outermost level
                  </li>
                  <li>
                    Use descriptive variable names like <code>userResult</code> or{" "}
                    <code>profileResult</code> for clarity
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </section>

        <div className="text-center">
          <Link
            href="/docs"
            className="inline-flex items-center justify-center text-sm font-medium text-blue-400 hover:underline"
          >
            Back to Documentation
            <ArrowRight className="ml-1 h-4 w-4" />
          </Link>
        </div>
      </div>
    </div>
  );
}
