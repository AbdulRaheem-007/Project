# Support Tickets App (Next.js + Supabase)

A small, complete full‑stack app for DevOps pipeline labs. It uses Next.js (pages router), Next.js API routes, and Supabase (Postgres + Auth). It demonstrates CRUD for a simple customer support ticket system.

Screens included (4-5+):
- Home dashboard (stats by status)
- Tickets list (read, delete)
- New ticket (create)
- Edit ticket (update/delete)
- Admin board (filter + update status)
- Auth page (email/password sign in/out)

## Tech
- Next.js 14 (pages router) + API routes
- Supabase JS SDK (PostgreSQL + Auth)
- Ready for local run, Docker, and Kubernetes (AKS)

---

## 1) Prerequisites
- Node.js 18+
- Supabase project (free tier is fine)

## 2) Environment variables
Copy `.env.example` to `.env` and fill values:

```
NEXT_PUBLIC_SUPABASE_URL=https://<your-project>.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=<your-anon-key>
# Optional but recommended for server API routes if you keep RLS strict
SUPABASE_SERVICE_ROLE_KEY=<service-role-key>
```

Note: Never expose `SUPABASE_SERVICE_ROLE_KEY` to the browser. We only read it on the server (API routes).

## 3) Supabase database setup
Run the SQL below in the Supabase SQL editor to create the `tickets` table and minimal RLS policies for demo use.

```sql
-- Table
create table if not exists public.tickets (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text not null,
  status text not null default 'New',
  user_id uuid null references auth.users(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Updated at trigger
create extension if not exists pgcrypto;
create or replace function public.set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists set_tickets_updated_at on public.tickets;
create trigger set_tickets_updated_at
before update on public.tickets
for each row execute function public.set_updated_at();

-- Enable RLS
alter table public.tickets enable row level security;

-- DEMO policies (simplified). For tighter security, scope by user_id.
create policy "tickets_read_all" on public.tickets for select using (true);
create policy "tickets_insert_all" on public.tickets for insert with check (true);
create policy "tickets_update_all" on public.tickets for update using (true);
create policy "tickets_delete_all" on public.tickets for delete using (true);
```

Optionally, change policies to enforce ownership:
- On insert, set `user_id = auth.uid()` via a trigger or client; then policies use `user_id = auth.uid()`.

### Auth
Enable Email + Password provider in Supabase Auth settings to use the `/auth` page. This app does not require sign-in to use tickets in demo mode, but you can extend the policies to require it.

## 4) Install and run locally

```
npm install
npm run dev
```
Open http://localhost:3000

## 5) Project structure
```
.
├─ components/
├─ lib/
├─ pages/
│  ├─ api/tickets/
│  ├─ tickets/
│  ├─ _app.js
│  ├─ index.js
│  ├─ admin.js
│  └─ auth.js
├─ public/
├─ styles/
├─ .env.example
├─ Dockerfile
├─ .dockerignore
├─ package.json
└─ README.md
```

## 6) API
- GET `/api/tickets` → list
- POST `/api/tickets` → create `{ title, description, status }`
- GET `/api/tickets/:id` → read
- PUT `/api/tickets/:id` → update any of `{ title, description, status }`
- DELETE `/api/tickets/:id` → delete

These routes talk to Supabase directly using server credentials.

## 7) Docker
Build and run locally:

```
docker build -t your-dockerhub-username/support-tickets-app:latest .
docker run -p 3000:3000 --env-file .env your-dockerhub-username/support-tickets-app:latest
```

Push to Docker Hub:
```
docker login
docker push your-dockerhub-username/support-tickets-app:latest
```

## 8) Kubernetes (AKS) quick start
Update image name and env values, then apply manifests in `k8s/`.

```
kubectl apply -f k8s/deployment.yaml
kubectl apply -f k8s/service.yaml
```

Example manifests use environment variables from a `Secret` or inline. For production, store Supabase keys in a Secret.

## 9) Enhancements to try (lab ideas)
- Add pagination and search
- Require auth and scope tickets by `user_id`
- Add labels/priority and filtering
- Add webhooks to send notifications on status change
- Add tests and CI/CD workflow
