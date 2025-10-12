# 🔧 Fixing Railway Build Errors

## Error: "pip: command not found"

This error occurs when Railway can't find pip during the build process.

---

## ✅ Solution 1: Use Updated Configuration (Already Applied)

I've updated your `nixpacks.toml` to use `python -m pip` instead of `pip`:

```toml
[phases.install]
cmds = ["python -m pip install --upgrade pip", "python -m pip install -r requirements.txt"]
```

**Try deploying again:**
```bash
railway up
```

---

## ✅ Solution 2: Let Railway Auto-Detect (Recommended)

Railway's automatic Python detection is often more reliable. Try this:

### Step 1: Temporarily Rename nixpacks.toml
```bash
# In your backend directory
mv nixpacks.toml nixpacks.toml.disabled
```

Or simply delete it - Railway will auto-detect Python from `requirements.txt`

### Step 2: Deploy Again
```bash
railway up
```

Railway will automatically:
- Detect Python project from `requirements.txt`
- Install correct Python version from `runtime.txt`
- Run `pip install -r requirements.txt`
- Use the start command from `Procfile`

---

## ✅ Solution 3: Simplified Nixpacks Config

If you want to keep nixpacks.toml, try this minimal version:

```toml
[phases.setup]
nixPkgs = ["python310"]

[start]
cmd = "uvicorn main:app --host 0.0.0.0 --port $PORT"
```

Save this in `nixpacks.toml` and deploy.

---

## ✅ Solution 4: Use Procfile Only

Railway can work with just the `Procfile`. Try this:

### Step 1: Remove/Rename nixpacks.toml
```bash
mv nixpacks.toml nixpacks.toml.backup
```

### Step 2: Ensure Procfile is correct
Your `Procfile` should contain:
```
web: uvicorn main:app --host 0.0.0.0 --port $PORT
```

### Step 3: Deploy
```bash
railway up
```

---

## ✅ Solution 5: Configure in Railway Dashboard

If CLI deployment fails, try configuring in the Railway Dashboard:

### Step 1: Remove Local Config Files (Optional)
```bash
rm nixpacks.toml  # or rename it
rm railway.json   # or rename it
```

### Step 2: Push to GitHub
```bash
git add .
git commit -m "Simplify Railway config"
git push origin main
```

### Step 3: Deploy via Railway Dashboard
1. Go to https://railway.app
2. Click your project
3. Go to Settings → Deploy
4. Set these values:
   - **Build Command**: Leave empty (auto-detect)
   - **Start Command**: `uvicorn main:app --host 0.0.0.0 --port $PORT`
   - **Root Directory**: `backend` (if monorepo)

### Step 4: Redeploy
Click "Deploy" → "Redeploy"

---

## 🔍 Debugging Build Issues

### Check Build Logs
```bash
railway logs --deployment
```

### Common Issues:

#### Issue 1: Wrong Python Version
**Symptoms**: Python version errors
**Fix**: Check `runtime.txt` has valid Python version
```
python-3.10.12
```

#### Issue 2: Large Dependencies Timeout
**Symptoms**: Build times out installing torch/opencv
**Fix**: Increase build timeout in Railway Dashboard (Settings → Deploy)

#### Issue 3: Missing System Dependencies
**Symptoms**: Error installing opencv-python or similar
**Fix**: Add system dependencies to nixpacks.toml:
```toml
[phases.setup]
nixPkgs = ["python310", "postgresql", "gcc", "glib", "opencv"]
```

#### Issue 4: Out of Memory
**Symptoms**: Killed during pip install
**Fix**: Use lighter dependencies or upgrade Railway plan

---

## 🎯 Recommended Quick Fix

**Try this order:**

### 1. First, try auto-detection (easiest):
```bash
cd backend
mv nixpacks.toml nixpacks.toml.backup
railway up
```

### 2. If that fails, restore nixpacks with fix:
```bash
mv nixpacks.toml.backup nixpacks.toml
# nixpacks.toml now uses "python -m pip"
railway up
```

### 3. If still failing, use dashboard method:
- Remove config files
- Push to GitHub
- Deploy via Railway Dashboard
- Set start command manually

---

## 📝 Current Configuration Status

Your files are now configured with:

✅ **`nixpacks.toml`**: Uses `python -m pip` (more reliable)
✅ **`railway.json`**: Simplified configuration
✅ **`Procfile`**: Correct start command
✅ **`runtime.txt`**: Python 3.10.12

---

## 🚀 Deploy Now

Try deploying with the updated config:

```bash
cd "C:\Users\DELL\OneDrive - Polytechnic University of the Philippines\Documents\Pawthos\backend"
railway up
```

If it still fails, try Solution 2 (auto-detection):

```bash
mv nixpacks.toml nixpacks.toml.disabled
railway up
```

---

## 💡 Understanding the Error

The error `pip: command not found` means:
- The `pip` command wasn't in the system PATH
- The virtual environment wasn't activated
- Pip wasn't installed with Python

**Why `python -m pip` works better:**
- It uses Python's module runner
- Doesn't rely on pip being in PATH
- More reliable across different environments

---

## 🆘 Still Not Working?

### Option A: Try Without Nixpacks
```bash
# Remove nixpacks.toml
rm nixpacks.toml

# Deploy
railway up
```

### Option B: Use Docker Instead
Create `Dockerfile`:
```dockerfile
FROM python:3.10-slim

WORKDIR /app

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

CMD uvicorn main:app --host 0.0.0.0 --port $PORT
```

Then deploy:
```bash
railway up
```

### Option C: Contact Railway Support
If nothing works:
1. Check Railway status: https://status.railway.app/
2. Ask on Discord: https://discord.gg/railway
3. Share your build logs

---

## ✅ Expected Success

After successful deployment, you should see:

```
✓ Build successful
✓ Deployment live at https://your-app.up.railway.app
```

Test it:
```bash
curl https://your-app.up.railway.app/health
```

Expected response:
```json
{"status": "healthy"}
```

---

## 📚 Additional Resources

- [Railway Python Docs](https://docs.railway.app/languages/python)
- [Nixpacks Python](https://nixpacks.com/docs/providers/python)
- [Railway Discord](https://discord.gg/railway)

---

**Try the updated configuration now and it should work!** 🚀

