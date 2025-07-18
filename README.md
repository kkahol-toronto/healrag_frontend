# HEALRAG Security Assistant Frontend

This is a React TypeScript frontend application for the HEALRAG (Health Risk Assessment Language Retrieval Augmented Generation) system. It provides a modern, secure chat interface for interacting with AI-powered security policy assistance.

## Features

- **Azure AD Authentication**: Secure authentication with Azure Active Directory
- **Chat Interface**: Multi-turn conversation support with session history
- **Document Search**: RAG-powered document retrieval and analysis
- **Session Management**: Persistent chat history with CosmoDB integration
- **AI-Powered History Titles**: Intelligent conversation titles using backend summarization
- **Two-Line History Display**: Date/time and AI-generated titles in clean format
- **Responsive Design**: Mobile-friendly interface optimized for security workflows
- **Point32 Branding**: Custom UI with Point32 Health branding
- **Real-time Streaming**: Streaming responses for better user experience
- **Maximum Strictness Mode**: AI responses optimized for accuracy and consistency

## 🚀 Deployment Setup

### Azure App Registration

1. **Create Azure AD App Registration**:
   - Go to Azure Portal → Azure Active Directory → App registrations
   - Click "New registration"
   - Name: `HEALRAG Security Assistant`
   - Supported account types: `Accounts in this organizational directory only`
   - Redirect URI: `Web` → `https://your-static-app-url.azurestaticapps.net` (configure after deployment)

2. **Configure Authentication**:
   - Go to Authentication → Add platform → Web
   - Add redirect URIs:
     - `https://your-backend-url.azurewebsites.net/auth/callback`
     - `https://your-static-app-url.azurestaticapps.net`
   - Enable "Access tokens" and "ID tokens"
   - Set logout URL: `https://your-static-app-url.azurestaticapps.net`

3. **API Permissions**:
   - Add `Microsoft Graph` → `User.Read` (delegated)
   - Grant admin consent

4. **Certificates & Secrets**:
   - Create a new client secret (note the value - you'll need it for backend configuration)

### GitHub Secrets Setup

Add these secrets to your GitHub repository (Settings → Secrets and variables → Actions):

```bash
# Required for Azure Static Web Apps deployment
AZURE_STATIC_WEB_APPS_API_TOKEN=<your-deployment-token-from-azure>

# Environment variables for the app
VITE_HEALRAG_BACKEND_URL=https://p32h-d-securitypolicies-rag-openai.azurewebsites.net
VITE_AZURE_CLIENT_ID=ca956c53-f360-4005-9191-35dc3fa3c1d3
```

**How to get the deployment token**:
1. Go to Azure Portal → Static Web Apps → Your app
2. Go to Overview → Manage deployment token
3. Copy the token value

### Environment Variables

#### Local Development (.env.local)
```env
# Backend API Configuration
VITE_HEALRAG_BACKEND_URL=http://localhost:8000

# Azure AD Configuration (from your App Registration)
VITE_AZURE_CLIENT_ID=ca956c53-f360-4005-9191-35dc3fa3c1d3

# Optional: Additional development settings
VITE_DEBUG_MODE=true
```

#### Production (Azure Static Web Apps Environment Variables)
```bash
# Set these in Azure Portal → Static Web Apps → Configuration
VITE_HEALRAG_BACKEND_URL=https://p32h-d-securitypolicies-rag-openai.azurewebsites.net
VITE_AZURE_CLIENT_ID=ca956c53-f360-4005-9191-35dc3fa3c1d3
```

### Azure Static Web App Configuration

1. **Create Azure Static Web App**:
   - Resource Group: Choose or create
   - Name: `healrag-frontend`
   - Plan type: `Standard` (for environment variables support)
   - Region: `East US 2` (same as backend)
   - Deployment source: `GitHub` or `Other` (for manual deployment)

2. **Build Configuration**:
   ```yaml
   # In Azure Portal or GitHub Actions
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

### Installation

1. **Clone and install dependencies**:
   ```bash
   git clone <your-repo-url>
   cd frontend_healrag
   npm install
   ```

2. **Configure environment**:
   ```bash
   cp .env.example .env.local
   # Edit .env.local with your settings
   ```

3. **Start development server**:
   ```bash
   npm run dev
   ```

4. **Open browser**: `http://localhost:3000`

### Available Scripts

```bash
npm run dev      # Start development server
npm run build    # Build for production
npm run preview  # Preview production build
npm run lint     # Run ESLint
npm run format   # Format code with Prettier
```

## 🏗️ Architecture

### Component Structure
```
src/
├── api/                 # Backend integration (HEALRAG API)
│   ├── api.ts          # Core API functions including title summarizer
│   ├── models.ts       # TypeScript interfaces
│   └── index.ts        # API exports
├── components/
│   ├── Answer/          # AI response display with citations
│   ├── HistoryPanel/    # Chat session management with AI titles
│   ├── HistoryItem/     # Individual history entry with two-line display
│   ├── QuestionInput/   # User input with session clearing
│   ├── ClearChatButton/ # Chat clearing functionality
│   └── LoginButton/     # Azure AD authentication
├── pages/
│   ├── chat/           # Main chat interface
│   └── layout/         # App layout wrapper
└── authConfig.ts       # Azure AD MSAL configuration
```

### Authentication Flow
1. User clicks login → Redirected to Azure AD
2. Azure AD authenticates → Returns to backend callback
3. Backend validates token → Redirects to frontend with token
4. Frontend stores token → Makes authenticated API calls

### API Integration
- **Base URL**: Environment-specific (localhost:8000 or Azure backend)
- **Authentication**: Bearer token from Azure AD
- **Endpoints**: RAG queries, chat history, document search, title summarization
- **Streaming**: Server-Sent Events for real-time responses

### Conversation History Features

#### AI-Powered Titles
- **Backend Integration**: Uses `/title-summarizer` endpoint for intelligent titles
- **4-Word Limit**: Generates concise, meaningful conversation titles
- **Fallback System**: Falls back to first 4 words of query if AI fails
- **Caching**: In-memory cache to avoid redundant API calls
- **Error Handling**: Graceful degradation with timeout protection

#### Two-Line Display Format
```
7/18/2025 3:45 PM
Lost Laptop Recovery Steps
```
- **Line 1**: Date and time (gray, smaller font)
- **Line 2**: AI-generated title (black, bold font)
- **Responsive Layout**: Optimized for 350px panel width

#### History Management
- **Last 10 Conversations**: Displays exactly 10 most recent sessions
- **Session Clearing**: Broom icon clears current session (not server history)
- **Individual Deletion**: Trash can icon deletes specific history entries
- **Grouped by Date**: Today, Yesterday, Last 7 days, Last 30 days

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
- `https://your-static-app-url.azurestaticapps.net`
- `http://localhost:3000` (development)

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
   - Builds production bundle
   - Deploys to Azure Static Web Apps
3. **Azure propagates changes** (may take 5-10 minutes)

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

### History Management
- `POST /sessions/history` - Get session history
- `GET /sessions/user` - Get user sessions
- `DELETE /sessions/{session_id}` - Delete session
- `POST /title-summarizer` - Generate AI-powered conversation titles

### Health Checks
- `GET /health` - System health status
- `GET /config` - System configuration

## 🚨 Troubleshooting

### Common Issues

**1. Blank page after deployment**
- Check browser console for errors
- Verify environment variables in Azure
- Check CSP configuration in `staticwebapp.config.json`

**2. Authentication failures**
- Verify Azure AD client ID matches
- Check redirect URIs in app registration
- Confirm backend CORS settings

**3. API connection issues**
- Verify backend URL is correct and accessible
- Check network tab for failed requests
- Confirm authentication token is being sent

**4. Build failures**
- Check GitHub Actions logs
- Verify all environment variables are set
- Ensure Node.js version compatibility

**5. Conversation history issues**
- Verify `/title-summarizer` endpoint is available on backend
- Check browser console for title generation errors
- Ensure backend returns `summary` field in title response
- Verify authentication token is valid for history API calls

### Debug Steps
1. Check browser console for JavaScript errors
2. Verify network requests in DevTools
3. Check Azure Static Web Apps logs
4. Validate environment variables
5. Test backend endpoints directly

## 📝 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🤝 Support

For issues related to:
- **Frontend**: Check GitHub issues or create new one
- **Backend Integration**: Verify API endpoints and authentication
- **Azure Deployment**: Check Azure Static Web Apps documentation
- **Authentication**: Review Azure AD app registration settings
