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

instalar bun
entrar en el repo
hacer bun i
hacer bun dev

1. Crear cuenta en stackauth
2. Crear proyecto con solo google y magic link
   2.1. Ir a domains y activar los localhost callbacks for development
3. Copiar credenciales de nextjs y ponerlas en el .env.local
4. Ir a project setting y copiar el jwks url
5. Ir a neondb > settings > rls y poner el jwks copaido en setup auth provider
6. Ir a neondb > sql editor y poner lo siguiente paso a paso, asegurarse que todo esta puesto
7. Copiar las credenciales que hay en el tutorial de la derecha, sin hacer caso a las consultas sql, las ejecutaremos luego
8. Copia las credenciales y ponlas en el .env.local, y al DATABASE*AUTHENTICATED_URL le pones delante NEXT_PUBLIC*, quedaria NEXT_PUBLIC_DATABASE_AUTHENTICATED_URL

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

7. Hacer bun drizzle:gm
