# Deployment Guide — SENTINEL Platform

## Quick Deploy (Recommended: Vercel + Render)

### Step 1: Deploy Backend on Render (Free)

1. Go to https://render.com and sign up/login with GitHub
2. Click "New +" → "Web Service"
3. Connect your GitHub repo: `nikhilsrikant/SENTINEL-AI-Flight-Readiness-Devil-s-Advocate`
4. Configure:
   - **Name**: `sentinel-api`
   - **Root Directory**: `backend`
   - **Runtime**: Python 3
   - **Build Command**: `pip install -r requirements.txt`
   - **Start Command**: `uvicorn backend.main:app --host 0.0.0.0 --port $PORT`
5. Add Environment Variables:
   - `GRANITE_MODE` = `mock`
   - `PYTHONPATH` = `/opt/render/project/src`
6. Click "Create Web Service"
7. Wait ~3 minutes for deployment
8. Copy your URL (e.g., `https://sentinel-api.onrender.com`)
9. Test: Visit `https://sentinel-api.onrender.com/api/v1/health`

### Step 2: Deploy Frontend on Vercel (Free)

1. Go to https://vercel.com and sign up/login with GitHub
2. Click "Add New..." → "Project"
3. Import your GitHub repo
4. Configure:
   - **Framework Preset**: Next.js
   - **Root Directory**: `frontend`
5. Add Environment Variable:
   - `NEXT_PUBLIC_API_URL` = `https://sentinel-api.onrender.com/api/v1`
6. Click "Deploy"
7. Wait ~2 minutes
8. Your app is live at `https://your-project.vercel.app`

### Step 3: Verify

- Visit your Vercel URL
- The Command Center should load with all 7 modules
- Click "Ask SENTINEL" chatbot — it should respond
- Try Cmd+K command palette
- Navigate to the Starliner Case Study

## Custom Domain (Optional)

Both Vercel and Render support free custom domains:
- Vercel: Settings → Domains → Add your domain
- Render: Settings → Custom Domain

## Environment Variables Reference

| Variable | Where | Value |
|----------|-------|-------|
| `GRANITE_MODE` | Render (backend) | `mock` |
| `PYTHONPATH` | Render (backend) | `/opt/render/project/src` |
| `NEXT_PUBLIC_API_URL` | Vercel (frontend) | Your Render backend URL + `/api/v1` |
| `WATSONX_API_KEY` | Render (optional) | Your IBM watsonx key for live AI |

## Troubleshooting

- **Backend 500 errors**: Check Render logs for Python import errors
- **Frontend can't connect to API**: Verify `NEXT_PUBLIC_API_URL` matches your Render URL
- **CORS errors**: The backend allows `*.vercel.app` origins by default
- **Slow first load**: Render free tier spins down after 15 min of inactivity; first request takes ~30s to cold start

## Alternative: Docker (Self-hosted)

```bash
git clone https://github.com/nikhilsrikant/SENTINEL-AI-Flight-Readiness-Devil-s-Advocate.git
cd SENTINEL-AI-Flight-Readiness-Devil-s-Advocate
docker-compose up --build
# Frontend: http://localhost:3000
# Backend: http://localhost:8000
```
