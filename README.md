# HEALRAG Security Assistant Frontend

This is a React TypeScript frontend application for the HEALRAG (Health Risk Assessment Language Retrieval Augmented Generation) system. It provides a modern, secure chat interface for interacting with AI-powered security policy assistance.

## ✨ Latest Features & Improvements

### 🔗 Citation System (v2.0)
- **Clickable Citations**: Citations like `[Cyber & Information Security Policy.md]` are now clickable numbered links
- **Azure Blob Storage Integration**: Secure document access via backend proxy with SAS authentication
- **Real-time Document Viewer**: View markdown files and documents directly in the right panel
- **Enhanced UX**: Close button for citation panel, improved responsive design
- **Source Attribution**: Proper filename extraction and display from Azure blob storage paths

### 🛡️ Security Enhancements
- **Backend Proxy**: Secure file access without exposing storage account keys to frontend
- **CORS Resolution**: Proper handling of cross-origin requests for document access
- **SAS Token Management**: Server-side SAS URL generation for secure blob access

## Features

- **Azure AD Authentication**: Secure authentication with Azure Active Directory
- **Chat Interface**: Multi-turn conversation support with session history
- **Document Search**: RAG-powered document retrieval and analysis
- **Interactive Citations**: Clickable document citations with instant preview
- **Session Management**: Persistent chat history with CosmoDB integration
- **Responsive Design**: Mobile-friendly interface optimized for security workflows
- **Point32 Branding**: Custom UI with Point32 Health branding
- **Real-time Streaming**: Streaming responses for better user experience
- **Temperature Control**: Adjustable AI response creativity settings
- **Azure Blob Storage**: Secure document storage and retrieval system

## 🚀 Deployment Setup

### Current Production Deployment
- **Azure Static Web App**: https://blue-dune-0ef76e10f2.azurestaticapps.net
- **Backend API**: https://p32h-d-securitypolicies-rag-openai.azurewebsites.net
- **Document Storage**: Azure Blob Storage (point32data/security-documents)

### Azure App Registration

1. **Create Azure AD App Registration**:
   - Go to Azure Portal → Azure Active Directory → App registrations
   - Click "New registration"
   - Name: `HEALRAG Security Assistant`
   - Supported account types: `Accounts in this organizational directory only`
   - Redirect URI: `Web` → `https://blue-dune-0ef76e10f2.azurestaticapps.net`

2. **Configure Authentication**:
   - Go to Authentication → Add platform → Web
   - Add redirect URIs:
     - `https://p32h-d-securitypolicies-rag-openai.azurewebsites.net/auth/callback`
     - `https://blue-dune-0ef76e10f2.azurestaticapps.net`
   - Enable "Access tokens" and "ID tokens"
   - Set logout URL: `https://blue-dune-0ef76e10f2.azurestaticapps.net`

3. **API Permissions**:
   - Add `Microsoft Graph` → `User.Read` (delegated)
   - Grant admin consent

4. **Certificates & Secrets**:
   - Create a new client secret (note the value - you'll need it for backend configuration)

### Azure Blob Storage Configuration

For citation document access, configure these environment variables:

#### Backend Environment Variables
```bash
# Azure Storage Configuration (Backend)
AZURE_STORAGE_CONNECTION_STRING=DefaultEndpointsProtocol=https;AccountName=point32data;AccountKey=...
AZURE_CONTAINER_NAME=security-documents
```

#### Frontend Environment Variables
```bash
# Azure Storage Configuration (Frontend - for display purposes)
VITE_AZURE_STORAGE_ACCOUNT_NAME=point32data
VITE_AZURE_CONTAINER_NAME=security-documents
```

### GitHub Secrets Setup

Add these secrets to your GitHub repository (Settings → Secrets and variables → Actions):

```bash
# Required for Azure Static Web Apps deployment
AZURE_STATIC_WEB_APPS_API_TOKEN=<your-deployment-token-from-azure>

# Environment variables for the app
VITE_HEALRAG_BACKEND_URL=https://p32h-d-securitypolicies-rag-openai.azurewebsites.net
VITE_AZURE_CLIENT_ID=ca956c53-f360-4005-9191-35dc3fa3c1d3
VITE_AZURE_STORAGE_ACCOUNT_NAME=point32data
VITE_AZURE_CONTAINER_NAME=security-documents
```

**How to get the deployment token**:
1. Go to Azure Portal → Static Web Apps → healrag-security-fe
2. Go to Overview → Manage deployment token
3. Copy the token value

### Environment Variables

#### Local Development (.env)
```env
# Backend API Configuration
VITE_HEALRAG_BACKEND_URL=http://localhost:8000

# Azure AD Configuration (from your App Registration)
VITE_AZURE_CLIENT_ID=ca956c53-f360-4005-9191-35dc3fa3c1d3

# Azure Storage Configuration (for citations)
VITE_AZURE_STORAGE_ACCOUNT_NAME=point32data
VITE_AZURE_CONTAINER_NAME=security-documents

# Optional: Additional development settings
VITE_DEBUG_MODE=true
VITE_APP_TITLE=HEALRAG Security Assistant
```

#### Production (Azure Static Web Apps Environment Variables)
```bash
# Set these in Azure Portal → Static Web Apps → Configuration
VITE_HEALRAG_BACKEND_URL=https://p32h-d-securitypolicies-rag-openai.azurewebsites.net
VITE_AZURE_CLIENT_ID=ca956c53-f360-4005-9191-35dc3fa3c1d3
VITE_AZURE_STORAGE_ACCOUNT_NAME=point32data
VITE_AZURE_CONTAINER_NAME=security-documents
VITE_APP_TITLE=HEALRAG Security Assistant
VITE_DEBUG_MODE=false
```

### Azure Static Web App Configuration

1. **Current Configuration**:
   - Resource Group: `medical`
   - Name: `healrag-security-fe`
   - Plan type: `Standard`
   - Region: `East US 2`
   - URL: `https://blue-dune-0ef76e10f2.azurestaticapps.net`

2. **Build Configuration**:
   ```yaml
   # GitHub Actions Configuration
   App location: "/"
   Api location: "" (leave empty)
   Output location: "dist"
   ```

3. **Environment Variables** (in Azure Portal):
   - Go to Configuration → Environment variables
   - Add the production environment variables listed above

## 🔧 Local Development

### Prerequisites

- Node.js 20+ (see `.nvmrc`)
- npm or yarn
- Access to HEALRAG backend API
- Azure Storage account access (for citations)

### Installation

1. **Clone and install dependencies**:
   ```bash
   git clone https://github.com/kkahol-toronto/healrag_frontend.git
   cd frontend_healrag
   npm install
   ```

2. **Configure environment**:
   ```bash
   cp .env.example .env
   # Edit .env with your settings (see Environment Variables section)
   ```

3. **Start development server**:
   ```bash
   npm run dev
   ```

4. **Open browser**: `http://localhost:3000` (or the port shown in terminal)

### Available Scripts

```bash
npm run dev      # Start development server
npm run build    # Build for production
npm run preview  # Preview production build
npm run lint     # Run ESLint
npm run format   # Format code with Prettier
npm start        # Alias for npm run dev
```

## 🏗️ Architecture

### Component Structure
```
src/
├── api/                 # Backend integration (HEALRAG API)
│   ├── api.ts          # Main API functions with citation support
│   ├── models.ts       # TypeScript interfaces
│   └── index.ts        # API exports
├── components/
│   ├── Answer/          # AI response display with citations
│   ├── AnalysisPanel/   # Citation viewer with close button
│   ├── HistoryPanel/    # Chat session management
│   ├── QuestionInput/   # User input with file upload
│   ├── Settings/        # Temperature and model settings
│   ├── LoginButton/     # Azure AD authentication
│   └── MarkdownViewer/ # Document content viewer
├── pages/
│   ├── chat/           # Main chat interface
│   ├── ask/            # Single question interface
│   └── layout/         # App layout wrapper
└── authConfig.ts       # Azure AD MSAL configuration
```

### Citation System Architecture
1. **Backend Response**: Citations formatted as `[filename.md]` in response text
2. **Frontend Parsing**: Regex extraction of citation filenames
3. **Numbered Display**: Citations shown as clickable numbered links (1, 2, 3...)
4. **Backend Proxy**: `/citation/<filename>` endpoint for secure file access
5. **SAS Authentication**: Server-side SAS URL generation for Azure Blob Storage
6. **Content Display**: MarkdownViewer component for .md files, iframe for others

### Authentication Flow
1. User clicks login → Redirected to Azure AD
2. Azure AD authenticates → Returns to backend callback
3. Backend validates token → Redirects to frontend with token
4. Frontend stores token → Makes authenticated API calls

### API Integration
- **Base URL**: Environment-specific (localhost:8000 or Azure backend)
- **Authentication**: Bearer token from Azure AD
- **Endpoints**: RAG queries, chat history, document search, citation access
- **Streaming**: Server-Sent Events for real-time responses

## 🛡️ Security Configuration

### Content Security Policy
The app uses a simplified CSP in `staticwebapp.config.json`:
```json
{
  "routes": [
    {
      "route": "/*",
      "serve": "/index.html",
      "statusCode": 200
    }
  ],
  "mimeTypes": {
    ".json": "application/json"
  }
}
```

### CORS Configuration
Backend must allow your frontend domains:
- `https://blue-dune-0ef76e10f2.azurestaticapps.net`
- `http://localhost:3000` (development)

### Azure Blob Storage Security
- **SAS Token Authentication**: Server-side generation prevents key exposure
- **Backend Proxy**: Files accessed via backend proxy, not direct blob URLs
- **CORS Headers**: Proper Access-Control-Allow-Origin headers for cross-origin requests

## 🔄 CI/CD Pipeline

### GitHub Actions Workflow
The repository includes `.github/workflows/azure-static-web-apps.yml`:

```yaml
# Automatically builds and deploys on push to main
# Uses GitHub secrets for configuration
# Builds with Vite and deploys to Azure Static Web Apps
```

### Deployment Process
1. **Push to main branch**
2. **GitHub Actions triggers**:
   - Installs dependencies
   - Sets environment variables from secrets
   - Builds production bundle with Vite
   - Deploys to Azure Static Web Apps
3. **Azure propagates changes** (may take 5-10 minutes)

### Manual Deployment Trigger
```bash
# Create empty commit to trigger deployment
git commit --allow-empty -m "Trigger deployment"
git push origin main
```

## 📊 Backend Requirements

Your HEALRAG backend must provide these endpoints:

### Authentication
- `GET /auth/login` - Azure AD login redirect
- `GET /auth/callback` - OAuth callback handler  
- `GET /auth/me` - Get current user info

### Chat & RAG
- `POST /rag/query` - Generate RAG response
- `POST /rag/stream` - Streaming RAG response
- `POST /search/documents` - Document search

### Citation System
- `GET /citation/<filename>` - Secure document access via backend proxy
- **Requirements**: SAS token generation, blob storage integration, proper CORS headers

### History Management
- `POST /sessions/history` - Get session history
- `GET /sessions/user` - Get user sessions
- `DELETE /sessions/{session_id}` - Delete session

### Health Checks
- `GET /health` - System health status
- `GET /config` - System configuration

## 🚨 Troubleshooting

### Common Issues

**1. Citations not clickable**
- Check backend response format includes `[filename.md]` citations
- Verify source data structure in API responses
- Check browser console for JavaScript errors

**2. Citation files not loading**
- Verify Azure Storage connection string in backend
- Check `/citation/<filename>` endpoint accessibility
- Confirm SAS token generation in backend
- Validate CORS headers in backend response

**3. Blank page after deployment**
- Check browser console for errors
- Verify environment variables in Azure Static Web Apps
- Check CSP configuration in `staticwebapp.config.json`

**4. Authentication failures**
- Verify Azure AD client ID matches
- Check redirect URIs in app registration
- Confirm backend CORS settings

**5. API connection issues**
- Verify backend URL is correct and accessible
- Check network tab for failed requests
- Confirm authentication token is being sent

**6. Build failures**
- Check GitHub Actions logs
- Verify all environment variables are set
- Ensure Node.js version compatibility

### Citation System Troubleshooting
1. **Check citation format**: Backend should return `[filename.md]` format
2. **Verify blob storage**: Ensure files exist in `security-documents` container
3. **Test backend proxy**: Direct access to `/citation/<filename>` endpoint
4. **Check browser network**: Look for 404/401 errors on citation requests
5. **Validate SAS tokens**: Ensure backend generates valid SAS URLs

### Debug Steps
1. Check browser console for JavaScript errors
2. Verify network requests in DevTools
3. Check Azure Static Web Apps logs
4. Validate environment variables
5. Test backend endpoints directly
6. Check GitHub Actions deployment logs

## 📝 Recent Updates

### v2.0 - Citation System Overhaul
- ✅ Fixed citation parsing and display
- ✅ Implemented Azure Blob Storage integration
- ✅ Added backend proxy for secure file access
- ✅ Enhanced UX with close button and improved design
- ✅ Resolved CORS issues with proper headers

### v1.9 - UI Improvements
- ✅ Added close button to citation panel
- ✅ Improved responsive design
- ✅ Enhanced error handling

### v1.8 - Backend Integration
- ✅ Streaming response support
- ✅ Session management
- ✅ Authentication improvements

## 📝 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🤝 Support

For issues related to:
- **Frontend**: Check GitHub issues or create new one
- **Backend Integration**: Verify API endpoints and authentication
- **Azure Deployment**: Check Azure Static Web Apps documentation
- **Authentication**: Review Azure AD app registration settings
- **Citations**: Check Azure Blob Storage configuration and backend proxy setup

**Repository**: https://github.com/kkahol-toronto/healrag_frontend
**Live Application**: https://blue-dune-0ef76e10f2.azurestaticapps.net
