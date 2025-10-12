# Re-Enable AI Features

## 🤖 AI Features Currently Disabled

To reduce deployment size and stay under Railway's 4GB limit, AI/ML features are temporarily disabled.

---

## ✅ What's Disabled

- `/api/predict` - Pain assessment endpoint
- `/api/predict-eld` - ELD prediction endpoint
- PyTorch dependencies (~2GB)
- OpenCV dependencies (~90MB)
- Model files (not loaded)

---

## 🔄 How to Re-Enable AI

When you're ready to use AI features again:

### Step 1: Uncomment Dependencies in `requirements.txt`

Edit `requirements.txt` and uncomment these lines:

```txt
# AI/ML Dependencies - DISABLED FOR NOW
# Uncomment these when you're ready to enable AI features
numpy==1.24.3
torch==2.1.0+cpu --extra-index-url https://download.pytorch.org/whl/cpu
torchvision==0.16.0+cpu --extra-index-url https://download.pytorch.org/whl/cpu
efficientnet-pytorch==0.7.1
Pillow==10.1.0
opencv-python-headless==4.8.1.78
scikit-learn==1.3.2
joblib==1.3.2
```

Remove the `#` from each line.

### Step 2: Uncomment AI Router in `main.py`

Edit `main.py` and uncomment these lines:

**Near the top (imports):**
```python
# AI features temporarily disabled to reduce deployment size
from routers import ai_predictions
```

**In the middle (router includes):**
```python
# AI predictions temporarily disabled to reduce deployment size
app.include_router(ai_predictions.router, prefix="/api")  # Mobile: /api/predict, /api/predict-eld
```

### Step 3: Commit and Push

```bash
git add .
git commit -m "Re-enable AI features"
git push origin main
```

Railway will automatically redeploy with AI features enabled.

---

## ⚠️ Important Notes

### Image Size Will Increase
- With AI disabled: ~300-500 MB
- With AI enabled: ~1.5-2.0 GB

Both are under Railway's 4GB limit!

### Build Time Will Increase
- With AI disabled: 2-3 minutes
- With AI enabled: 5-10 minutes (downloading PyTorch)

### Consider Railway Pro
If you need faster AI inference or GPU:
- Railway Pro offers GPU instances
- You can switch to full CUDA PyTorch
- Better for high-traffic AI apps

---

## 🎯 Alternative: Separate AI Service

Instead of re-enabling on main backend, consider:

### Option 1: Separate Railway Service
- Create a second Railway service just for AI
- Keep main API lightweight
- AI service handles `/predict` endpoints
- Main service proxies AI requests

### Option 2: Serverless AI
- Use Replicate.com for ML inference
- Use Hugging Face Inference API
- Use AWS Lambda with EFS for models

### Option 3: Mobile-Side AI
- Run pain assessment on mobile devices
- Use TensorFlow Lite or Core ML
- No backend AI needed
- Faster and more private

---

## 📊 Current Backend Features (Without AI)

Still available:
- ✅ User authentication
- ✅ Pet management
- ✅ Appointments
- ✅ Vaccination records
- ✅ Medical records
- ✅ Reports and alerts
- ✅ File uploads
- ✅ Email notifications
- ✅ All admin features

Not available:
- ❌ `/api/predict` - Pain assessment
- ❌ `/api/predict-eld` - ELD prediction

---

## 🚀 Quick Re-Enable Commands

```bash
# 1. Edit files (uncomment AI sections)
code requirements.txt
code main.py

# 2. Commit and push
git add requirements.txt main.py
git commit -m "Re-enable AI features"
git push origin main

# 3. Railway auto-deploys (wait 5-10 minutes)

# 4. Test AI endpoint
curl -X POST https://your-app.railway.app/api/predict \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -F "file=@cat_image.jpg"
```

---

## 💡 When to Re-Enable

**Enable AI when:**
- You have Railway Pro (more resources)
- You need the AI features in production
- Image size is no longer a concern
- You've optimized models further

**Keep AI disabled if:**
- Backend is only for web dashboard (no AI needed)
- Mobile app handles AI locally
- You're using external AI service
- Keeping costs low is priority

---

## ✅ Current Deployment

**Status**: AI features disabled
**Image size**: ~300-500 MB
**Build time**: 2-3 minutes
**All other features**: Working perfectly

When you need AI, just follow the steps above! 🚀

