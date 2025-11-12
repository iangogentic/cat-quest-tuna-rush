# AutoBuild Rules

## Your Mission
Build a complete, production-ready application from the PRD autonomously.

## Workflow

### 1. Setup Phase
- Create standard project structure (src/, tests/, docs/)
- Initialize package.json or equivalent
- Set up git repository with .gitignore
- Install core dependencies

### 2. Planning Phase
- Read docs/PRD.md thoroughly
- Create TASKS.md with detailed checklist
- Order tasks: setup → database → backend → frontend → tests → deploy
- Use TodoWrite tool to create task list

### 3. Building Phase
For each task:
- Mark as in_progress before starting
- Use appropriate MCPs (Neon for DB, etc.)
- Write clean, documented code
- Run tests after changes
- Only mark completed when tests pass

### 4. Testing Phase
- Write unit tests for utilities
- Write integration tests for APIs
- Write E2E tests with Playwright
- Ensure 100% critical path coverage

### 5. Deployment Phase
- Set up Neon PostgreSQL database
- Push to GitHub
- Deploy to Vercel
- Verify production deployment works

### 6. Documentation Phase
- Create README.md with setup instructions
- Document environment variables needed
- Create DONE.md with:
  - Deployed URL
  - Database connection info
  - Login credentials (if applicable)
  - Known limitations
  - Next steps for user

## Available MCPs
- **Neon**: Database creation (use for PostgreSQL)
- **GitHub**: Repo management
- **Playwright**: Browser testing
- **Filesystem**: File operations
- **Postgres**: Database queries

## Tech Stack Preferences
- **Frontend**: Next.js 14+ with App Router, TypeScript
- **Styling**: Tailwind CSS v3+
- **Database**: Neon PostgreSQL
- **ORM**: Prisma or Drizzle
- **Auth**: Better Auth (autonomous setup, no external credentials needed)
- **Deployment**: Vercel
- **Testing**: Playwright (E2E), Jest (unit)

Adapt based on PRD requirements.

### Why Better Auth?
Better Auth is the default because it requires ZERO external credentials:
- No Clerk API keys needed
- No OAuth provider setup required
- Only needs database connection (already have from Neon)
- Secret key auto-generated with OpenSSL
- 100% autonomous setup - builds complete without user intervention

### Setting Up Better Auth (Autonomous)

When PRD requires authentication, follow these steps:

1. **Install Better Auth**:
   ```bash
   npm install better-auth
   ```

2. **Generate Secret Key** (autonomous - no user input needed):
   ```bash
   openssl rand -base64 32
   ```
   Add to `.env.local`:
   ```
   BETTER_AUTH_SECRET=<generated-secret>
   ```

3. **Create Auth Configuration** (`lib/auth.ts`):
   ```typescript
   import { betterAuth } from "better-auth";

   export const auth = betterAuth({
     database: {
       provider: "postgres",
       url: process.env.DATABASE_URL,  // From Neon
     },
     emailAndPassword: {
       enabled: true,
     },
     secret: process.env.BETTER_AUTH_SECRET,
   });
   ```

4. **Create API Route** (`app/api/auth/[...all]/route.ts`):
   ```typescript
   import { auth } from "@/lib/auth";
   import { toNextJsHandler } from "better-auth/next-js";

   export const { GET, POST } = toNextJsHandler(auth);
   ```

5. **Create Auth Tables** (Better Auth CLI):
   ```bash
   npx @better-auth/cli@latest generate
   npx @better-auth/cli@latest migrate
   ```

6. **Build Login/Signup UI** using Better Auth hooks

7. **Test Authentication Flow**:
   - Create account
   - Login
   - Protected routes

**No credential requests needed!** The build will complete 100% autonomously.

## 🗄️ Database Setup Instructions

**IMPORTANT**: DATABASE_URL should already be provisioned by AutoPRD.

### If DATABASE_URL exists in .env.local:
1. ✅ **Use it directly** - AutoPRD already created the database
2. ✅ **Verify it works** - Test connection before building schema
3. ✅ **Don't try to create another database**

### If DATABASE_URL is missing or placeholder:
1. ❌ **DO NOT try to import MCP tools in project code**
2. ❌ **DO NOT create TypeScript files that call MCPs**
3. ✅ **Create BLOCKED.md** explaining database is needed
4. ✅ **Stop the build** - don't mark tasks complete

**Why you can't call MCPs from project code:**
- MCPs only work in AutoPRD build environment
- MCPs are NOT npm packages
- Generated code cannot access MCP tools
- If setup failed, create BLOCKED.md and stop

### Example BLOCKED.md:
```markdown
# Build Blocked: Database Required

## Issue
DATABASE_URL environment variable is missing or contains placeholder value.

## What's Needed
A real Neon PostgreSQL database connection string.

## How to Resolve
1. Create database manually via Neon CLI or web console
2. Add connection string to .env.local:
   ```
   DATABASE_URL=postgresql://user:pass@host.neon.tech/dbname
   ```
3. Restart build with "Continue Build" button
```

### Detecting Blockers

Create BLOCKED.md when:
- ❌ Required environment variable is missing
- ❌ Required environment variable contains placeholder like `your-xxx-here`
- ❌ Database connection fails (test before building schema)
- ❌ External service credentials needed for core features

Do NOT create BLOCKED.md for:
- ✅ Optional features that can be mocked
- ✅ Services that have free tiers with auto-signup
- ✅ Features that can be implemented without external dependencies


## 🎨 Asset Generation Instructions

AutoPRD includes AI-powered asset generation that can create logos, hero images, icons, and other visual assets for your project.

### How It Works

1. **Automatic Detection**: During build, AutoPRD scans your PRD for mentions of:
   - Logos ("app logo", "company logo", "brand logo")
   - Hero images ("hero image", "hero banner", "landing page image")
   - Icons ("app icon", "favicon", "feature icons")
   - Other visual assets

2. **Pre-Generation**: Assets are generated BEFORE Claude starts building:
   - Generated using Gemini 2.5 Flash (fast and cost-effective)
   - Saved to `public/assets/generated/` directory
   - Manifest created at `public/assets/generated/assets-manifest.json`
   - Cache enabled to avoid regenerating identical assets

3. **Asset Manifest Structure**:
   ```json
   {
     "generatedAt": "2025-01-11T10:30:00Z",
     "assets": [
       {
         "id": "logo-1",
         "type": "logo",
         "name": "Logo",
         "description": "App logo",
         "publicPath": "/assets/generated/logo-1.png",
         "dimensions": { "width": 512, "height": 512 },
         "format": "png",
         "cached": false
       }
     ],
     "totalCost": 0.15,
     "cacheStats": { "hits": 2, "misses": 3 }
   }
   ```

### Using Generated Assets in Your Code

When building the project, you should:

1. **Check for generated assets**:
   ```javascript
   // Read the manifest to see what's available
   const manifest = require('./public/assets/generated/assets-manifest.json');
   const logo = manifest.assets.find(a => a.type === 'logo');
   ```

2. **Import from correct path**:
   ```jsx
   // Next.js example
   import Image from 'next/image';

   export default function Header() {
     return (
       <Image
         src="/assets/generated/logo-1.png"
         alt="App Logo"
         width={512}
         height={512}
       />
     );
   }
   ```

3. **Fallback to placeholders** if no assets generated:
   ```jsx
   const logoPath = manifest?.assets?.find(a => a.type === 'logo')?.publicPath
     || '/placeholder-logo.png';
   ```

### Asset Types and Sizes

| Type | Default Size | Format | Use Case |
|------|-------------|--------|----------|
| `logo` | 512x512 | PNG | App logo, branding |
| `hero` | 1920x1080 | PNG/JPG | Landing page hero |
| `icon` | 192x192 | PNG | Favicons, app icons |
| `feature-icon` | 256x256 | PNG/SVG | Feature illustrations |
| `og-image` | 1200x630 | PNG | Social sharing |

### Cache Behavior

- Assets are cached by prompt + dimensions + style hash
- Cache location: `~/.autoprd-cache/assets/`
- Identical requests use cached assets (zero cost)
- Cache persists across builds
- Manually clear: Delete `~/.autoprd-cache/` folder

### Cost Tracking

- Gemini 2.5 Flash pricing: ~$0.05 per image
- Typical project: 3-5 assets = $0.15-$0.25
- Cached assets = $0.00
- Cost displayed in build logs

### Important Notes

- ✅ **Always check manifest exists** before importing assets
- ✅ **Use relative paths** from public directory (`/assets/generated/...`)
- ✅ **Provide fallbacks** for missing assets
- ✅ **Assets are gitignored** - they're regenerated per build
- ❌ **Don't hardcode asset IDs** - they may change between builds
- ❌ **Don't assume specific formats** - check manifest for actual format

### Example: Complete Implementation

```jsx
// components/Header.jsx
import Image from 'next/image';
import { useState, useEffect } from 'react';

export default function Header() {
  const [logo, setLogo] = useState(null);

  useEffect(() => {
    // Load asset manifest
    fetch('/assets/generated/assets-manifest.json')
      .then(res => res.json())
      .then(manifest => {
        const logoAsset = manifest.assets.find(a => a.type === 'logo');
        setLogo(logoAsset);
      })
      .catch(() => {
        // Fallback if no assets generated
        console.warn('No generated assets found');
      });
  }, []);

  return (
    <header>
      {logo ? (
        <Image
          src={logo.publicPath}
          alt={logo.description}
          width={logo.dimensions.width}
          height={logo.dimensions.height}
        />
      ) : (
        <div className="placeholder-logo">Logo</div>
      )}
    </header>
  );
}
```

## Rules

### Code Quality
- Use TypeScript with strict mode
- Follow ESLint rules
- Use meaningful variable names
- Add JSDoc comments for complex functions
- Keep functions small and focused

### Security
- Never commit secrets or API keys
- Use environment variables via .env.local
- Validate all user input
- Sanitize database queries
- Use HTTPS only in production

### Testing
- Tests must pass before marking task complete
- Write tests before marking task done
- Include happy path and error cases
- Mock external APIs

### Git Practices
- Commit after each completed task
- Use conventional commits: feat:, fix:, test:, docs:
- Don't commit node_modules, .env files, or build artifacts

### When Blocked
If you need credentials, API keys, or user input:
1. **First, try to work around the blocker**:
   - Use mock data or placeholder implementations
   - Skip optional features that require credentials
   - Focus on features that don't need external services
2. **Only create BLOCKED.md if truly stuck on REQUIRED features**:
   - Document what credentials are needed
   - Explain why they're required for core functionality
   - Mark affected tasks as blocked (not completed)
3. **Continue working on unblocked tasks**:
   - Don't exit just because one feature is blocked
   - Implement ALL features that don't require credentials
   - Return to blocked tasks after completing others
4. **Exit only when**:
   - 100% of tasks are complete, OR
   - All remaining tasks are blocked by external dependencies

## Error Recovery
- If a command fails, try alternative approach
- If tests fail, debug and fix before proceeding
- If deployment fails, document steps in BLOCKED.md

## Completion Criteria
Build is complete when:
- ✅ **100% of tasks marked completed** (not just core tasks - ALL tasks from TodoWrite)
- ✅ All tests passing (unit + integration + browser)
- ✅ **Environment variables properly configured** (no placeholder values)
- ✅ **Application starts without errors** (runtime validation passes)
- ✅ **Browser tests pass** (pages load, no console errors, critical flows work)
- ✅ **All PRD features fully implemented** (not just code structure/schemas - working implementations)
- ✅ Deployed to production (if applicable)
- ✅ DONE.md created with deployment info
- ✅ **No BLOCKED.md with required items** (blockers must be resolved or worked around)

**IMPORTANT COMPLETION RULES**:
1. **Do NOT exit if < 90% of tasks are completed** - keep working on remaining features
2. **Environment variables must be real values** - placeholder values = incomplete build
3. **Application must start and run** - compilation success ≠ runtime success
4. **Browser must load pages without errors** - user-facing validation required
5. **Creating code structure ≠ implementing features** - stubs and schemas don't count as complete
6. **BLOCKED.md with required items = build is NOT complete** - resolve blockers or implement without credentials
7. **"Pending features" in DONE.md = build is NOT complete** - implement them or remove from scope
8. **No placeholder environment values** - all env vars must be real, working values
9. **Build passing ≠ project complete** - deployment and full functionality required

## Validation Layers

The build goes through 5 validation layers before completion:

1. **Layer 1: Environment** (Pre-build)
   - Check .env.local exists
   - Verify no placeholder values (e.g., `your-xxx-here`, `PLACEHOLDER`)
   - Validate against .env.example
   - Test database connection if DATABASE_URL present

2. **Layer 2: Build** (Compilation)
   - Code compiles/transpiles
   - Tests pass
   - Lint checks pass

3. **Layer 3: Runtime** (Server startup)
   - Dev server starts successfully with `npm run dev` or `npm start`
   - No errors in logs for 30+ seconds
   - Health endpoint responds
   - **IMPORTANT**: Keep dev server running - do NOT stop it after validation
   - AutoPRD's live preview panel needs the server to stay running

4. **Layer 4: Browser** (User experience)
   - Pages load without errors
   - No console errors
   - Critical flows work

5. **Layer 5: Documentation**
   - README.md complete
   - DONE.md accurate
   - No outstanding BLOCKED items

## Final Step: Start Dev Server for Live Preview

After ALL validation layers pass and build is 100% complete:

1. **Start the development server**:
   ```bash
   npm run dev
   # OR
   npm start
   ```

2. **Verify server starts successfully**:
   - Watch for "ready - started server" or "Local: http://localhost:XXXX"
   - No errors in startup logs
   - Server stays running (don't stop it)

3. **Leave server running**:
   - Do NOT stop the dev server after validation
   - AutoPRD's live preview panel will connect automatically
   - User will see their app building in real-time
   - Let AutoPRD handle cleanup when user closes the build

4. **What happens next**:
   - AutoPRD detects the dev server output
   - Live preview panel appears automatically
   - User sees the app running at http://localhost:XXXX
   - Build is complete but server keeps running for preview

**IMPORTANT**: Only start the dev server after:
- ✅ All tasks completed
- ✅ All tests passing
- ✅ All validation layers passed
- ✅ DONE.md created

Starting dev server = final action, not a mid-build step.

Work autonomously, be thorough, and build something great!
## 🗄️ Database Setup Instructions

**IMPORTANT**: For PostgreSQL databases, use the **Neon MCP tool** instead of asking for DATABASE_URL.

To create a database:
1. Use `mcp__neon__create_project` to create a new Neon database
2. The tool will return a connection string automatically
3. Add the connection string to `.env.local` as `DATABASE_URL`
4. Continue with your schema setup using Prisma or Drizzle

**Do NOT** create placeholder DATABASE_URL values - always use Neon MCP tool.

## 🔐 Authentication Setup Instructions

**IMPORTANT**: For authentication, use **Better Auth CLI** (NOT Clerk, NOT Auth0, NOT Supabase Auth).

**Why Better Auth?**
- ✅ **Zero external credentials needed** - 100% autonomous setup
- ✅ **Database-only authentication** - uses existing Neon PostgreSQL
- ✅ **Auto-generates secrets** - uses OpenSSL, no manual input
- ✅ **Built-in email/password** - no OAuth providers required
- ✅ **Production-ready** - secure, modern, TypeScript-first

**Setup Steps:**
1. Install: `npm install better-auth`
2. Initialize: `npx @better-auth/cli init`
3. Generate secret: `npx @better-auth/cli secret` (auto-adds to .env.local)
4. Run migrations: `npx @better-auth/cli migrate`
5. Configure with DATABASE_URL from Neon MCP

**Do NOT** ask user for auth provider credentials - Better Auth handles everything locally.

## 📧 Email Sending Instructions

**IMPORTANT**: Resend MCP is pre-configured on this machine for email sending.

**Use Resend MCP for all email operations:**
- Send emails via MCP: `mcp__resend__send_email`
- No API key needed in project - MCP handles authentication
- Perfect for: password resets, email verification, magic links, transactional emails
- Free tier: 3,000 emails/month

**Better Auth Email Integration Example:**
```typescript
// In your Better Auth config
emailVerification: {
  sendVerificationEmail: async ({ user, url }) => {
    await callMCPTool('mcp__resend__send_email', {
      to: user.email,
      from: 'noreply@yourdomain.com',
      subject: 'Verify your email',
      html: \`<p>Click here to verify: <a href="${url}">${url}</a></p>\`
    });
  }
}
```

**Password Reset Example:**
```typescript
forgetPassword: {
  sendResetEmail: async ({ user, url }) => {
    await callMCPTool('mcp__resend__send_email', {
      to: user.email,
      from: 'noreply@yourdomain.com',
      subject: 'Reset your password',
      html: \`<p>Click here to reset: <a href="${url}">${url}</a></p>\`
    });
  }
}
```

**Important Notes:**
- Use your own domain for `from` address (or onboarding@resend.dev for testing)
- MCP tool is called via code-executor: `await callMCPTool('mcp__resend__send_email', {...})`
- All authentication is handled by MCP - no credentials needed in project
- Enable email verification and password reset features with confidence

**Do NOT** ask user for email service credentials - Resend MCP is already configured.

## 🐙 GitHub & Version Control Instructions

**IMPORTANT**: GitHub CLI (`gh`) is already authenticated on this machine.

**Use `gh` CLI for all GitHub operations:**
- Create repo: `gh repo create <name> --public --source=. --remote=origin`
- Push code: `git add . && git commit -m "message" && git push`
- Create PR: `gh pr create --title "Title" --body "Description"`
- View repo: `gh repo view --web`

**Do NOT** ask user for GitHub tokens or credentials - `gh` is already authenticated.

## 🚀 Deployment Instructions

**IMPORTANT**: Vercel CLI is already authenticated on this machine.

**Use Vercel CLI for deployments:**
- Deploy to production: `vercel --prod`
- Deploy to preview: `vercel`
- Set environment variables: `vercel env add DATABASE_URL` (then paste value)
- View deployment: `vercel ls`
- Open in browser: `vercel --prod --open`

**Environment Variables for Vercel:**
When deploying, add these environment variables to Vercel:
1. `DATABASE_URL` - from Neon MCP (production connection string)
2. `BETTER_AUTH_SECRET` - from `npx @better-auth/cli secret`
3. Any other API keys from the credentials section above

**Do NOT** ask user for Vercel tokens - CLI is already authenticated.

## 📋 Autonomous Build Summary

**This project has access to the following pre-authenticated tools:**

| Tool | Purpose | Command Example |
|------|---------|------------------|
| **Neon MCP** | PostgreSQL Database | `mcp__neon__create_project` |
| **Resend MCP** | Email Sending | `mcp__resend__send_email` |
| **Better Auth CLI** | Authentication | `npx @better-auth/cli init` |
| **GitHub CLI** | Version Control | `gh repo create my-app --public` |
| **Vercel CLI** | Deployment | `vercel --prod` |

**Build projects that are:**
- ✅ Fully functional with database
- ✅ Secure authentication with email verification
- ✅ Email sending for password resets and notifications
- ✅ Pushed to GitHub repository
- ✅ Deployed to production on Vercel

**All without asking the user for any credentials!**

