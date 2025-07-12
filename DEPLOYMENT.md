# 🚀 Deployment Guide: Azure Static Web Apps

## Prerequisites
- Azure account with subscription
- GitHub repository with your code
- HEALRAG backend already deployed (`https://healrag-security.azurewebsites.net`)

## Option 1: Azure Static Web Apps (Recommended)

### Step 1: Create Azure Static Web App

1. **Go to Azure Portal** → Create a resource → Search "Static Web App"

2. **Fill in the details:**
   - **Subscription**: Your Azure subscription
   - **Resource Group**: Create new or use existing
   - **Name**: `healrag-frontend` (or your preferred name)
   - **Plan type**: Free (for development) or Standard (for production)
   - **Region**: Choose closest to your users
   - **Source**: GitHub
   - **GitHub Account**: Authorize Azure to access your GitHub
   - **Organization**: Your GitHub username/organization
   - **Repository**: Your repository name
   - **Branch**: `main`
   - **Build Presets**: React
   - **App location**: `/frontend_healrag`
   - **API location**: (leave empty)
   - **Output location**: `dist`

3. **Click "Review + Create"** → **Create**

### Step 2: Configure Environment Variables

In Azure Portal, go to your Static Web App → Configuration → Environment variables:

Add these variables:
```
VITE_HEALRAG_BACKEND_URL = https://healrag-security.azurewebsites.net
VITE_AZURE_CLIENT_ID = ca956c53-f360-4005-9191-35dc3fa3c1d3
```

### Step 3: Update GitHub Secrets

In your GitHub repository → Settings → Secrets and variables → Actions:

Add these secrets:
```
AZURE_STATIC_WEB_APPS_API_TOKEN = (automatically created by Azure)
VITE_HEALRAG_BACKEND_URL = https://healrag-security.azurewebsites.net
VITE_AZURE_CLIENT_ID = ca956c53-f360-4005-9191-35dc3fa3c1d3
```

### Step 4: Update Azure AD Redirect URI

1. Go to **Azure AD** → **App registrations** → Your frontend app
2. **Authentication** → **Redirect URIs**
3. Add your new Static Web App URL:
   ```
   https://your-app-name.azurestaticapps.net
   ```

### Step 5: Update Backend CORS

Update your backend's CORS configuration to include your new frontend URL:
```python
allow_origins=[
    "https://healrag-security.azurewebsites.net",
    "https://your-app-name.azurestaticapps.net",  # Add this
    "http://localhost:3000",
    "http://127.0.0.1:3000"
],
```

## Option 2: Azure App Service (Alternative)

If you prefer App Service, here's a Dockerfile:

### Create Dockerfile
```dockerfile
# Build stage
FROM node:18-alpine AS build

WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production

COPY . .
RUN npm run build

# Production stage
FROM nginx:alpine

# Copy built app
COPY --from=build /app/dist /usr/share/nginx/html

# Copy nginx configuration for SPA
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

### Create nginx.conf
```nginx
server {
    listen 80;
    location / {
        root /usr/share/nginx/html;
        index index.html index.htm;
        try_files $uri $uri/ /index.html;
    }
}
```

## 🔧 Troubleshooting

### Common Issues:

1. **Build fails**: Check Node.js version (use 18+)
2. **Authentication errors**: Verify redirect URIs in Azure AD
3. **CORS errors**: Ensure backend allows your frontend domain
4. **Environment variables**: Make sure they're set in both Azure and GitHub

### Testing Deployment:

1. Check browser console for errors
2. Test authentication flow
3. Verify API calls to backend
4. Test chat history functionality

## 📱 Custom Domain (Optional)

1. In Azure Static Web App → Custom domains
2. Add your domain
3. Configure DNS records as shown
4. Update Azure AD redirect URIs to include custom domain

## 🔒 Security Considerations

- Use HTTPS only in production
- Verify all redirect URIs in Azure AD
- Ensure backend CORS is properly configured
- Monitor authentication logs

## 📊 Monitoring

- Enable Application Insights in Azure
- Monitor performance and errors
- Set up alerts for critical issues

# HEALRAG Frontend Deployment Guide

This guide walks you through deploying the HEALRAG frontend to Azure Static Web Apps with GitHub Actions.

## ✅ Deployment Checklist

### 1. Azure App Registration Setup
- [ ] Create Azure AD App Registration named "HEALRAG Security Assistant"
- [ ] Configure redirect URIs (frontend and backend URLs)
- [ ] Enable access tokens and ID tokens
- [ ] Add Microsoft Graph User.Read permission
- [ ] Create client secret (save the value!)
- [ ] Note the Application (client) ID

### 2. GitHub Repository Setup
- [ ] Add GitHub secrets:
  - [ ] `AZURE_STATIC_WEB_APPS_API_TOKEN` (from Azure)
  - [ ] `VITE_HEALRAG_BACKEND_URL` (your backend URL)
  - [ ] `VITE_AZURE_CLIENT_ID` (from app registration)
- [ ] Verify GitHub Actions workflow exists (`.github/workflows/azure-static-web-apps.yml`)

### 3. Azure Static Web App Creation
- [ ] Create Azure Static Web App resource
- [ ] Choose Standard plan (for environment variables)
- [ ] Set correct build configuration:
  - [ ] App location: `/`
  - [ ] Output location: `dist`
  - [ ] API location: (empty)
- [ ] Add environment variables in Azure portal

### 4. Backend CORS Configuration
- [ ] Add your Static Web App URL to backend CORS settings
- [ ] Verify backend endpoints are accessible
- [ ] Test authentication flow end-to-end

### 5. DNS and Final Configuration
- [ ] Configure custom domain (optional)
- [ ] Update Azure AD redirect URIs with final URL
- [ ] Test complete authentication and chat functionality

## 🚀 Quick Deploy Commands

```bash
# 1. Clone repository
git clone <your-repo-url>
cd frontend_healrag

# 2. Set up local environment
echo "VITE_HEALRAG_BACKEND_URL=http://localhost:8000" > .env.local
echo "VITE_AZURE_CLIENT_ID=your-client-id-here" >> .env.local

# 3. Test locally
npm install
npm run dev

# 4. Deploy via GitHub Actions
git add .
git commit -m "Deploy to Azure Static Web Apps"
git push origin main
```

## 📋 Environment Variables Reference

### Required GitHub Secrets
```bash
AZURE_STATIC_WEB_APPS_API_TOKEN=your-deployment-token-here
VITE_HEALRAG_BACKEND_URL=https://healrag-security.azurewebsites.net
VITE_AZURE_CLIENT_ID=ca956c53-f360-4005-9191-35dc3fa3c1d3
```

### Required Azure Environment Variables
```bash
VITE_HEALRAG_BACKEND_URL=https://healrag-security.azurewebsites.net
VITE_AZURE_CLIENT_ID=ca956c53-f360-4005-9191-35dc3fa3c1d3
```

### Local Development (.env.local)
```bash
VITE_HEALRAG_BACKEND_URL=http://localhost:8000
VITE_AZURE_CLIENT_ID=ca956c53-f360-4005-9191-35dc3fa3c1d3
VITE_DEBUG_MODE=true
```

## 🔧 Azure Portal Configuration Steps

### Static Web App Creation
1. Go to Azure Portal → Create Resource → Static Web App
2. **Basics**:
   - Subscription: Choose your subscription
   - Resource Group: Create new or select existing
   - Name: `healrag-frontend`
   - Plan type: `Standard`
   - Region: `East US 2` (same as backend)
3. **Deployment**:
   - Source: `Other` (for manual deployment token)
   - OR `GitHub` (for automatic integration)
4. **Build**:
   - Build presets: `Custom`
   - App location: `/`
   - API location: (leave empty)
   - Output location: `dist`

### Environment Variables Setup
1. Go to your Static Web App → Configuration
2. Click "Environment variables"
3. Add each variable:
   - Name: `VITE_HEALRAG_BACKEND_URL`
   - Value: `https://healrag-security.azurewebsites.net`
   - Click "Add"
   - Name: `VITE_AZURE_CLIENT_ID`
   - Value: `ca956c53-f360-4005-9191-35dc3fa3c1d3`
   - Click "Add"
4. Click "Save"

## 🛠️ Troubleshooting Common Issues

### Issue: Blank page after deployment
**Symptoms**: Build succeeds but page shows blank
**Solutions**:
- Check browser console for JavaScript errors
- Verify environment variables are set correctly
- Ensure React imports are properly configured
- Check `staticwebapp.config.json` for CSP restrictions

### Issue: Authentication not working
**Symptoms**: Login redirect fails or token errors
**Solutions**:
- Verify Azure AD client ID matches exactly
- Check redirect URIs in app registration
- Ensure backend CORS allows your frontend domain
- Test backend auth endpoints directly

### Issue: API calls failing
**Symptoms**: Network errors or 401/403 responses
**Solutions**:
- Verify backend URL is correct and accessible
- Check if authentication token is being sent
- Confirm backend CORS configuration
- Test endpoints with Postman/curl

### Issue: GitHub Actions build failing
**Symptoms**: Build errors in Actions tab
**Solutions**:
- Check all required secrets are set
- Verify Node.js version compatibility
- Review build logs for specific errors
- Ensure package.json scripts are correct

## 📚 Additional Resources

- [Azure Static Web Apps Documentation](https://docs.microsoft.com/en-us/azure/static-web-apps/)
- [Azure AD App Registration Guide](https://docs.microsoft.com/en-us/azure/active-directory/develop/quickstart-register-app)
- [GitHub Actions for Azure](https://docs.github.com/en/actions/deployment/deploying-to-azure)
- [Vite Build Configuration](https://vitejs.dev/config/)

## 🎯 Success Verification

After deployment, verify these work:
- [ ] Frontend loads at your Azure Static Web App URL
- [ ] Login button redirects to Azure AD
- [ ] Authentication completes and returns to app
- [ ] Chat interface accepts messages
- [ ] Backend API calls work (check Network tab)
- [ ] Session history loads correctly
- [ ] Settings panel functions properly

## 🆘 Getting Help

If you encounter issues:
1. Check the troubleshooting section above
2. Review browser console errors
3. Check Azure portal logs
4. Verify all configuration values match
5. Test individual components (auth, API, etc.) 