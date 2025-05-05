# Relivator Next.js eCommerce Starter

[🌐 Live Demo](https://relivator.com) • [💬 Join the Discord](https://discord.gg/Pb8uKbwpsJ) • [💖 Sponsor Development](https://github.com/sponsors/blefnk)

**Relivator** is a robust, production-ready eCommerce template built with Next.js. It's designed for developers who want a fast, modern, and scalable foundation without reinventing the backend.

## Features

- ⚡ **Framework:** Next.js 15.3 + React 19.1 + TypeScript 5.8  
- 🔐 **Auth:** First-class authentication with [Better Auth](https://better-auth.com)  
- 🗄️ **Database:** Typed PostgreSQL via [Drizzle ORM](https://orm.drizzle.team) & [Neon](https://neon.tech)
- 📄 **Forms:** Powered by schema-ready [TanStack Form](https://tanstack.com/form) *(🏗️ W.I.P)*  
- 💳 **Payments:** Integration with [Polar](https://polar.sh) *(🏗️ W.I.P)*  
- 📦 **Storage:** Smooth file uploads via [Uploadthing](https://uploadthing.com) *(🏗️ W.I.P)*  
- 🎨 **Styling:** [shadcn/ui](https://ui.shadcn.com) with Tailwind CSS 4.1  
- 🦄 **Motion:** Built-in [Anime.js](https://animejs.com) with a sample banner
- 📊 **Analytics:** Built-in optional [Vercel Analytics](https://vercel.com/docs/analytics)
- 🛠️ **DX Tools:** Preconfigured ESLint 9, [Biome](https://biomejs.dev), [Knip](https://knip.dev)  

## Quick Start

To get started:

1. Install [Git](https://git-scm.com), [Node.js](https://nodejs.org), and [Bun](https://bun.sh).
2. Run:

   ```bash
   git clone https://github.com/blefnk/relivator.git
   cd relivator
   bun install
   copy .env.example .env
   ```

3. Fill in the required environment variables in the `.env` file.
4. Run:

   ```bash
   bun dev # Start development server
   bun run build # Build production version
   ```

5. Edit something in the code manually or ask AI to help you.
6. Done. Seriously. You're building now.

<!-- 
2. Run:
   ```bash
   bun i -g @reliverse/cli
   reliverse cli
   ```
3. Select **"Create a new project"**.
4. Follow prompts to configure your store.
-->

### Commands

| Command         | Description                    |
|-----------------|--------------------------------|
| `bun dev`       | Start local development        |
| `bun build`     | Create a production build      |
| `bun latest`    | Sync all dependencies          |
| `bun ui`        | Add UI components              |
| `bun db:push`   | Apply DB schema changes        |
| `bun db:auth`   | Update auth-related tables     |
| `bun db:studio` | Open visual DB editor          |

## Docker Setup

You can run Relivator locally using Docker Compose for a fully containerized development or production environment.

### Requirements

- **Docker** and **Docker Compose** installed
- No local Node.js or PostgreSQL required (handled by containers)

### Project-specific Docker Details

- **Node.js version:** 22.14.0 (as specified in the Dockerfile)
- **pnpm version:** 10.4.1 (managed via corepack in the Dockerfile)
- **Database:** PostgreSQL (containerized, default user/password/db: `relivator`)
- **App port:** 3000 (Next.js default, exposed by the container)
- **Database port:** 5432 (PostgreSQL default, internal to Docker network)

### Environment Variables

- The app expects a `.env` file for configuration. Copy `.env.example` to `.env` and fill in required values before building.
- The Docker Compose file is preconfigured to use `.env` (uncomment the `env_file` line if you want to pass it automatically).

### Build & Run

1. Copy the example environment file:
   ```bash
   cp .env.example .env
   # Edit .env as needed
   ```
2. Build and start the stack:
   ```bash
   docker compose up --build
   ```
   This will build the Next.js app and start both the app and PostgreSQL containers.

3. Access the app at [http://localhost:3000](http://localhost:3000)

### Ports

| Service         | Port (host:container) |
|-----------------|----------------------|
| Next.js App     | 3000:3000            |
| PostgreSQL      | (internal:5432)      |

### Notes

- The app container is built for production and runs as a non-root user for security.
- The PostgreSQL container uses default credentials (`relivator`/`relivator`). Change these in `docker-compose.yml` and your `.env` for production.
- The app container depends on the database and will wait for it to be healthy before starting.
- If you need to persist database data, Docker Compose uses a named volume `pgdata` by default.

## Notes

- Relivator **1.4.0+** is AI-ready — optimized for AI-powered IDEs like Cursor, making onboarding effortless even for beginners.
- Version **1.3.0** evolved into **Versator**, featuring [Clerk](https://clerk.com) authentication and [Stripe](https://stripe.com) payments. Explore [Versator Demo](https://versator.relivator.com/en), [Repo](https://github.com/blefnk/versator), or [Docs](https://docs.reliverse.org/versator).

<!--
- ⚙️ **Instant setup**: Just run the CLI
- 🤖 **AI-Ready**: Optimized for tools like [Cursor](https://cursor.sh)
- 🧪 **Battle-tested stack**: Built for actual shipping, not just tutorial clout
- 💡 **Evolving fast**: Frequent updates, including Relivator's variants like [Versator](https://versator.relivator.com)
- -->

## Stand with Ukraine

- 💙 Help fund drones, medkits, and victory.
- 💛 Every dollar helps stop [russia's war crimes](https://war.ukraine.ua/russia-war-crimes) and saves lives.
- 👉 [Donate now](https://u24.gov.ua), it matters.

## Stand with Reliverse

- ⭐ [Star the repo](https://github.com/blefnk/relivator) to help Reliverse community grow.
- 💖 [Become a sponsor](https://github.com/sponsors/blefnk) and power the next wave of tools that *just feel right*.
- 🧑‍🚀 Every bit of support helps keep the dream alive: dev tools that don't suck.

> Built with love. Fueled by purpose. Running on caffeine.

### Current Sponsors

[<img src="https://avatars.githubusercontent.com/u/59529099?v=4" width="35" alt="Sponsor #1: mfpiano (Petro Melnyk)">](https://youtube.com/@mfpiano)
[<img src="https://avatars.githubusercontent.com/u/169331999?v=4" width="35" alt="Sponsor #2: devmarauda (Daniel Humphreys)">](https://github.com/devmarauda)
[<img src="https://avatars.githubusercontent.com/u/1137112?v=4" width="35" alt="Sponsor #3: svict4 (Simon Victory)">](https://github.com/svict4)
[<img src="https://avatars.githubusercontent.com/u/160747678?v=4" width="35" alt="Sponsor #4: Saif-V (Saif Al-Hashar)">](https://github.com/Saif-V)
[<img src="https://avatars.githubusercontent.com/u/69108920?v=4" width="35" alt="Sponsor #5: demiroo (Özkan Demir)">](https://github.com/demiroo)

## License

2025 MIT © [blefnk Nazar Kornienko](https://github.com/blefnk) & [Reliverse](https://github.com/reliverse)
