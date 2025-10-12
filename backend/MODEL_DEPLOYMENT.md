# Deploying ML Models to Railway 🤖

## 🚨 Important: Model Files

Your `.gitignore` currently excludes model files:
```
*.pth
*.pkl
models/*.pth
eld/*.pkl
```

For Railway deployment, you need to **include these files** in your repository or use Git LFS.

---

## Option 1: Use Git LFS (Recommended) ⭐

Git LFS (Large File Storage) is perfect for your large ML models.

### Step 1: Install Git LFS
```bash
# Windows (using Chocolatey)
choco install git-lfs

# Or download from: https://git-lfs.github.com/
```

### Step 2: Initialize Git LFS
```bash
cd "C:\Users\DELL\OneDrive - Polytechnic University of the Philippines\Documents\Pawthos"
git lfs install
```

### Step 3: Track Model Files
```bash
git lfs track "*.pth"
git lfs track "*.pkl"
git lfs track "backend/models/*.pth"
git lfs track "backend/eld/*.pkl"
```

This creates `.gitattributes` file.

### Step 4: Update .gitignore
Remove these lines from `.gitignore`:
```
# Remove these:
*.pth
*.pkl
models/*.pth
eld/*.pkl
```

### Step 5: Add and Commit Models
```bash
git add .gitattributes
git add backend/models/best_efficientnet_model.pth
git add backend/eld/eld_pain_model.pkl
git add backend/models/haarcascade_frontalcatface_extended.xml
git commit -m "Add ML models via Git LFS"
git push origin main
```

### Step 6: Deploy to Railway
```bash
cd backend
railway init
railway add --database postgresql
railway up
```

Railway automatically handles Git LFS!

---

## Option 2: Upload Models After Deployment

If you don't want models in Git:

### Step 1: Deploy Without Models
```bash
railway up
```

### Step 2: Upload Models Using Railway CLI
```bash
# Shell into your Railway container
railway shell

# From another terminal, copy models
# (This requires setting up SSH or using Railway volume mounts)
```

**⚠️ Complex**: This approach is more difficult.

---

## Option 3: Download Models from Cloud Storage

Store models in cloud storage and download at startup.

### Step 1: Upload Models to Cloud
```bash
# Example: AWS S3
aws s3 cp backend/models/best_efficientnet_model.pth s3://your-bucket/models/
aws s3 cp backend/eld/eld_pain_model.pkl s3://your-bucket/models/
```

### Step 2: Modify Model Loading Code

**Update `services/ai_service.py` and `eld/eld_model.py`:**

```python
import os
import requests
from pathlib import Path

def download_model(url, local_path):
    """Download model if not exists"""
    if os.path.exists(local_path):
        return local_path
    
    print(f"Downloading model from {url}...")
    os.makedirs(os.path.dirname(local_path), exist_ok=True)
    
    response = requests.get(url, stream=True)
    with open(local_path, 'wb') as f:
        for chunk in response.iter_content(chunk_size=8192):
            f.write(chunk)
    
    print(f"Model downloaded to {local_path}")
    return local_path

# Load PyTorch model
MODEL_URL = os.getenv("MODEL_URL", "https://your-storage.com/model.pth")
MODEL_PATH = download_model(MODEL_URL, "models/best_efficientnet_model.pth")
model = torch.load(MODEL_PATH)
```

### Step 3: Add Environment Variables
```bash
railway variables set MODEL_URL="https://your-s3-bucket.s3.amazonaws.com/models/best_efficientnet_model.pth"
railway variables set ELD_MODEL_URL="https://your-s3-bucket.s3.amazonaws.com/models/eld_pain_model.pkl"
```

**⚠️ Downside**: Slow first startup, higher complexity.

---

## 🎯 Recommended Approach

**Use Git LFS (Option 1)** because:

✅ **Simple**: Models are in your repository  
✅ **Automatic**: Railway handles everything  
✅ **Fast**: Models included in deployment  
✅ **Reliable**: No external dependencies  
✅ **No cost**: Git LFS is free for repos under 1GB  

---

## 📊 Model File Sizes

Your current models:
```
backend/models/best_efficientnet_model.pth          ~95-150 MB
backend/eld/eld_pain_model.pkl                      ~1-5 MB
backend/models/haarcascade_frontalcatface_extended.xml  ~1 MB
Total:                                              ~100-160 MB
```

Git LFS handles these perfectly!

---

## 🚀 Quick Setup with Git LFS

Complete commands:

```bash
# 1. Install Git LFS (if not installed)
git lfs install

# 2. Track model files
git lfs track "*.pth"
git lfs track "*.pkl"
git lfs track "*.xml"

# 3. Update .gitignore (remove model exclusions)
# Edit .gitignore to remove:
#   *.pth
#   *.pkl
#   models/*.pth
#   eld/*.pkl

# 4. Add files
git add .gitattributes
git add backend/models/
git add backend/eld/*.pkl
git commit -m "Add ML models via Git LFS"
git push origin main

# 5. Deploy to Railway
cd backend
railway init
railway add --database postgresql
railway variables set SECRET_KEY="..."
railway variables set SMTP_USER="..."
railway variables set SMTP_PASS="..."
railway variables set ENVIRONMENT="production"
railway up
```

Done! 🎉

---

## ⚠️ If Models Are Already Committed

If you already committed large models without Git LFS, clean up Git history:

```bash
# Install BFG Repo Cleaner
# Download from: https://rtyley.github.io/bfg-repo-cleaner/

# Remove large files from history
java -jar bfg.jar --delete-files '*.pth'
java -jar bfg.jar --delete-files '*.pkl'

# Clean up
git reflog expire --expire=now --all
git gc --prune=now --aggressive

# Now use Git LFS
git lfs install
git lfs track "*.pth"
git lfs track "*.pkl"

# Re-add models
git add backend/models/
git commit -m "Add models via Git LFS"
git push origin main --force
```

---

## 🔍 Verify Git LFS Setup

```bash
# Check LFS tracking
git lfs track

# Should show:
#   *.pth (.gitattributes)
#   *.pkl (.gitattributes)

# Check LFS files
git lfs ls-files

# Should list your model files
```

---

## 📦 Alternative: Model Version Control

For better model management:

### Option: DVC (Data Version Control)
```bash
pip install dvc
dvc init

# Track models
dvc add backend/models/best_efficientnet_model.pth
dvc add backend/eld/eld_pain_model.pkl

# Push to remote storage
dvc remote add -d storage s3://mybucket/dvcstore
dvc push

# Pull in production
railway run dvc pull
```

**⚠️ More complex**: Only needed for ML teams with frequent model updates.

---

## ✅ Checklist

Before deploying:

- [ ] Choose approach (Git LFS recommended)
- [ ] Install Git LFS (if using)
- [ ] Track model files with Git LFS
- [ ] Update .gitignore to allow model files
- [ ] Commit and push models
- [ ] Verify models are in repository
- [ ] Deploy to Railway
- [ ] Test AI prediction endpoints

---

## 🎓 Summary

**Best for Pawthos:**
1. Use Git LFS
2. Track `*.pth` and `*.pkl` files
3. Commit models to repository
4. Deploy normally to Railway

**Total setup time: 5 minutes**

See `DEPLOY_NOW.md` for complete deployment instructions!

