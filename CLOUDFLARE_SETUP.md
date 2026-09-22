# Cloudflare Setup Guide

This project uses **Cloudflare Pages** for static site hosting and **Cloudflare Workers** for serverless API functions.

## Prerequisites

- Cloudflare Account (https://dash.cloudflare.com)
- Domain connected to Cloudflare (or use Cloudflare Pages subdomain)
- GitHub repository connected

## Step 1: Set Up Cloudflare Pages

### 1.1 Connect GitHub
1. Go to [Cloudflare Dashboard](https://dash.cloudflare.com)
2. Navigate to **Pages** → **Create a project**
3. Select **Connect to Git** → Authorize GitHub
4. Select `Future-of-Water-Intelligence` repository
5. Click **Begin Setup**

### 1.2 Configure Build Settings
- **Framework preset**: None (or detect automatically)
- **Build command**: `npm run build`
- **Build output directory**: `dist`
- **Root directory**: `/`
- **Environment variables**:
  ```
  NODE_VERSION=18
  ENVIRONMENT=production
  ```
- Click **Save and Deploy**

### 1.3 GitHub Secrets Setup
Add these secrets to your GitHub repository settings:

1. **CLOUDFLARE_API_TOKEN**
   - Go to Cloudflare Dashboard → **My Account** → **API Tokens**
   - Create Token → **Edit Cloudflare Workers** template
   - Copy token, add to GitHub Secrets

2. **CLOUDFLARE_ACCOUNT_ID**
   - Dashboard → **My Account** → Copy Account ID
   - Add to GitHub Secrets

---

## Step 2: Set Up Cloudflare Workers

### 2.1 Install Wrangler CLI
```bash
npm install -g wrangler
```

### 2.2 Authenticate with Cloudflare
```bash
wrangler login
```
Follow the browser prompt to authenticate.

### 2.3 Create KV Namespaces (Optional)
For caching/temporary storage:
```bash
wrangler kv:namespace create "CACHE"
wrangler kv:namespace create "CACHE" --preview
```

Update `wrangler.toml` with the namespace IDs returned.

### 2.4 Deploy Worker Locally
```bash
npm install
wrangler dev
```
Worker runs on `http://localhost:8787`

### 2.5 Deploy to Production
```bash
wrangler deploy
```

---

## Step 3: Connect Workers to Pages

In `wrangler.toml`, configure routes to proxy API calls to Workers:

```toml
[[routes]]
pattern = "example.com/api/*"
zone_name = "example.com"
```

---

## Worker API Endpoints

### POST `/api/contact`
Submit contact form
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "company": "Acme Corp",
  "phone": "+1-555-0000",
  "message": "I'm interested in NBOT technology"
}
```

### POST `/api/assessment`
Submit water assessment request
```json
{
  "location": "New York, NY",
  "waterType": "municipal",
  "flowRate": 5000,
  "contaminants": ["PFAS", "HAB"]
}
```

### GET `/api/health`
Health check
```json
{
  "status": "ok"
}
```

---

## Environment Variables

Set these in Cloudflare Pages dashboard or `wrangler.toml`:

- `ENVIRONMENT` - `development`, `staging`, or `production`
- `SENDGRID_API_KEY` - For email notifications (optional)
- `DATABASE_URL` - For D1 database connection (optional)

---

## Monitoring & Logs

### View Pages Deployment Logs
1. Cloudflare Dashboard → Pages → water-intelligence
2. Click **Deployments** tab
3. Select deployment → **View Build Log**

### View Worker Logs
```bash
wrangler tail
```

---

## Troubleshooting

### Pages Build Fails
1. Check build command: `npm run build`
2. Verify output directory exists
3. Check for environment variable issues

### Worker Not Responding
```bash
wrangler dev  # Test locally
wrangler deploy --upload-dir=dist  # Deploy
```

### CORS Issues
Worker automatically includes CORS headers for API routes. If issues persist, check browser console for specific error.

---

## Security Best Practices

- Never commit `.env` files or secrets
- Use Cloudflare API Tokens (not API Keys)
- Enable Two-Factor Authentication on Cloudflare account
- Keep Wrangler CLI updated: `npm install -g @cloudflare/wrangler@latest`

---

## Resources

- [Cloudflare Pages Docs](https://developers.cloudflare.com/pages/)
- [Cloudflare Workers Docs](https://developers.cloudflare.com/workers/)
- [Wrangler CLI](https://developers.cloudflare.com/workers/wrangler/)
- [KV Storage](https://developers.cloudflare.com/workers/runtime-apis/kv/)
