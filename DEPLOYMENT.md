# AutoApply AI - Production Deployment Guide

## Backend (Railway)

### Prerequisites
1. Railway account (railway.app)
2. Railway CLI installed
3. Project token from Railway dashboard

### Deployment Steps

1. **Create Project on Railway:**
   ```bash
   cd /root/.openclaw/workspace/autoapply-backend
   railway login
   railway init --name autoapply-backend
   ```

2. **Add PostgreSQL Database:**
   - Go to Railway dashboard
   - Click "New" → "Database" → "Add PostgreSQL"
   - The DATABASE_URL will be automatically added to environment variables

3. **Set Environment Variables:**
   ```bash
   railway variables set NODE_ENV=production
   railway variables set PORT=3000
   railway variables set JWT_SECRET=$(openssl rand -base64 32)
   railway variables set JWT_EXPIRES_IN=7d
   railway variables set OPENAI_API_KEY=sk-your-openai-key
   railway variables set CORS_ORIGIN=https://your-vercel-domain.vercel.app
   ```

4. **Deploy:**
   ```bash
   railway up
   ```

5. **Run Migrations:**
   ```bash
   railway run npx prisma migrate deploy
   ```

6. **Get Domain:**
   ```bash
   railway domain
   ```

---

## Frontend (Vercel)

### Prerequisites
1. Vercel account (vercel.com)
2. Vercel CLI installed

### Deployment Steps

1. **Set Environment Variables:**
   ```bash
   cd /root/.openclaw/workspace/autoapply-frontend/my-app
   vercel --version
   ```

2. **Link Project:**
   ```bash
   vercel link
   ```

3. **Set Environment Variables:**
   ```bash
   vercel env add NEXT_PUBLIC_API_URL
   # Enter your Railway backend URL (e.g., https://autoapply-backend.up.railway.app)
   ```

4. **Deploy:**
   ```bash
   vercel --prod
   ```

---

## Environment Variables Reference

### Backend (.env)
```
NODE_ENV=production
PORT=3000
DATABASE_URL=postgresql://...
JWT_SECRET=your-jwt-secret-min-32-chars
JWT_EXPIRES_IN=7d
OPENAI_API_KEY=sk-...
CORS_ORIGIN=https://your-frontend-domain.vercel.app
```

### Frontend (.env.local)
```
NEXT_PUBLIC_API_URL=https://your-backend-domain.railway.app
```

---

## CI/CD (Optional)

Configure GitHub Actions for automatic deployment:

1. Add `RAILWAY_TOKEN` to GitHub Secrets
2. Add `VERCEL_TOKEN` to GitHub Secrets
3. Push to main branch triggers deployment

---

## Testing Production Endpoints

```bash
# Health check
curl https://your-backend.railway.app/health

# API test
curl https://your-backend.railway.app/api/jobs
```

---

## Troubleshooting

| Issue | Solution |
|-------|----------|
| Build fails | Check Node version (18+ required) |
| Database connection | Verify DATABASE_URL format |
| CORS errors | Update CORS_ORIGIN to match frontend URL |
| JWT errors | Ensure JWT_SECRET is 32+ characters |
