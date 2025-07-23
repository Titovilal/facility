# Next.js Boilerplate with Neon DB, Stack Auth, and Stripe

An advanced starter template for Next.js applications with Neon Database, Stack Auth authentication, Stripe payments, internationalization, and more.

![Next.js Boilerplate](https://api.placeholder.com/400/200?text=Next.js+Boilerplate)

## 📋 Features

- **Next.js 15** with App Router
- **Authentication** via Stack Auth
- **Database** with Neon PostgreSQL
- **ORM** using Drizzle
- **Row Level Security** (RLS) for data protection
- **Payments** with Stripe integration
- **Internationalization** (i18n) support
- **Theme** with light/dark mode support
- **UI Components** from Shadcn/UI
- **Type Safety** with TypeScript
- **Bun** package manager and runtime

## 🚀 Getting Started

### Prerequisites

Before starting, make sure you have the following:

- [Bun](https://bun.sh/) installed
- [Neon Database](https://neon.tech/) account
- [Stack Auth](https://www.stack-auth.com/) account
- [Stripe](https://stripe.com/) account
- Node.js 18+ (if not using Bun for Node.js operations)

### Installation

1. Clone the repository:

```bash
git clone https://github.com/yourusername/your-repo-name.git
cd your-repo-name
```

2. Install dependencies:

```bash
bun install
```

3. Set up environment variables:

Create a `.env.local` file in the root of your project with the following variables:

```
# Database
DATABASE_URL=
NEXT_PUBLIC_DATABASE_AUTHENTICATED_URL=

# Stack Auth
NEXT_PUBLIC_STACK_APP_ID=
NEXT_PUBLIC_STACK_APP_KEY=
STACK_APP_SECRET=

# Stripe
STRIPE_SECRET_KEY=
STRIPE_WEBHOOK_SECRET=
```

4. Start development server:

```bash
bun dev
```

## 🧰 Common Bun Commands

Bun is a fast all-in-one JavaScript runtime, bundler, test runner, and package manager. Here are some useful commands:

```bash
# Start development server
bun dev

# Build for production
bun build

# Start production server
bun start

# Lint code
bun lint

# Fix linting issues
bun lint:fix

# Format code
bun format

# Clean .next directory
bun clean

# Clean .next, node_modules, and package-lock.json
bun clean:all

# Generate Drizzle migrations
bun drizzle:generate

# Run Drizzle migrations
bun drizzle:migrate

# Generate and migrate in one command
bun drizzle:gm

# Add a new shadcn component
bun shadcn <component-name>
```

## 🔐 Setting Up Stack Auth

Stack Auth provides authentication services for your application. Here's how to set it up:

1. Create an account on [Stack Auth](https://www.stack-auth.com/)
2. Create a new project in the Stack Auth dashboard
3. Note your Project ID, App ID, App Key, and App Secret
4. Add these to your `.env.local` file:

```
NEXT_PUBLIC_STACK_APP_ID=your_app_id
NEXT_PUBLIC_STACK_APP_KEY=your_app_key
STACK_APP_SECRET=your_app_secret
```

5. Configure allowed redirect URLs in the Stack Auth dashboard:
   - Add `http://localhost:3000/handler/*` for development
   - Add your production URLs for deployment

Stack Auth is integrated in `stack.ts`, which creates a server-side app instance:

```typescript
// stack.ts
import { StackServerApp } from "@stackframe/stack";
import "server-only";

export const stackServerApp = new StackServerApp({
  tokenStore: "nextjs-cookie", // storing auth tokens in cookies
  urls: {
    signIn: "/auth",
    signUp: "/auth",
  },
});
```

### Authentication Methods: OAuth and Magic Links

The `/auth` route provides the authentication interface for your application. We highly recommend focusing on these two authentication methods:

1. **Google OAuth**: Provides a frictionless login experience with high security
2. **Magic Link**: Password-less authentication via email links

#### Why These Methods?

- **Better User Experience**: No passwords to remember or manage
- **Higher Security**: Less vulnerable to common attacks like credential stuffing
- **Reduced Friction**: Faster signup and login process
- **Higher Conversion**: Typically results in better signup completion rates

#### Setting Up Google OAuth

1. In your Stack Auth dashboard, navigate to the "Authentication" section
2. Enable Google OAuth
3. Create a Google OAuth Client in [Google Cloud Console](https://console.cloud.google.com/apis/credentials)
4. Add the Client ID and Client Secret to Stack Auth
5. Configure allowed redirect URIs in Google Cloud Console:
   - `https://api.stack-auth.com/api/v1/oauth/callback/google`

#### Setting Up Magic Link

1. In your Stack Auth dashboard, navigate to the "Authentication" section
2. Enable Magic Link
3. Configure email templates to match your brand
4. (Optional) Set the token expiration time (default is 5 minutes)

#### Implementation in the Codebase

The auth page is already set up to handle these methods:

```jsx
// app/auth/page.tsx
<form onSubmit={handleMagicLink} className="space-y-3">
  {/* Magic Link Email Input */}
</form>

<Button
  variant="outline"
  onClick={() => handleOAuth("google")}
  disabled={isLoading}
  className="flex w-full items-center justify-center gap-2"
>
  <GoogleIcon />
  {translations.auth.continueWith.replace("{provider}", "Google")}
</Button>
```

To customize the auth page further, modify the `app/auth/page.tsx` file to match your brand and requirements.

## 📊 Setting Up Neon Database

Neon provides serverless PostgreSQL databases. Here's how to set it up:

1. Create an account on [Neon](https://neon.tech/)
2. Create a new project and database
3. Get your connection strings (both direct and via connection pooling)
4. Add these to your `.env.local` file:

```
DATABASE_URL=postgres://user:password@endpoint/dbname
NEXT_PUBLIC_DATABASE_AUTHENTICATED_URL=postgres://user:password@endpoint/dbname?sslmode=require
```

### Linking Neon with Stack Auth via JWT

To enable Row Level Security (RLS) with JWT authentication:

1. In your Neon project, navigate to the SQL Editor
2. Enable the `pg_session_jwt` extension:

```sql
CREATE EXTENSION IF NOT EXISTS pg_session_jwt;
```

3. Configure JWT validation in Neon to use Stack Auth's JWKS URL:

```
https://api.stack-auth.com/api/v1/projects/{YOUR_PROJECT_ID}/.well-known/jwks.json
```

Replace `{YOUR_PROJECT_ID}` with your Stack Auth project ID.

### Setting Up Row Level Security (RLS)

Run the following SQL queries in Neon's SQL editor to set up RLS:

```sql
-- Enable pg_session_jwt extension
CREATE EXTENSION IF NOT EXISTS pg_session_jwt;

-- Grant permissions for existing tables
GRANT SELECT, UPDATE, INSERT, DELETE ON ALL TABLES
IN SCHEMA public
to authenticated;

GRANT SELECT, UPDATE, INSERT, DELETE ON ALL TABLES
IN SCHEMA public
to anonymous;

-- Grant permissions for future tables
ALTER DEFAULT PRIVILEGES
IN SCHEMA public
GRANT SELECT, UPDATE, INSERT, DELETE ON TABLES
TO authenticated;

ALTER DEFAULT PRIVILEGES
IN SCHEMA public
GRANT SELECT, UPDATE, INSERT, DELETE ON TABLES
TO anonymous;

-- Grant USAGE on public schema
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT USAGE ON SCHEMA public TO anonymous;
```

### Setting Up Schema and Migrations

1. Define your schema in the `db/schemas/` directory using Drizzle ORM syntax.
2. Generate and run migrations:

```bash
bun drizzle:generate
bun drizzle:migrate
```

## 📝 Working with CRUD Operations and RLS

### Defining Schemas with RLS

Define your database schema with RLS policies for secure access control:

```typescript
// db/schemas/todos.ts
import { InferSelectModel, sql } from "drizzle-orm";
import { authenticatedRole, authUid, crudPolicy } from "drizzle-orm/neon";
import { bigint, boolean, pgTable, text, timestamp } from "drizzle-orm/pg-core";

export const todos = pgTable(
  "todos",
  {
    id: bigint("id", { mode: "bigint" }).primaryKey().generatedByDefaultAsIdentity(),
    userId: text("user_id")
      .notNull()
      .default(sql`(auth.user_id())`),
    title: text("title").notNull(),
    description: text("description"),
    completed: boolean("completed").notNull().default(false),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
  },
  // Create RLS policy for the table
  (table) => [
    crudPolicy({
      role: authenticatedRole,
      read: authUid(table.userId),
      modify: authUid(table.userId),
    }),
  ]
);

export type Todo = InferSelectModel<typeof todos>;
```

### Creating CRUD Actions

Create actions for database operations that respect RLS policies:

```typescript
// db/actions/todos.ts
import { Todo, todos } from "@/db/schemas/todos";
import { eq } from "drizzle-orm";
import { getRlsDb, StackUser } from "../db";

export const getTodos = async (user: StackUser): Promise<Todo[]> => {
  const db = await getRlsDb(user);
  return await db.select().from(todos).where(eq(todos.userId, user.id));
};

export const createTodo = async (
  user: StackUser,
  data: {
    title: string;
    description?: string;
    completed?: boolean;
  }
): Promise<Todo> => {
  const db = await getRlsDb(user);
  const result = await db
    .insert(todos)
    .values({
      userId: user.id,
      title: data.title,
      description: data.description,
      completed: data.completed ?? false,
    })
    .returning();
  return result[0];
};

// Add more CRUD operations (update, delete, etc.)
```

### Connecting to the Database

The `db.ts` file sets up connections to your Neon database:

```typescript
// db/db.ts
export const getRlsDb = async (user: StackUser) => {
  const authToken = (await user?.getAuthJson())?.accessToken;
  const url = process.env.NEXT_PUBLIC_DATABASE_AUTHENTICATED_URL;

  // ... connection logic
};

export const getAdminDb = () => {
  const url = process.env.DATABASE_URL;
  // ... admin connection logic
};
```

## 💰 Setting Up Stripe

1. Create a [Stripe](https://stripe.com/) account
2. Get your API keys from the Stripe dashboard
3. Add them to your `.env.local` file:

```
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
```

### Creating Checkout Sessions

Use the `ButtonCheckout` component to create checkout sessions:

```jsx
<ButtonCheckout priceId="price_1R3RkHE8j0YIYCpCc7J0FuWX" mode="subscription" quantity={1}>
  Get Pro Plan (Monthly)
</ButtonCheckout>
```

### Handling Webhooks

The Stripe webhook handler is configured in `app/api/stripe/webhook/route.ts`. This handles:

- Checkout session completion
- Subscription updates
- Invoice payments
- And more

### Updating User Profiles on Purchase

When a user makes a purchase, update their profile with the subscription information:

```typescript
// In app/api/stripe/webhook/route.ts
switch (pricingCSC.mode) {
  case "payment":
    await updateProfileByUserId(userId, {
      customerId: customerId as string,
      priceId: priceIdCSC,
      lastOtpDate: new Date(),
      otpCredits: (profileCSC.otpCredits || 0) + (pricingCSC.otpCredits || 0),
    });
    break;
  case "subscription":
    await updateProfileByUserId(userId, {
      customerId: customerId as string,
      priceId: priceIdCSC,
      hasSub: true,
      initialSubDate: new Date(),
      subCredits: pricingCSC.otpCredits || 0,
    });
    break;
}
```

## 🔒 Creating Protected Routes

Use the middleware to protect routes:

```typescript
// middleware.ts
export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const user = await stackServerApp.getUser();

  // Check if the current path is in the protected domains list
  const isProtectedRoute = configFile.protectedDomains.some((domain) =>
    pathname.startsWith(domain)
  );

  if (isProtectedRoute) {
    if (!user) {
      return NextResponse.redirect(new URL("/handler/sign-in", request.url));
    }
  }
  return NextResponse.next();
}
```

Configure protected routes in `lib/config.ts`:

```typescript
export const configFile = {
  // ...
  protectedDomains: ["/dashboard"],
  // ...
};
```

## 🌐 Internationalization (i18n)

### Setting Up Multiple Languages

1. Create dictionary files for each language in the `dictionaries/` directory
2. Use the `DictionaryProvider` component to provide translations throughout your app

```jsx
// app/layout.tsx
<DictionaryProvider>
  <StackTheme>{children}</StackTheme>
</DictionaryProvider>
```

### Using Translations

Access translations in your components:

```jsx
"use client";

import { useDictionary } from "@/components/general/dictionary-provider";
import defaultTranslations from "@/dictionaries/en.json";
import type { Translations } from "@/lib/dictionaries";
import { fetchApi } from "@/lib/utils";
import { useEffect, useState } from "react";

export default function MyComponent() {
  const { locale } = useDictionary();
  const [translations, setTranslations] = useState<Translations>(defaultTranslations);

  useEffect(() => {
    if (locale === "en") return;

    const loadTranslations = async () => {
      const { data, error } = await fetchApi<Translations>("/api/dictionary", {
        params: { locale },
      });

      if (error) {
        console.error("Error loading translations:", error);
        return;
      }

      if (data) {
        setTranslations(data);
      }
    };

    loadTranslations();
  }, [locale]);

  return <h1>{translations.dashboard.title}</h1>;
}
```

### Switching Languages

Use the `DictionarySelector` component to let users switch languages:

```jsx
<DictionarySelector />
```

## 🔍 SEO and Metadata

Customize your site's metadata in `app/layout.tsx`:

```typescript
export const metadata: Metadata = {
  metadataBase: new URL(BASE_URL),
  title: "Your Site Title",
  description: "Your site description",
  alternates: {
    canonical: BASE_URL,
  },
  openGraph: {
    title: "Your Site Title",
    description: "Your site description",
    url: BASE_URL,
    type: "website",
    siteName: "Your Site Name",
    locale: "en_US",
    images: [
      {
        url: `${BASE_URL}/your-og-image.png`,
        width: 1200,
        height: 630,
        alt: "Your Site Preview",
        type: "image/jpeg",
        secureUrl: `${BASE_URL}/your-og-image.png`,
      },
    ],
  },
  icons: {
    apple: "/your-icon.png",
    icon: "/your-icon.ico",
  },
  other: {
    author: "Your Name",
    publisher: "Your Company",
    image: `${BASE_URL}/your-og-image.png`,
  },
};
```

Update the `BASE_URL` in `lib/config.ts` to match your production domain.

## 🧪 Utility Functions

The `lib/utils.ts` file provides several helpful utilities:

### Tailwind Class Merging

```typescript
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
```

### Error Handling

```typescript
export async function tryCatch<T, E = Error>(promise: Promise<T>): Promise<Result<T, E>> {
  try {
    return { data: await promise, error: null };
  } catch (error) {
    return { data: null, error: error as E };
  }
}
```

### API Fetching

```typescript
export async function fetchApi<T>(
  endpoint: string,
  options: FetchOptions = {}
): Promise<Result<T, ApiError>> {
  // ...fetch implementation
}
```

### BigInt Serialization

```typescript
export function serializeBigInt<T>(data: T): T {
  return JSON.parse(
    JSON.stringify(data, (_, value) => (typeof value === "bigint" ? value.toString() : value))
  );
}
```

### Date Formatting

```typescript
export function formatDate(date: Date | string): string {
  const d = new Date(date);
  return d.toLocaleDateString() + " " + d.toLocaleTimeString();
}
```

## 🔄 Making API Calls

### Client-Side

Use the `fetchApi` utility for type-safe API calls:

```typescript
import { fetchApi } from "@/lib/utils";

const { data, error } = await fetchApi<Translations>("/api/dictionary", {
  params: { locale },
});

if (error) {
  console.error("Error:", error.message);
  return;
}

if (data) {
  // Use the data
}
```

### API Routes

Create API routes in the `app/api` directory:

```typescript
// app/api/example/route.ts
import { NextRequest, NextResponse } from "next/server";
import { tryCatch } from "@/lib/utils";
import { stackServerApp } from "@/stack";

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const param = searchParams.get("param");

  // Get authenticated user
  const user = await stackServerApp.getUser();

  if (!user) {
    return new NextResponse(JSON.stringify({ error: "Unauthorized" }), {
      status: 401,
    });
  }

  const result = await tryCatch(yourAsyncFunction(param));

  if (result.error) {
    return NextResponse.json({ error: result.error.message }, { status: 500 });
  }

  return NextResponse.json(result.data);
}
```

## 📱 Building a CRUD Interface

### Creating a CRUD Component

Here's an example of how to build a CRUD interface for the todos feature:

1. **Create a list component**:

```jsx
// components/todo-list.tsx
"use client";

import { Todo } from "@/db/schemas/todos";
import { getTodos, createTodo, updateTodo, deleteTodo } from "@/db/actions/todos";
import { useEffect, useState } from "react";

export function TodoList({ user }) {
  const [todos, setTodos] = useState<Todo[]>([]);

  useEffect(() => {
    const loadTodos = async () => {
      const todosList = await getTodos(user);
      setTodos(todosList);
    };

    loadTodos();
  }, [user]);

  const handleCreateTodo = async (data) => {
    const newTodo = await createTodo(user, data);
    setTodos([...todos, newTodo]);
  };

  // Add update and delete handlers

  return (
    <div>
      {/* Todo creation form */}
      {/* Todo items list with edit/delete options */}
    </div>
  );
}
```

2. **Implement optimistic updates** for better UX:

```javascript
const handleDeleteTodo = async (id) => {
  // Store the original state
  const originalTodos = [...todos];

  // Optimistically update the UI
  setTodos(todos.filter((todo) => todo.id !== id));

  try {
    // Perform the actual delete
    const success = await deleteTodo(user, id);

    if (!success) {
      throw new Error("Failed to delete todo");
    }
  } catch (error) {
    // Restore the original state if there was an error
    setTodos(originalTodos);
    console.error(error);
  }
};
```

## 🧩 Project Structure

```
├── app/                       # Next.js App Router
│   ├── api/                   # API routes
│   ├── auth/                  # Auth pages
│   ├── dashboard/             # Dashboard pages
│   └── layout.tsx             # Root layout
├── components/                # React components
│   ├── dashboard/             # Dashboard components
│   ├── general/               # Shared components
│   ├── landing/               # Landing page components
│   └── ui/                    # UI components
├── db/                        # Database logic
│   ├── actions/               # Database operations
│   └── schemas/               # Database schemas
├── dictionaries/              # i18n translations
├── lib/                       # Shared utilities
│   ├── config.ts              # App configuration
│   ├── dictionaries.ts        # i18n setup
│   ├── stripe.ts              # Stripe helpers
│   └── utils.ts               # Utility functions
├── middleware.ts              # Next.js middleware
├── stack.ts                   # Stack Auth setup
└── .env.local                 # Environment variables
```

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🙏 Acknowledgments

- [Next.js](https://nextjs.org/) - React framework
- [Neon](https://neon.tech/) - Serverless PostgreSQL
- [Stack Auth](https://www.stack-auth.com/) - Authentication
- [Stripe](https://stripe.com/) - Payments
- [Drizzle ORM](https://orm.drizzle.team/) - Database ORM
- [Bun](https://bun.sh/) - JavaScript runtime
- [shadcn/ui](https://ui.shadcn.com/) - UI components
