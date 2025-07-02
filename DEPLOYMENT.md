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