# Connect Vercel Frontend to Railway Backend

## ✅ Backend Successfully Deployed!

Your Railway backend is live at: `https://your-app.railway.app`

---

## 🔗 Connect Frontend to Backend

### Step 1: Get Your Railway Backend URL

1. Go to Railway Dashboard
2. Click your backend service
3. Go to **Settings → Networking**
4. Copy your public URL:
   ```
   https://pawthos-backend-production-xxxxx.up.railway.app
   ```

---

### Step 2: Update Vercel Environment Variables

#### Go to Vercel Dashboard:

1. Open [vercel.com](https://vercel.com)
2. Click your **frontend project**
3. Go to **Settings → Environment Variables**

#### Add/Update These Variables:

**For Create React App:**
```
REACT_APP_API_URL = https://your-railway-url.railway.app
```

**For Vite:**
```
VITE_API_URL = https://your-railway-url.railway.app
```

**For Next.js:**
```
NEXT_PUBLIC_API_URL = https://your-railway-url.railway.app
```

Select environments: **Production**, **Preview**, **Development**

#### Click "Save"

---

### Step 3: Redeploy Frontend

After adding environment variables:

1. Go to **Deployments** tab
2. Click ︙ (three dots) on latest deployment
3. Click **Redeploy**
4. Wait for deployment to complete (~1-2 minutes)

---

### Step 4: Update CORS in Backend (Optional but Recommended)

For security, add your Vercel URL to backend CORS:

#### Edit `main.py`:

Find the CORS configuration and add your Vercel URL:

```python
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000", 
        "https://your-frontend.vercel.app",  # Add your actual Vercel URL
        "*"  # Remove this in production
    ],
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allow_headers=["*"],
    expose_headers=["*"],
)
```

Replace `https://your-frontend.vercel.app` with your actual Vercel URL.

#### Commit and Push:

```bash
git add backend/main.py
git commit -m "Add Vercel frontend URL to CORS"
git push origin main
```

Railway will auto-redeploy.

---

## 🧪 Test the Connection

### 1. Open Your Frontend

Visit your Vercel URL: `https://your-frontend.vercel.app`

### 2. Open Browser Console

Press `F12` → Console tab

### 3. Check for API Calls

You should see successful API calls to your Railway backend:
```
✓ GET https://your-railway-url.railway.app/api/...
```

### 4. Test Login/Features

Try logging in or using features that call the backend.

---

## 🔍 Troubleshooting

### Issue: CORS Error in Browser Console

**Error:**
```
Access to fetch at 'https://railway-url...' from origin 'https://vercel-url...' 
has been blocked by CORS policy
```

**Solution:**
1. Add your Vercel URL to backend CORS (Step 4 above)
2. Redeploy backend
3. Hard refresh frontend (Ctrl+Shift+R)

### Issue: "Failed to fetch" or Network Error

**Causes:**
1. Backend is not running
2. Wrong API URL in frontend
3. Backend requires authentication

**Solutions:**
- Check backend is live: `https://your-railway-url.railway.app/health`
- Verify API URL in Vercel environment variables
- Check if endpoint requires auth token

### Issue: 401 Unauthorized

**Cause:** Missing or invalid authentication token

**Solution:**
- Make sure frontend includes JWT token in requests:
  ```javascript
  headers: {
    'Authorization': `Bearer ${token}`
  }
  ```

### Issue: Environment Variable Not Working

**Solution:**
1. Make sure variable name matches what's used in code
2. Redeploy after adding variables (they don't apply automatically)
3. Check variable is available: `console.log(process.env.REACT_APP_API_URL)`

---

## 📋 Complete Setup Checklist

### Backend (Railway):
- [x] Build successful
- [ ] Domain generated
- [ ] Environment variables set (SECRET_KEY, SMTP_USER, SMTP_PASS, ENVIRONMENT)
- [ ] PostgreSQL database added
- [ ] Migrations run (if needed)
- [ ] Health endpoint working: `/health`
- [ ] API docs accessible: `/docs`
- [ ] CORS includes Vercel URL

### Frontend (Vercel):
- [ ] API URL environment variable added
- [ ] Redeployed after adding variable
- [ ] Site loads without errors
- [ ] API calls working
- [ ] Authentication working
- [ ] All features working

---

## 🎯 Quick Test Commands

### Test Backend:
```bash
# Health check
curl https://your-railway-url.railway.app/health

# Test CORS
curl -H "Origin: https://your-vercel-url.vercel.app" \
  -H "Access-Control-Request-Method: GET" \
  -H "Access-Control-Request-Headers: Content-Type" \
  -X OPTIONS \
  https://your-railway-url.railway.app/api/some-endpoint
```

### Test Frontend:
1. Open: `https://your-vercel-url.vercel.app`
2. Open DevTools (F12) → Network tab
3. Try a feature that calls the API
4. Check if requests go to Railway URL and return 200 OK

---

## 📝 Common Frontend API Configuration Patterns

### React with Axios:

```typescript
// src/api/axios.ts
import axios from 'axios';

const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL || 'http://localhost:8000',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add auth token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;
```

### React with Fetch:

```typescript
// src/api/client.ts
const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000';

export const apiClient = {
  async get(endpoint: string) {
    const token = localStorage.getItem('token');
    const response = await fetch(`${API_URL}${endpoint}`, {
      headers: {
        'Authorization': token ? `Bearer ${token}` : '',
      },
    });
    return response.json();
  },
  
  async post(endpoint: string, data: any) {
    const token = localStorage.getItem('token');
    const response = await fetch(`${API_URL}${endpoint}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': token ? `Bearer ${token}` : '',
      },
      body: JSON.stringify(data),
    });
    return response.json();
  },
};
```

---

## 🎉 You're Done!

Your setup:
- ✅ Backend: Railway (FastAPI)
- ✅ Frontend: Vercel (React)
- ✅ Database: Railway PostgreSQL
- ✅ Both deployed and connected

**Next:** Test all features end-to-end!

---

## 🔗 Useful Links

- **Railway Dashboard**: https://railway.app/dashboard
- **Vercel Dashboard**: https://vercel.com/dashboard
- **Backend API Docs**: `https://your-railway-url.railway.app/docs`
- **Frontend**: `https://your-vercel-url.vercel.app`

Need help? Check the Railway and Vercel logs for any errors!

