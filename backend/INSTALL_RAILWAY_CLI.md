# Install Railway CLI - Quick Guide

## 🚨 Current Status
Railway CLI is not installed. You need to install it first before deploying.

---

## ✅ Installation Methods

### Method 1: PowerShell (Recommended)

**Run PowerShell as Administrator**, then:

```powershell
iwr https://railway.app/install.ps1 -useb | iex
```

After installation, **restart PowerShell** (or your terminal).

---

### Method 2: Using npm (Alternative)

If you have Node.js installed:

```powershell
npm install -g @railway/cli
```

---

### Method 3: Using Scoop (Alternative)

If you have Scoop package manager:

```powershell
scoop install railway
```

---

## ✅ Verify Installation

After installing and restarting your terminal:

```powershell
railway --version
```

You should see something like:
```
railway version 3.x.x
```

---

## 🚀 After Installation

Once Railway CLI is installed:

1. **Navigate to backend:**
   ```powershell
   cd "C:\Users\DELL\OneDrive - Polytechnic University of the Philippines\Documents\Pawthos\backend"
   ```

2. **Login to Railway:**
   ```powershell
   railway login
   ```
   (This opens your browser)

3. **Initialize project:**
   ```powershell
   railway init
   ```

4. **Add PostgreSQL:**
   ```powershell
   railway add
   ```
   Select "PostgreSQL"

5. **Set environment variables:**
   ```powershell
   # Generate secret key
   python -c "import secrets; print(secrets.token_urlsafe(32))"
   # Copy the output
   
   railway variables set SECRET_KEY="paste-your-generated-key-here"
   railway variables set SMTP_USER="your-email@gmail.com"
   railway variables set SMTP_PASS="your-app-password"
   railway variables set ENVIRONMENT="production"
   ```

6. **Run migrations:**
   ```powershell
   railway run alembic upgrade head
   ```

7. **Deploy:**
   ```powershell
   railway up
   ```

8. **Get your URL:**
   ```powershell
   railway domain
   ```

---

## 🔄 Configuration Status

✅ I've disabled `nixpacks.toml` so Railway will use auto-detection  
✅ Your `Procfile` is ready  
✅ Your `runtime.txt` specifies Python 3.10  
✅ Your `requirements.txt` has all dependencies  

Railway will now automatically:
- Detect it's a Python project
- Install dependencies from requirements.txt
- Use the start command from Procfile
- Handle pip installation correctly

---

## 🆘 Troubleshooting

### Issue: "railway: command not found" after installation

**Solution:** Restart PowerShell or your terminal completely.

### Issue: Installation blocked by execution policy

**Solution:** Run PowerShell as Administrator and set execution policy:
```powershell
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
```

Then try installing again.

### Issue: npm install fails

**Solution:** Install Node.js first from https://nodejs.org/

---

## 📋 Quick Summary

1. Install Railway CLI (Method 1 recommended)
2. Restart terminal
3. Verify: `railway --version`
4. Deploy: Follow steps above

---

## 🎯 Ready?

After installing Railway CLI, run:

```powershell
cd "C:\Users\DELL\OneDrive - Polytechnic University of the Philippines\Documents\Pawthos\backend"
railway login
railway init
```

Then follow the deployment steps from `DEPLOY_NOW.md`!

