# Deployment Guide for cityvetsanpedro.me

## Problem
Your domain `cityvetsanpedro.me` is currently showing the README.md file instead of your website because GitHub Pages is serving from the repository root instead of your built frontend.

## Solution
I've created a GitHub Actions workflow that will automatically build and deploy your frontend to GitHub Pages.

## Steps to Fix

### 1. Enable GitHub Pages in Your Repository

1. Go to your GitHub repository: `https://github.com/<your-username>/Pawthos`
2. Click on **Settings** (in the repository menu)
3. Scroll down to **Pages** (in the left sidebar)
4. Under **Source**, select:
   - **Source**: `GitHub Actions`
   - (Do NOT select "Deploy from a branch")
5. Save the settings

### 2. Set Environment Variable (Optional but Recommended)

1. In your repository, go to **Settings** → **Secrets and variables** → **Actions**
2. Click **New repository secret**
3. Name: `REACT_APP_API_URL`
4. Value: `https://pawthoswebsite-production.up.railway.app`
5. Click **Add secret**

This ensures your frontend always uses the correct API URL in production.

### 3. Push the Changes

The workflow file (`.github/workflows/deploy-frontend.yml`) has been created. You need to:

```bash
git add .github/workflows/deploy-frontend.yml
git commit -m "Add GitHub Actions workflow for frontend deployment"
git push
```

### 4. Trigger the Deployment

After pushing:
1. Go to your repository on GitHub
2. Click on the **Actions** tab
3. You should see "Deploy Frontend to GitHub Pages" workflow
4. Click on it and then click **Run workflow** → **Run workflow** (if it doesn't start automatically)

### 5. Wait for Deployment

- The workflow will take 2-5 minutes to complete
- Once it shows a green checkmark, your site should be live
- Visit `https://cityvetsanpedro.me` - it should now show your website!

## Verify DNS Configuration

Make sure your domain DNS is correctly configured:

1. In your domain registrar (where you bought `cityvetsanpedro.me`), ensure you have:
   - **Type**: `CNAME`
   - **Name**: `@` (or leave blank)
   - **Value**: `<your-username>.github.io` (replace with your GitHub username)

2. The CNAME file in your repository root is already set correctly with `cityvetsanpedro.me`

## Troubleshooting

### If the site still shows README:
- Wait 5-10 minutes for DNS propagation
- Clear your browser cache (Ctrl+Shift+Delete)
- Try accessing in incognito mode
- Check GitHub Pages settings are set to "GitHub Actions" not "Deploy from a branch"

### If you see a 404 error:
- Check the Actions tab to see if the workflow completed successfully
- Verify the CNAME file exists in the repository root
- Make sure GitHub Pages is enabled in repository settings

### If the site loads but API calls fail:
- Check browser console for errors
- Verify `REACT_APP_API_URL` environment variable is set correctly
- The workflow uses the Railway API URL by default

## Manual Deployment (Alternative)

If you prefer not to use GitHub Actions, you can manually deploy:

1. Build the frontend locally:
   ```bash
   cd frontend
   npm install
   npm run build
   ```

2. Copy the build folder contents to a `docs` folder in the repository root:
   ```bash
   cp -r frontend/build/* docs/
   cp CNAME docs/
   ```

3. Commit and push:
   ```bash
   git add docs/
   git commit -m "Deploy frontend to docs folder"
   git push
   ```

4. In GitHub Settings → Pages, select:
   - **Source**: `Deploy from a branch`
   - **Branch**: `main` (or `master`)
   - **Folder**: `/docs`

However, the GitHub Actions approach is recommended as it automatically deploys on every push.

