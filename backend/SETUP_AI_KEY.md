# AI API Key Setup Instructions

## API Key
```
AIzaSyB3XDsEqilYW6BefX4SzOWYgC_dKyputmk
```

## Local Development Setup

### Option 1: Create .env file (Recommended)
1. In the `backend` folder, create a file named `.env`
2. Add the following content:
```env
AI_API_KEY=AIzaSyB3XDsEqilYW6BefX4SzOWYgC_dKyputmk
SECRET_KEY=sYIjB_9LQSAWKqs-70Dxhk2ASS3Rq1rf3L4wdMbpGRw
DATABASE_URL=sqlite:///./pawthos.db
ENVIRONMENT=development
```

### Option 2: Set Environment Variable Directly
**Windows (PowerShell):**
```powershell
$env:AI_API_KEY="AIzaSyB3XDsEqilYW6BefX4SzOWYgC_dKyputmk"
```

**Windows (Command Prompt):**
```cmd
set AI_API_KEY=AIzaSyB3XDsEqilYW6BefX4SzOWYgC_dKyputmk
```

**Linux/Mac:**
```bash
export AI_API_KEY=AIzaSyB3XDsEqilYW6BefX4SzOWYgC_dKyputmk
```

## Railway Deployment Setup

### Method 1: Using Railway Dashboard (Easiest)
1. Go to https://railway.app
2. Select your project: `pawthoswebsite-production`
3. Click on your backend service
4. Go to the **Variables** tab
5. Click **+ New Variable**
6. Add:
   - **Variable Name**: `AI_API_KEY`
   - **Value**: `AIzaSyB3XDsEqilYW6BefX4SzOWYgC_dKyputmk`
7. Click **Add**
8. Railway will automatically redeploy with the new variable

### Method 2: Using Railway CLI
```bash
railway variables set AI_API_KEY=AIzaSyB3XDsEqilYW6BefX4SzOWYgC_dKyputmk
```

## Verify Setup

### Local Testing
After setting up locally, restart your backend server and check the logs. You should see:
```
✅ AI_API_KEY loaded: AIzaSyB3X...
✅ Enhanced AI processing configured successfully
✅ AI service loaded and available
```

### Railway Testing
1. Check Railway logs after deployment
2. Look for the same success messages
3. Test the pain assessment feature in your app
4. The 503 error should be gone!

## Troubleshooting

If you still see 503 errors:
1. **Check Railway logs** - Look for AI service initialization messages
2. **Verify variable name** - Must be exactly `AI_API_KEY` (case-sensitive)
3. **Check requirements.txt** - Make sure `google-generativeai>=0.3.2` is uncommented
4. **Redeploy** - Railway should auto-redeploy, but you can manually trigger it

## Security Note
- The `.env` file is already in `.gitignore` - it won't be committed to git
- Never commit API keys to version control
- Railway variables are encrypted and secure

